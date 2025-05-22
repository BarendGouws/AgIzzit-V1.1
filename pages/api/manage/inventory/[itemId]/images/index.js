import sharp from "sharp";
import Listings from "@/models/Listings";
import { listingBaseModel } from "@/models/Listings";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const processImage = async (inputBuffer, cropData = null) => {
  try {
    let sharpInstance = sharp(inputBuffer).rotate();
    const metadata = await sharp(inputBuffer).metadata();

    if (cropData) {

      // If image doesn't need cropping (already correct ratio), skip extraction
      const currentRatio = metadata.width / metadata.height;
      const targetRatio = 4/3;
      const tolerance = 0.02;

      if (Math.abs(currentRatio - targetRatio) <= tolerance) {
        console.log('Image already has correct ratio, skipping crop');
      } else {
        // Ensure crop dimensions don't exceed image bounds
        const safeArea = {
          left: Math.min(Math.round(cropData.x), metadata.width),
          top: Math.min(Math.round(cropData.y), metadata.height),
          width: Math.min(Math.round(cropData.width), metadata.width),
          height: Math.min(Math.round(cropData.height), metadata.height)
        };

        // Additional check to ensure width and height don't exceed bounds
        if (safeArea.left + safeArea.width > metadata.width) {
          safeArea.width = metadata.width - safeArea.left;
        }
        if (safeArea.top + safeArea.height > metadata.height) {
          safeArea.height = metadata.height - safeArea.top;
        }
      
        sharpInstance = sharpInstance.extract(safeArea);
      }
    }

    // Always resize to final dimensions
    return sharpInstance
      .resize({
        width: 1920,
        height: 1440,
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        force: true
      })
      .toBuffer();
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

const handler = async (req, res) => {

  try {

    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || !token?.organization?._id) return res.status(401).json({ message: "Unauthorized" });

    await db.connect();    

    const form = formidable({ 
      multiples: true,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const { itemId } = req.query;
    if (!itemId) return res.status(400).json({ message: "Inventory ID is required" });    

    const item = await listingBaseModel
    .findById(itemId)
    .populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })
    .populate({ path: 'changes.changedBy', select: 'fullNames' }) 
    .populate({ path: 'images.uploadedBy', select: 'fullNames' })  
    .populate({ path: 'videos.uploadedBy', select: 'fullNames' })  
    .populate({ path: 'documents.uploadedBy', select: 'fullNames' })  
    .populate({ path: 'auctions', select: 'title auctionType startDate endDate auctionStarted auctionEnded items' })
    .select('-__v')

    if (!item) return res.status(404).json({ message: "Inventory item not found." });

    if (!files.images || files.images.length === 0) return res.status(400).json({ message: "No images uploaded" });

    const cropData = fields.cropData ? JSON.parse(fields.cropData) : null; 

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
    const containerClient = blobServiceClient.getContainerClient("images");

    const uploadedImages = [];

    for (const file of files.images) {
      // Read file and process with Sharp
      const fileBuffer = await fs.promises.readFile(file.filepath);
      
      // Log original image info
      const imageInfo = await sharp(fileBuffer).metadata();

      const processedBuffer = await processImage(fileBuffer, cropData);
      
      // Verify processed image
      const processedInfo = await sharp(processedBuffer).metadata();    

      // Upload to Azure with correct content type and metadata
      const filename = `${uuidv4()}.jpg`;
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      
      await blockBlobClient.uploadData(processedBuffer, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg',
          blobCacheControl: 'public, max-age=31536000'
          // Remove blobContentEncoding and blobContentLanguage
        },
        metadata: {
          originalName: file.originalFilename,
          width: processedInfo.width?.toString(),
          height: processedInfo.height?.toString(),
          format: 'jpeg'
        }
      });

      uploadedImages.push({
        url: blockBlobClient.url,
        uploadedBy: token._id,
        width: processedInfo.width,
        height: processedInfo.height,
        originalName: file.originalFilename
      });

      // Cleanup temp file
      await fs.promises.unlink(file.filepath);
    }

    item.images.push(...uploadedImages);
    await item.save();    

    const updatedItem = item.toObject();

    if (updatedItem.auctions) {

      updatedItem.auctions = updatedItem.auctions.map(auction => {
          const matchingItem = auction.items?.[0];   
          const { updatedItem, ...auctionWithoutItems } = auction;
          return {
              ...auctionWithoutItems,
              openingBid: matchingItem?.openingBid || 0,
              currentBid: matchingItem?.currentBid || 0,
              _id: matchingItem?._id
              };
          });
    }

    return res.status(200).json({ 
      item: updatedItem, 
      message: "Images uploaded successfully" 
    });    

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/inventory/[itemId]/images")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;