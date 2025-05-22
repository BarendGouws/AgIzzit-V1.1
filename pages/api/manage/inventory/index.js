import Organization from "@/models/Organization";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';
import { listingBaseModel } from "@/models/Listings";
import { Auctions } from "@/models/Auctions"; 
import Extras from "@/models/Extras";

const handler = async (req, res) => {
  
  try {

    if(req.method === "GET") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET }); 

      if (!token) { 
        return res.status(401).json({ message: 'Unauthorized' }); 
      }

      await db.connect();

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sort = req.query.sort || '-updatedAt';
      const search = req.query.search || '';
      const status = req.query.status || '';
      const skip = (page - 1) * limit;

      // Build query
      let query = {
        organization: token.organization._id // Add organization filter
      };
      
      // Add search functionality
      if (search) {
        query.$or = [
          { make: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { variant: { $regex: search, $options: 'i' } },
          { stockNr: { $regex: search, $options: 'i' } }
        ];
      }

      // Add status filter
      if (status) {
        query.status = status;
      }

      // Get total count for pagination
      const totalCount = await listingBaseModel.countDocuments(query);

      // Execute query with pagination
      const inventory = await listingBaseModel.find(query)
        .populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })
        .populate({ path: 'changes.changedBy', select: 'fullNames' }) 
        .populate({ path: 'images.uploadedBy', select: 'fullNames' })  
        .populate({ path: 'videos.uploadedBy', select: 'fullNames' })  
        .populate({ path: 'documents.uploadedBy', select: 'fullNames' })  
        .select('-__v')        
        .sort(sort)
        .skip(skip)
        .limit(limit)
     
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return res.json({
        inventory,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage
        }
      });

    } else if (req.method == 'POST') {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });  

      if (!token || !token.isStaffMember) return res.status(401).json({ message: 'Unauthorized' }); 

      await db.connect();

      const organization = await Organization.findById(token.organization._id).select('type');

      if (!organization) { return res.status(404).json({ message: "Organization not found." });}

      if(!req.body.subcategory) {  return res.status(400).json({ message: "Subcategory is required." }); }     
    
      const extras = await Extras.find({ organization: token.organization._id }).populate({ path: 'addedBy', select: 'fullNames' });
      
      const requiredExtras = extras.reduce((acc, extra) => {
        if (extra.required) {
          if (extra.saleType === 'Cash') {
            acc.cashExtras.push(extra._id);
          } else if (extra.saleType === 'Finance') {
            acc.financeExtras.push(extra._id);
          }
        }
        return acc;
      }, { cashExtras: [], financeExtras: [] });
      
      const createdDoc = await listingBaseModel.create({
        ...req.body,
        category: organization.type || req.body.category,
        organization: token.organization._id,
        createdBy: token._id,
        cashExtras: requiredExtras.cashExtras,
        financeExtras: requiredExtras.financeExtras
      });

      await createdDoc.populate({ path: 'organization', select: 'registeredName websiteUrl categories type' })  
    
      return res.status(201).json({ item: createdDoc, extras, message: "Inventory item created successfully. Remember to complete the rest!" });

    } else {
      return res.status(405).send({ message: "Method not allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/inventory")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default handler;
