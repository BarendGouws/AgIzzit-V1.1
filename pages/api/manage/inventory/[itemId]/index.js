import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';
import { listingBaseModel } from "@/models/Listings";
import { Auctions } from "@/models/Auctions";
import Organization from "@/models/Organization";
import Staff from "@/models/Staff";
import Extras from "@/models/Extras";

export default async function handler(req, res) {

    try {

    if (req.method == 'GET') {

        const token = await getToken({ req, secret: process.env.JWT_SECRET });  

        if (!token || !token.isStaffMember) { return res.status(401).json({ message: 'Unauthorized' }); }

        await db.connect();

        const { itemId } = req.query;

        if(!itemId) return res.status(400).json({ message: "Inventory ID is required." });

        if(itemId == 'new'){
           
            const extras = await Extras.find({ organization: item.organization._id }).populate({ path: 'addedBy', select: 'fullNames' });

            return res.status(200).json({ item: null, extras });

        }else{
            
            const item = await listingBaseModel
            .findById(itemId)
            .populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })
            .populate({ path: 'changes.changedBy', select: 'fullNames' }) 
            .populate({ path: 'images.uploadedBy', select: 'fullNames' })  
            .populate({ path: 'videos.uploadedBy', select: 'fullNames' })  
            .populate({ path: 'documents.uploadedBy', select: 'fullNames' })  
            .populate({ path: 'auctions', select: 'title auctionType startDate endDate auctionStarted auctionEnded items' })
            .select('-__v')
            .lean() // Exclude the version field

            if (!item) return res.status(404).json({ message: "Inventory item not found." });   

            if (item.auctions) {

                item.auctions = item.auctions.map(auction => { 
                    const matchingItem = auction.items?.[0];         
                    const { items, ...auctionWithoutItems } = auction;
                    return {
                        ...auctionWithoutItems,
                        openingBid: matchingItem?.openingBid || 0,
                        currentBid: matchingItem?.currentBid || 0,
                        _id: matchingItem?._id
                        };
                    });
            }  

            const extras = await Extras.find({ organization: item.organization._id }).populate({ path: 'addedBy', select: 'fullNames' });

            const validExtras = extras.filter(extra => extra.isValidForListing(item));

            return res.status(200).json({ item, extras: validExtras });
             
        }
     
    }else if(req.method == 'PUT'){ 
        
        const token = await getToken({ req, secret: process.env.JWT_SECRET });
        if (!token) return res.status(401).json({ msg: "Unauthorized" });
        
        await db.connect();
    
        const { itemId } = req.query;
    
        if(!itemId) return res.status(400).json({ message: "Inventory ID is required." });
    
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
        
        const updates = req.body;
        const changes = [];    
    
        const ignoreKeys = ['__v', 'updatedAt', 'createdAt', 'changes', 'images', 'documents', 'videos'];
        
        Object.keys(updates).forEach((key) => {
            if (ignoreKeys.includes(key)) return;
            
            const oldValue = item[key];
            const newValue = updates[key];
            const isEqual = JSON.stringify(oldValue) === JSON.stringify(newValue);
            
            if (!isEqual) {
                // Convert boolean values to Enabled/Disabled and handle empty values
                const formatValue = (value) => {
                    if (value === undefined || value === null || value === '') {
                        return 'Empty';
                    }
                    if (typeof value === 'boolean') {
                        return value ? 'Enabled' : 'Disabled';
                    }
                    return value.toString();
                };
    
                changes.push({
                    timestamp: new Date(),
                    fieldId: key,
                    fieldName: getFieldName(key),
                    from: formatValue(oldValue),
                    to: formatValue(newValue),
                    changedBy: token._id
                });
                
                item[key] = newValue;
            }
        }); 
    
        // Handle media updates without change tracking
        if (updates.images) item.images = updates.images;
        if (updates.videos) item.videos = updates.videos;
        if (updates.documents) item.documents = updates.documents;
    
        if (!item.changes) item.changes = [];
        if (changes.length > 0) item.changes = [...changes, ...item.changes];
        
        await item.save();  
        
        await item.populate({ path: 'changes.changedBy', select: 'fullNames' });

        if (item.auctions) {

            item.auctions = item.auctions.map(auction => {
                const matchingItem = auction.items?.[0];         
                const { items, ...auctionWithoutItems } = auction;
                return {
                    ...auctionWithoutItems,
                    openingBid: matchingItem?.openingBid || 0,
                    currentBid: matchingItem?.currentBid || 0,
                    _id: matchingItem?._id
                    };
                });
        } 
    
        let message = "Item updated successfully.";
    
        return res.status(200).json({ item, message });   
         
    }else { 
        return res.status(405).json({ message: "Method Not Allowed" });
    }
        
    } catch (error) {
        console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/inventory/:id")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
        res.status(500).send({ message: "Internal Server Error" });
    }

}

//HELPER FUNCTIONS
const getFieldName = (text) => {

    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult
  
}