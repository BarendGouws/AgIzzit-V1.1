import Advertising from "@/models/Advertising";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';
import mongoose from "mongoose";

const handler = async (req, res) => {
  try {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });  

    if (!token || !token.organization || !token.organization._id) { 
      return res.status(401).json({ success: false, message: 'Unauthorized' }); 
    }

    await db.connect();
    
    const { id } = req.query;

    if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    
    if (req.method === 'GET') {
      try {
        const item = await Advertising.findById(id);
        
        if (!item) {
          return res.status(404).json({ success: false, message: 'Advertising feed not found' });
        }
        
        // Check if the user has access to this item
        const orgId = token.organization._id.toString();
        const itemOrgId = item.organization ? item.organization.toString() : '';
        
        if (orgId && itemOrgId && orgId !== itemOrgId) {
          return res.status(403).json({ success: false, message: 'Forbidden access to this resource' });
        }
        
        // Ensure inventory and filters exist
        const itemObj = item.toObject();
        if (!itemObj.filters) itemObj.filters = {};
        if (!itemObj.inventory) itemObj.inventory = [];
        if (!itemObj.fetchHistory) itemObj.fetchHistory = [];
        
        return res.status(200).json({ success: true, item: itemObj });
      } catch (error) {
        console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow("GET /api/manage/advertising/" + id)} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    } else if (req.method === 'PUT') {

      try {
        // Check if the advertising feed exists
        const advertising = await Advertising.findById(id);
        
        if (!advertising) {
          return res.status(404).json({ success: false, message: 'Advertising feed not found' });
        }
        
        // Check if the user has access to update this item
        const orgId = token.organization._id.toString();
        const itemOrgId = advertising.organization ? advertising.organization.toString() : '';
        
        if (orgId && itemOrgId && orgId !== itemOrgId) {
          return res.status(403).json({ success: false, message: 'Forbidden access to this resource' });
        }
        
        // Simplified update - directly use findByIdAndUpdate
        const updatedAdvertising = await Advertising.findByIdAndUpdate(
          id,
          { 
            ...req.body,
            updatedAt: new Date(),
            updatedBy: token._id
          },
          { new: true, runValidators: true }
        );
        
        return res.status(200).json({ 
          success: true, 
          message: 'Feed updated successfully',
          item: updatedAdvertising
        });

      } catch (error) {
        console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow("PUT /api/manage/advertising/" + id)} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

    } else if (req.method === 'DELETE') {
      try {
        const advertising = await Advertising.findById(id);
        
        if (!advertising) {
          return res.status(404).json({ success: false, message: 'Advertising feed not found' });
        }
        
        // Check if the user has access to delete this item
        const orgId = token.organization._id.toString();
        const itemOrgId = advertising.organization ? advertising.organization.toString() : '';
        
        if (orgId && itemOrgId && orgId !== itemOrgId) {
          return res.status(403).json({ success: false, message: 'Forbidden access to this resource' });
        }
        
        await Advertising.findByIdAndDelete(id);
        
        return res.status(200).json({ success: true, message: 'Feed deleted successfully' });
      } catch (error) {
        console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow("DELETE /api/manage/advertising/" + id)} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
    
  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/advertising/:id")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

export default handler;