import db from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { Auctions } from "@/models/Auctions"; 
import { listingBaseModel } from "@/models/Listings";
import Organization from "@/models/Organization";
import colors from "colors";
import timestamp from "console-timestamp";

const handler = async (req, res) => {

  try {

    if (req.method === "GET") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const { itemId } = req.query;

      if (!itemId) return res.status(400).json({ message: "Item ID is required." });

      await db.connect();

      // Pagination & query params
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = req.query.sort || "-startDate";
      const search = req.query.search || "";
      const status = req.query.status || "";

      // Basic query object
      const query = {};

      // 1) Only get auctions that contain this listing item
      //    i.e. "items.listing": itemId
      query["items.listing"] = itemId;

      // 2) If searching by title or auctionType
      if (search) {
        // Combine with existing query using $and or $and + $or
        // so we only get auctions that match BOTH itemId and search terms
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { auctionType: { $regex: search, $options: "i" } }
        ];
      }

      // 3) Handle "active", "upcoming", "ended" filters
      const now = new Date();
      if (status === "active") {
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
      } else if (status === "upcoming") {
        query.startDate = { $gt: now };
      } else if (status === "ended") {
        query.endDate = { $lt: now };
      }

      // -------------------------
      // Fetch auctions with pagination
      // -------------------------
      const totalCount = await Auctions.countDocuments(query);

      let auctions = await Auctions.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("items.listing") // if you want the listing data
        .lean();

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      // -------------------------
      // Flatten each auction with the single matching item
      // -------------------------
      // Because we only want the item that references "itemId"
      // and attach its fields at the root level (openingBid, etc.)
      auctions = auctions.map((auction) => {
        // Find the item subdocument in auction.items
        const matchedItem = auction.items.find(
          (itm) => itm.listing && itm.listing._id?.toString() === itemId
        );

        // If none found (unexpected?), just return the auction minus items
        if (!matchedItem) {
          return {
            ...auction,
            items: [], // or remove it,
            openingBid: 0,
            currentBid: 0
          };
        }

        // Flatten fields from matchedItem:
        const {
          listing: _listing, // rename or discard if you only need certain fields
          openingBid,
          currentBid,
          currentPublicBidder,
          currentDealerBidder,
          purchasedByUser,
          purchasedByDealer,
          bids,
          ...restItemFields
        } = matchedItem;

        // Combine top-level auction fields + item fields
        return {
          ...auction,
          // Overwrite items array if you want it empty or remove it
          items: [],
          // Flatten item details
          openingBid: openingBid,
          currentBid: currentBid,
          currentPublicBidder,
          currentDealerBidder,
          purchasedByUser,
          purchasedByDealer,
          bids
          // you could also include restItemFields if needed
        };
      });

      // Return the single array of flattened auctions
      return res.status(200).json({
        auctions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage
        }
      });

    } else if (req.method === "POST") { 

        const token = await getToken({ req, secret: process.env.JWT_SECRET });
        if (!token) return res.status(401).json({ message: "Unauthorized" });
    
        await db.connect();  
      
        const { title, auctionType, startDate, endDate, item } = req.body;
        const { itemId } = req.query;  

        // single item in req.body is as in subdocument { listing, openingBid, currentBid, ... }
      
        // Validate staff or organization:
        if (!token.isStaffMember) return res.status(401).json({ message: "Only staff can create auctions." });
      
        // Optional: ensure we have an Organization
        const organization = await Organization.findById(token.organization._id);
        if (!organization) return res.status(404).json({ message: "Organization not found." });
      
        // Check if an existing auction with the same type, startDate, endDate
        const existing = await Auctions.findOne({
          auctionType,
          startDate: { $eq: startDate },
          endDate: { $eq: endDate },
        });
      
        let auctionDoc;
        if (existing) {
          // Update existing
          auctionDoc = existing;
      
          // See if this listing is already in items
          const alreadyIn = existing.items.find((itm) => itm.listing.toString() === itemId); //item.listing is the _id of the listing
          
          if(alreadyIn) return res.status(400).json({ message: "Already registered for this auction." });

          if (!alreadyIn) {
            existing.items.push({...item, listing: itemId }); //PUSH WITH LISTING ID
            await existing.save();
          }

        } else {
          // Create new Auction doc
          auctionDoc = await Auctions.create({
            title: title || `${auctionType} Auction`,
            auctionType,
            startDate,
            endDate,
            items: [{ ...item, listing: itemId }], // single item in array
          });
        }
      
        // Now update the listing
        const listing = await listingBaseModel.findById(itemId); 
        if (!listing) return res.status(404).json({ message: "Listing not found." }); 
      
        // push the auctionDoc._id if not already in auctions
        if (!listing.auctions.includes(auctionDoc._id)) listing.auctions.push(auctionDoc._id);
      
        await listing.save()

        const updatedItem = await listingBaseModel
        .findById(itemId)
        .populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })
        .populate({ path: 'changes.changedBy', select: 'fullNames' })
        .populate({ path: 'images.uploadedBy', select: 'fullNames' })
        .populate({ path: 'videos.uploadedBy', select: 'fullNames' })
        .populate({ path: 'documents.uploadedBy', select: 'fullNames' })
        .populate({ path: 'auctions', select: 'title auctionType startDate endDate auctionStarted auctionEnded items' }) 
        .select('-__v')
        .lean();    

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

        return res.status(201).json({
          item: updatedItem,
          message: "Auction created/updated successfully.",
        });
        
    } else {
      return res.status(405).json({ message: "Method not allowed." });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/inventory/auctions")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
