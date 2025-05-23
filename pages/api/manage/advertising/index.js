import Advertising from '@/models/Advertising';
import Organization from '@/models/Organization';
import AdvertisingTemplate from '@/models/AdvertisingTemplate';
import { listingBaseModel } from '@/models/Listings';
import db from '@/utils/db';
import { getToken } from 'next-auth/jwt';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas, loadImage } from 'canvas';
import { BlobServiceClient } from '@azure/storage-blob';
import opentype from 'opentype.js';

// --- Dynamic Font Discovery ---
const fontDir = path.join(process.cwd(), 'public', 'fonts');

function getAvailableFontMap() {
  const fontMap = {};
  if (!fs.existsSync(fontDir)) return fontMap;
  const families = fs.readdirSync(fontDir).filter(folder =>
    fs.statSync(path.join(fontDir, folder)).isDirectory()
  );
  for (const folder of families) {
    const familyName = folder.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const folderPath = path.join(fontDir, folder);
    fontMap[familyName] = {};
    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.ttf'));
    for (const file of files) {
      const lc = file.toLowerCase();
      const variant =
        lc.includes('bolditalic') ? 'bolditalic' :
        (lc.includes('bold') && lc.includes('italic')) ? 'bolditalic' :
        lc.includes('bold') ? 'bold' :
        lc.includes('italic') ? 'italic' :
        'regular';
      fontMap[familyName][variant] = path.join(folderPath, file);
    }
  }
  return fontMap;
}

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

function drawFabricImage(ctx, img, props) {
  const w = props.width * (props.scaleX || 1);
  const h = props.height * (props.scaleY || 1);
  const angle = (props.angle || 0) * Math.PI / 180;
  ctx.save();
  ctx.translate(props.left, props.top);
  ctx.rotate(angle);
  ctx.drawImage(img, 0, 0, w, h);
  ctx.restore();
}

const generateDesignWithAzureUpload = async (listing, template) => {
  try {
    // 1. Discover all available fonts
    const fontMap = getAvailableFontMap();

    // --- Canvas dimensions by ratio ---
    const baseWidth = 1000;
    let width = baseWidth, height = baseWidth;
    switch (template.designSize) {
      case '4:5': width = baseWidth; height = baseWidth * 5 / 4; break;
      case '9:16': width = baseWidth; height = baseWidth * 16 / 9; break;
      case '16:9': width = baseWidth; height = baseWidth * 9 / 16; break;
      default: width = baseWidth; height = baseWidth;
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const sortedLayers = [...template.layers].reverse();
    for (const layer of sortedLayers) {
      if (!layer.visible || !layer.properties) continue;
      const props = layer.properties;

      // --- Background/base design ---
      if (layer.type === 'design' && props.imageData) {
        const imageBuffer = await extractImageBuffer(props.imageData);
        if (imageBuffer) {
          const img = await loadImage(imageBuffer);
          drawFabricImage(ctx, img, { ...props, left: 0, top: 0, angle: 0, scaleX: width / img.width, scaleY: height / img.height, width: img.width, height: img.height });
        }
      }

      // --- Inventory/stock photo ---
      else if (layer.type === 'image') {
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
      }

      // --- Inline picture (direct base64) ---
      else if (layer.type === 'picture' && props.imageData) {
        const img = await loadImage(props.imageData);
        drawFabricImage(ctx, img, props);
      }

      // --- Text layers (OpenType, color, vertical center, underline, alignment) ---
      else if (layer.type === 'text') {
        if (!props.variable || !listing[props.variable]) continue;
        let value = listing[props.variable];
        let textValue = '';
        if (props.format) {
          try {
            const variableName = props.variable;
            const formatFunction = new Function(variableName, `return ${props.format};`);
            textValue = formatFunction(value);
          } catch (err) {
            console.error('Format eval failed:', err);
            textValue = String(value);
          }
        } else {
          textValue = String(value);
        }

        const fontFamily = props.fontFamily;
        if (!fontMap[fontFamily]) throw new Error(`Font family not found: ${fontFamily}`);
        let fontFilePath;
        if (props.bold && props.italic && fontMap[fontFamily].bolditalic) fontFilePath = fontMap[fontFamily].bolditalic;
        else if (props.bold && fontMap[fontFamily].bold) fontFilePath = fontMap[fontFamily].bold;
        else if (props.italic && fontMap[fontFamily].italic) fontFilePath = fontMap[fontFamily].italic;
        else if (fontMap[fontFamily].regular) fontFilePath = fontMap[fontFamily].regular;
        else throw new Error(`No suitable font variant for "${fontFamily}" (bold=${props.bold}, italic=${props.italic})`);
        if (!fs.existsSync(fontFilePath)) throw new Error(`Font file not found at: ${fontFilePath}`);
        const font = opentype.loadSync(fontFilePath);

        // Text box, font size, line wrapping
        const x = props.left || 0;
        const y = props.top || 0;
        const boxWidth = props.width;
        const boxHeight = props.height;
        const angle = props.angle || 0;
        const align = props.textAlign || 'left';
        const lineHeightMult = 1.15;

        function wrapText(font, text, fontSize, maxWidth) {
          const words = text.split(' ');
          const lines = [];
          let current = words[0] || '';
          for (let i = 1; i < words.length; i++) {
            const testLine = current + ' ' + words[i];
            const width = font.getAdvanceWidth(testLine, fontSize);
            if (width > maxWidth - 10) {
              lines.push(current);
              current = words[i];
            } else {
              current = testLine;
            }
          }
          if (current) lines.push(current);
          return lines;
        }

        // Find largest font size that fits in box (binary search)
        let minFont = 8, maxFont = 200, fontSize = minFont, finalLines = [];
        while (minFont <= maxFont) {
          let mid = Math.floor((minFont + maxFont) / 2);
          let lines = wrapText(font, textValue, mid, boxWidth);
          const ascent = font.ascender * (mid / font.unitsPerEm);
          const descent = Math.abs(font.descender * (mid / font.unitsPerEm));
          const actualLineHeight = ascent + descent;
          let totalHeight = lines.length * actualLineHeight;
          if (totalHeight <= boxHeight) {
            fontSize = mid;
            finalLines = lines;
            minFont = mid + 1;
          } else {
            maxFont = mid - 1;
          }
        }

        // --- Draw text lines (inline fillGlyphPath logic) ---
        ctx.save();
        ctx.translate(x, y);
        if (angle) ctx.rotate(angle * Math.PI / 180);

        // Vertical centering
        const ascent = font.ascender * (fontSize / font.unitsPerEm);
        const descent = Math.abs(font.descender * (fontSize / font.unitsPerEm));
        const actualLineHeight = ascent + descent;
        const totalTextHeight = finalLines.length * actualLineHeight;
        let startY = (boxHeight - totalTextHeight) / 2 + ascent;

        for (let i = 0; i < finalLines.length; i++) {
          let line = finalLines[i];
          let textWidth = font.getAdvanceWidth(line, fontSize);
          let textX = 0;
          if (align === 'center') textX = boxWidth / 2 - textWidth / 2;
          else if (align === 'right') textX = boxWidth - textWidth;
          let textY = startY + i * actualLineHeight;

          // --- Inline OpenType path rendering with color ---
          const pathObj = font.getPath(line, textX, textY, fontSize);
          ctx.save();
          ctx.beginPath();
          for (let j = 0; j < pathObj.commands.length; j++) {
            const cmd = pathObj.commands[j];
            if (cmd.type === 'M') ctx.moveTo(cmd.x, cmd.y);
            else if (cmd.type === 'L') ctx.lineTo(cmd.x, cmd.y);
            else if (cmd.type === 'C') ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
            else if (cmd.type === 'Q') ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
            else if (cmd.type === 'Z') ctx.closePath();
          }
          ctx.fillStyle = props.color || '#000';
          ctx.fill();
          ctx.restore();

          // Underline
          if (props.underline) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(textX, textY + descent * 0.5);
            ctx.lineTo(textX + textWidth, textY + descent * 0.5);
            ctx.strokeStyle = props.color || '#000';
            ctx.lineWidth = Math.max(1, fontSize * 0.05);
            ctx.stroke();
            ctx.restore();
          }
        }
        ctx.restore();
      }
    }

    // --- Inline upload to Azure ---
    const buffer = canvas.toBuffer('image/png');
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
    const containerClient = blobServiceClient.getContainerClient("designs");
    const filename = `${uuidv4()}.png`;
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
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
    return { success: true, url: blockBlobClient.url };

  } catch (error) {
    console.error('Error generating design:', error);
    return { success: false, error: error.message };
  }
};

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

      const filteredListings = await listingBaseModel.find({ organization: org._id })
        .limit(req.body.filters?.limit || 100)
        .sort(req.body.filters?.sort || { createdAt: -1 });

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
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default handler;
