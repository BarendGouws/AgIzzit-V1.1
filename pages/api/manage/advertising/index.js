import Advertising from '@/models/Advertising';
import Organization from '@/models/Organization';
import AdvertisingTemplate from '@/models/AdvertisingTemplate';
import { listingBaseModel } from '@/models/Listings';
import colors from 'colors';
import timestamp from 'console-timestamp';
import db from '@/utils/db';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas, loadImage, registerFont } from 'canvas';
import sharp from 'sharp';
import { BlobServiceClient } from '@azure/storage-blob';

const fonts = [
  // Family, Folder, Weights/Styles
  { family: 'Roboto', folder: 'roboto' },
  { family: 'Roboto Condensed', folder: 'roboto-condensed' },
  { family: 'Roboto Mono', folder: 'roboto-mono' },
  { family: 'Open Sans', folder: 'open-sans' },
  { family: 'Montserrat', folder: 'montserrat' },
  { family: 'Lato', folder: 'lato' },
  { family: 'Cabin', folder: 'cabin' },
  { family: 'Playfair Display', folder: 'playfair-display' },
  { family: 'Comic Neue', folder: 'comic-neue' },
  { family: 'Ubuntu', folder: 'ubuntu' },
  { family: 'Archivo', folder: 'archivo' },
  { family: 'Barlow Condensed', folder: 'barlow-condensed' },
  { family: 'Bodoni Moda', folder: 'bodoni-moda' },
  { family: 'Chivo', folder: 'chivo' },
  { family: 'Almendra', folder: 'almendra' },
];

const fontVariants = [
  { file: 'Regular.ttf' },
  { file: 'Bold.ttf', weight: 'bold' },
  { file: 'Italic.ttf', style: 'italic' },
  { file: 'BoldItalic.ttf', weight: 'bold', style: 'italic' }
];

const fontDir = path.join(process.cwd(), 'public', 'fonts');

fonts.forEach(font => {
  fontVariants.forEach(variant => {
    const filePath = path.join(fontDir, font.folder, variant.file);
    if (fs.existsSync(filePath)) {
      try {
        registerFont(filePath, {
          family: font.family,
          ...(variant.weight && { weight: variant.weight }),
          ...(variant.style && { style: variant.style }),
        });
        console.log(`Registered: ${font.family} ${variant.file}`);
      } catch (err) {
        console.warn(`Failed to register ${font.family} ${variant.file}: ${err.message}`);
      }
    }
  });
});

const availableFonts = [
  'Roboto',
  'Open Sans', 
  'Montserrat',
  'Lato',
  'Cabin',
  'Playfair Display',
  'Roboto Mono',
  'Comic Neue'
];

// Canvas dimensions by ratio
const getTemplateDimensions = (designSize) => {
  const baseWidth = 1000;
  switch (designSize) {
    case '1:1': return { width: baseWidth, height: baseWidth };
    case '4:5': return { width: baseWidth, height: baseWidth * 5 / 4 };
    case '9:16': return { width: baseWidth, height: baseWidth * 16 / 9 };
    case '16:9': return { width: baseWidth, height: baseWidth * 9 / 16 };
    default:    return { width: baseWidth, height: baseWidth };
  }
};

const extractImageBuffer = async (dataUrl) => {
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) throw new Error('Invalid data URL');
    return Buffer.from(matches[2], 'base64');
  } catch (error) {
    console.error('Error extracting image data:', error);
    return null;
  }
};

const fetchImage = async (imageUrl) => {
  try {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('/')) {
      const localPath = path.join(process.cwd(), 'public', imageUrl);
      if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
    } else if (imageUrl.startsWith('http')) {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(imageUrl);
      if (response.ok) return Buffer.from(await response.arrayBuffer());
    }
    return null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

// Fabric-correct draw function for images, pictures, logos, backgrounds
function drawFabricImage(ctx, img, props) {
  const w = props.width * (props.scaleX || 1);
  const h = props.height * (props.scaleY || 1);
  const angle = (props.angle || 0) * Math.PI / 180;
  const left = props.left;
  const top = props.top;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(angle);
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();
}

// Filter listings utility
const filterListings = async (filters, organization) => {
  const baseQuery = { organization: organization._id };
  if (filters.category) baseQuery.category = filters.category;
  // add more filter logic here if needed
  try {
    const listings = await listingBaseModel.find(baseQuery)
      .limit(filters.limit || 100)
      .sort(filters.sort || { createdAt: -1 });
    return listings;
  } catch (error) {
    console.error('Error filtering listings:', error);
    return [];
  }
};

// Upload canvas to Azure Blob Storage
const uploadCanvasToAzure = async (canvas) => {
  try {
    const buffer = canvas.toBuffer('image/png');
    
    // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
    const containerClient = blobServiceClient.getContainerClient("designs");
    
    // Ensure container exists
    //await containerClient.createIfNotExists();

    // Generate unique filename
    const filename = `${uuidv4()}.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    
    // Upload to Azure
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: 'image/png',
        blobCacheControl: 'public, max-age=31536000'
      },
      metadata: {
        format: 'png',
        createdAt: new Date().toISOString()
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure:', error);
    throw error;
  }
};

// The main design/image renderer - now returns Azure URL
const generateDesignWithAzureUpload = async (listing, template) => {
  try {
    const { width, height } = getTemplateDimensions(template.designSize);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; 
    ctx.fillRect(0, 0, width, height);

    // Render from bottom (bg) to top
    const sortedLayers = [...template.layers].reverse();
    for (const layer of sortedLayers) {
      if (!layer.visible || !layer.properties) continue;
      const props = layer.properties;

      switch (layer.type) {
        case 'design': {
          if (props.imageData) {
            const imageBuffer = await extractImageBuffer(props.imageData);
            if (imageBuffer) {
              const img = await loadImage(imageBuffer);
              drawFabricImage(ctx, img, { ...props, left: 0, top: 0, angle: 0, scaleX: width/img.width, scaleY: height/img.height, width: img.width, height: img.height });
            }
          }
          break;
        }
        case 'image': {
          let imageBuffer = null;
          if (listing.images && listing.images.length > 0) {
            const imageIndex = props.imageIndex !== undefined ? Math.min(props.imageIndex, listing.images.length - 1) : 0;
            if (imageIndex >= 0 && listing.images[imageIndex]) {
              imageBuffer = await fetchImage(listing.images[imageIndex].url);
            }
          }
          if (!imageBuffer) continue;
          const img = await loadImage(imageBuffer);
          drawFabricImage(ctx, img, props);
          break;
        }
        case 'picture': {
          if (!props.imageData) continue;
          const img = await loadImage(props.imageData);
          drawFabricImage(ctx, img, props);
          break;
        }        
        case 'text': {
          const textContent = (() => {
            if (props.variable && listing.texts && listing.texts[props.variable]) return String(listing.texts[props.variable]);
            if (props.text && typeof props.text === 'string') return props.text;
            return '';
          })();
          if (!textContent) continue;

          const left = props.left, top = props.top;
          const textWidth = props.width * (props.scaleX || 1), textHeight = props.height * (props.scaleY || 1);
          const fontSize = props.fontSize || 36;
          const color = props.color || '#000000';
          const align = props.textAlign || 'left';
          const angle = (props.angle || 0) * Math.PI / 180;
          const fontFamily = props.fontFamily || 'Arial';
          let fontStyle = '';
          if (props.bold) fontStyle += 'bold ';
          if (props.italic) fontStyle += 'italic ';
          if (!fontStyle) fontStyle = 'normal ';

          ctx.save();
          ctx.translate(left, top);
          if (angle) {
            ctx.translate(textWidth / 2, textHeight / 2);
            ctx.rotate(angle);
            ctx.translate(-textWidth / 2, -textHeight / 2);
          }

          let minSize = 10, maxSize = Math.max(fontSize * 1.5, 72), optimalFontSize = fontSize;
          while (minSize <= maxSize) {
            const testSize = Math.floor((minSize + maxSize) / 2);
            ctx.font = `${fontStyle}${testSize}px ${fontFamily}`;
            const lineHeight = testSize * 1.2;
            const words = textContent.split(' ');
            let lines = [], currentLine = words[0] || '';
            for (let i = 1; i < words.length; i++) {
              const testLine = currentLine + ' ' + words[i];
              const metrics = ctx.measureText(testLine);
              if (metrics.width > textWidth - 10) {
                lines.push(currentLine);
                currentLine = words[i];
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
            const totalHeight = lines.length * lineHeight;
            if (totalHeight <= textHeight - 10) {
              optimalFontSize = testSize;
              minSize = testSize + 1;
            } else {
              maxSize = testSize - 1;
            }
          }
          ctx.font = `${fontStyle}${optimalFontSize}px ${fontFamily}`;
          ctx.fillStyle = color;
          const lineHeight = optimalFontSize * 1.2;
          const words = textContent.split(' ');
          let lines = [], currentLine = words[0] || '';
          for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > textWidth - 10) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
          let startY = (textHeight - lines.length * lineHeight) / 2;
          startY = Math.max(startY, 0);
          let textX;
          if (align === 'center') { textX = textWidth / 2; ctx.textAlign = 'center'; }
          else if (align === 'right') { textX = textWidth - 5; ctx.textAlign = 'right'; }
          else { textX = 5; ctx.textAlign = 'left'; }
          ctx.textBaseline = 'top';
          for (let i = 0; i < lines.length; i++) {
            const y = startY + i * lineHeight;
            ctx.fillText(lines[i], textX, y);
          }
          ctx.restore();
          break;
        }   
      }
    }

    // Upload to Azure and return URL
    const azureUrl = await uploadCanvasToAzure(canvas);
    return { success: true, url: azureUrl };
    
  } catch (error) {
    console.error('Error generating design:', error);
    return { success: false, error: error.message };
  }
};

// MAIN HANDLER
const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token || !token.organization || !token.organization._id) return res.status(401).json({ success: false, message: 'Unauthorized' });
      await db.connect();

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';
      const status = req.query.status || '';
      const skip = (page - 1) * limit;

      const query = { organization: token.organization._id };
      if (search) {
        const rx = new RegExp(search, 'i');
        query.$or = [{ name: rx }, { platform: rx }, { platformType: rx }];
      }
      if (status) query.status = status;

      const totalCount = await Advertising.countDocuments(query);
      const advertising = await Advertising.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const orgFilter = { organization: token.organization._id }
      const stats = {
        total: await Advertising.countDocuments(orgFilter),
        active: await Advertising.countDocuments({ ...orgFilter, status: 'active' }),
        paused: await Advertising.countDocuments({ ...orgFilter, status: 'paused' }),
        inactive: await Advertising.countDocuments({ ...orgFilter, status: 'inactive' })
      };

      return res.status(200).json({
        success: true,
        advertising,
        pagination: { currentPage: page, totalPages, totalCount, hasNextPage, hasPreviousPage },
        stats
      });

    } else if (req.method === 'POST') {
      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
      await db.connect();

      const org = await Organization.findById(token.organization._id).select('_id');
      if (!org) return res.status(404).json({ success: false, message: 'Organization not found.' });

      const newAdvertising = new Advertising({
        ...req.body,
        createdBy: token._id,
        organization: token.organization._id,
        inventory: [],
      });

      newAdvertising.feedUrl = `/feeds/${newAdvertising._id}`;
      let template = null;
      if (req.body.template) {
        template = await AdvertisingTemplate.findById(req.body.template);
        if (!template) return res.status(404).json({ success: false, message: 'Template not found.' });
      }

      const filteredListings = await filterListings(req.body.filters || {}, org);
      const inventoryItems = [];

      if (template && req.body.platform !== 'website') {
        for (const listing of filteredListings) {
          try {
            const result = await generateDesignWithAzureUpload(listing, template);
            inventoryItems.push({
              ...result,
              listing: listing._id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          } catch (error) {
            inventoryItems.push({
              success: false,
              url: null,
              error: `Error generating design: ${error.message}`,
              listing: listing._id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      } else {
        for (const listing of filteredListings) {
          inventoryItems.push({
            success: true,
            listing: listing._id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      newAdvertising.inventory = inventoryItems;
      await newAdvertising.save();

      return res.status(201).json({
        success: true,
        message: 'Feed created successfully',
        item: newAdvertising
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`
      });
    }
  } catch (err) {
    console.error(`${colors.red('error')} - ${err.message}, ${colors.yellow(req.method + ' /api/manage/advertising')} @ ${colors.blue(timestamp('DD-MM-YY hh:mm:ss'))}`);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default handler;