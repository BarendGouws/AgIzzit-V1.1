// pages/api/manage/inventory/[itemId]/documents/[documentId].js

import { getToken } from 'next-auth/jwt';
import db from "@/utils/db";
import { listingBaseModel } from "@/models/Listings";
import { BlobServiceClient } from "@azure/storage-blob";

export default async function handler(req, res) {
  
  try {

    if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || !token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });

    const { itemId, documentId } = req.query;

    await db.connect();

    const item = await listingBaseModel
    .findById(itemId)
    .populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })
    .populate({ path: 'changes.changedBy', select: 'fullNames' }) 
    .populate({ path: 'images.uploadedBy', select: 'fullNames' })  
    .populate({ path: 'videos.uploadedBy', select: 'fullNames' })  
    .populate({ path: 'documents.uploadedBy', select: 'fullNames' })  
    .populate({ path: 'auctions', select: 'title auctionType startDate endDate auctionStarted auctionEnded items' })
    .select('-__v') 

    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Find the document in the array
    const document = item.documents.id(documentId);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // Delete from Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
    const containerClient = blobServiceClient.getContainerClient("documents");
    
    // Get filename from URL
    const filename = document.url.split('/').pop();
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.delete();

    // Remove document from array
    item.documents.pull(documentId);
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
      message: 'Document deleted successfully' 
    });

  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}