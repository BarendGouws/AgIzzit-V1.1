// pages/api/manage/inventory/[itemId]/documents/index.js
import { generateDocumentType } from '@/utils/openai';
import { getToken } from 'next-auth/jwt';
import db from "@/utils/db";
import { listingBaseModel } from "@/models/Listings";
import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import pdf from 'pdf-parse';
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
    
  try {

      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

      const token = await getToken({ req, secret: process.env.JWT_SECRET });

      if (!token || !token?.organization?._id) return res.status(401).json({ message: "Unauthorized" });

      const { itemId } = req.query;
      if(!itemId) return res.status(400).json({ message: "Item ID is required" });

      await db.connect();

      const item = await listingBaseModel
      .findById(itemId)
      .populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })
      .populate({ path: 'changes.changedBy', select: 'fullNames' }) 
      .populate({ path: 'images.uploadedBy', select: 'fullNames' })  
      .populate({ path: 'videos.uploadedBy', select: 'fullNames' })  
      .populate({ path: 'documents.uploadedBy', select: 'fullNames' })  
      .populate({ path: 'auctions', select: 'title auctionType startDate endDate auctionStarted auctionEnded items' })
      .select('-__v');
      
      if (!item) return res.status(404).json({ message: "Item not found" });

      const form = formidable({ multiples: true });
      const [_, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      if (!files.documents || files.documents.length === 0) return res.status(400).json({ message: "No documents uploaded" });

      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
      const containerClient = blobServiceClient.getContainerClient(process.env.PUBLIC_DOCUMENTS_CONTAINER); 

      const uploadedDocs = [];

      for (const file of files.documents) { 

        if (path.extname(file.originalFilename) !== '.pdf') return res.status(400).json({ message: "Please upload PDF files only" });

        const fileBuffer = await fs.promises.readFile(file.filepath);
        const filename = `${uuidv4()}${path.extname(file.originalFilename)}`;
        const blockBlobClient = containerClient.getBlockBlobClient(filename); 

        await blockBlobClient.uploadData(fileBuffer, { blobHTTPHeaders: { blobContentType: 'application/pdf'}}); 

        const pdfData = await pdf(fileBuffer);
        const pdfText = pdfData.text;

        const generatedName = await generateDocumentType(pdfText, token.organization.type);

        uploadedDocs.push({
          url: blockBlobClient.url, 
          caption: generatedName,       
          uploadedBy: token._id,    
        });

      }

      // Initialize documents array if it doesn't exist
      if (!item.documents) item.documents = [];
      
      item.documents.push(...uploadedDocs);
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
        message: "Documents uploaded successfully" 
      });    

  } catch (error) {
    console.error('Document handling error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default handler;