// /api/manage/inventory/auctions/[auctionId].js
import db from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { Auctions } from "@/models/Auctions";
import { listingBaseModel } from "@/models/Listings";
import colors from "colors";
import timestamp from "console-timestamp";

export default async function handler(req, res) {

  try {    
    
    if (req.method === "GET") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token || !token.isStaffMember) return res.status(401).json({ message: "Unauthorized" });

      await db.connect();

      const { auctionId } = req.query; // `auctionId` is now the _id of a subdocument in `auctions.items`

      const auction = await Auctions.findOne({ "items._id": auctionId }).populate("items.listing").lean();

      if (!auction) return res.status(404).json({ message: "Auction item not found." });

      // 2) Extract the relevant item subdocument
      const item = auction.items.find((i) => i._id.toString() === auctionId);
      if (!item) return res.status(404).json({ message: "Auction item not found." });

      return res.status(200).json({        
          item,
          auction: {
            _id: auction._id,
            auctionType: auction.auctionType,
            startDate: auction.startDate,
            endDate: auction.endDate,
            title: auction.title,
          },
      });

    }else if (req.method === "DELETE") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token || !token.isStaffMember) return res.status(401).json({ message: "Unauthorized" });
    
      await db.connect();

      const { auctionId, itemId } = req.query; 
      // "auctionId" is actually subdocId

      // 1) Find the parent Auction doc that has an item subdoc with _id=auctionId
      const auction = await Auctions.findOne({ "items._id": auctionId, "items.listing": itemId });
      if (!auction) {
        return res.status(404).json({ message: "No matching auction subdocument found." });
      }

      // 2) Remove that subdoc
      const idx = auction.items.findIndex(item => item._id.toString() === auctionId);
      auction.items.splice(idx, 1);

      // 3) Remove the *auction* doc ID from the listing
      const listing = await listingBaseModel.findById(itemId);
      listing.auctions = listing.auctions.filter(
        (aucId) => aucId.toString() !== auction._id.toString()
      );
      await listing.save();

      // 4) If no items left, remove the entire Auction
      if (auction.items.length === 0) {
        await Auctions.findByIdAndDelete(auction._id);
      } else {
        await auction.save();
      }  
    
      // 6) Re-fetch that listing to return an updated version
      const updatedItem = await listingBaseModel
        .findById(itemId)
        .populate({ path: "organization", select: "registeredName websiteUrl categories type" })
        .populate({ path: "changes.changedBy", select: "fullNames" })
        .populate({ path: "images.uploadedBy", select: "fullNames" })
        .populate({ path: "videos.uploadedBy", select: "fullNames" })
        .populate({ path: "documents.uploadedBy", select: "fullNames" })
        .populate({ path: "auctions", select: "title auctionType startDate endDate auctionStarted auctionEnded items" })
        .lean();
    
      // 7) Flatten auctions array as needed
      if (updatedItem && updatedItem.auctions) {
        updatedItem.auctions = updatedItem.auctions.map((auc) => {
          const matchingItem = auc.items?.[0];
          const { updatedItem, ...auctionWithoutItems } = auc;
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
        message: "Auction removed successfully."
      });

    }else {
      return res.status(405).json({ message: "Method not allowed." });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/inventory/auctions/[auctionId]")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
