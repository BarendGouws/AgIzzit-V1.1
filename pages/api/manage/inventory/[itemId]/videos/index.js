// pages/api/manage/inventory/[itemId]/videos/index.js

import { getToken } from 'next-auth/jwt';
import db from "@/utils/db";
import { v4 as uuidv4 } from "uuid";
import { listingBaseModel } from "@/models/Listings";
import { BlobServiceClient } from "@azure/storage-blob";
import axios from 'axios';

export default async function handler(req, res) {  

  try {

    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    if (!token || !token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });

    const { itemId } = req.query;
    const { videoId, url, caption } = req.body;

    if (!itemId || !videoId || !url) return res.status(400).json({ message: 'Missing required fields' });

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

    if (!item) return res.status(404).json({ message: 'Item not found' });    
   
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    let thumbnailResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer',validateStatus: function (status) { return status >= 200 && status < 500;}});

    if (thumbnailResponse.status !== 200) { 
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      thumbnailResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
    }

    const thumbnailBuffer = Buffer.from(thumbnailResponse.data);

    // Upload to Azure
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI); 
    const containerClient = blobServiceClient.getContainerClient("thumbnails");

    // Upload thumbnail
    const blobName = `${uuidv4()}.jpg`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.uploadData(thumbnailBuffer, {
      blobHTTPHeaders: {
        blobContentType: 'image/jpeg',
        blobCacheControl: 'public, max-age=31536000'
      }
    });

    // Add to item
    if (!item.videos) item.videos = [];

    item.videos.push({
        videoId,
        url,
        caption: caption || '',
        thumbnailUrl: blockBlobClient.url,
        uploadedBy: token._id,     
    });

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
      message: 'Video added successfully'      
    });

  } catch (error) {
    console.error('Error handling video upload:', error);
    return res.status(500).json({ message: 'Error uploading video', error: error.message });
  }
}