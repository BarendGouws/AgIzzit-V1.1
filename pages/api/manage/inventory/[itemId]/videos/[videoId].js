// pages/api/manage/inventory/[itemId]/videos/[videoId].js

import { getToken } from 'next-auth/jwt';
import db from "@/utils/db";
import { listingBaseModel } from "@/models/Listings";
import { BlobServiceClient } from "@azure/storage-blob";

export default async function handler(req, res) {  

  try {

    if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || !token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });

    const { itemId, videoId } = req.query;

    if (!itemId || !videoId) return res.status(400).json({ message: 'Missing required fields' });

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

    // Find the video to get its thumbnail URL
    const video = item.videos.find(v => v._id.toString() === videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Extract the filename from the thumbnail URL
    const thumbnailUrl = new URL(video.thumbnailUrl);
    const filename = thumbnailUrl.pathname.split('/').pop();

    // Delete thumbnail from Azure
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
    const containerClient = blobServiceClient.getContainerClient("thumbnails");
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    
    try {
      await blockBlobClient.delete();
    } catch (error) {
      console.error('Error deleting thumbnail from Azure:', error); 
    }

    // Remove video from item
    item.videos = item.videos.filter(v => v._id.toString() !== videoId);
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
      message: 'Video deleted successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error('Error handling video deletion:', error);
    return res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
}