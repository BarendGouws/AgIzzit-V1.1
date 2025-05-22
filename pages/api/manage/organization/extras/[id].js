import Extras from "@/models/Extras";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  try {

    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    if (!token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });

    await db.connect();

    const { id } = req.query;

    const existingExtra = await Extras.findOne({ _id: id, organization: token.organization._id });

    if (!existingExtra) return res.status(404).json({ message: 'Extra not found' });

    if (req.method === "PUT") {

      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Remove _id from update data if present
      const { _id, ...updateData } = data;

      const updatedExtra = await Extras.findOneAndUpdate(
        { 
          _id: id,
          organization: token.organization._id 
        },
        updateData,
        {
          new: true,
          runValidators: true,
          populate: { path: 'addedBy', select: 'fullNames' }
        }
      );

      return res.json({
        extra: updatedExtra,
        message: "Extra updated successfully!"
      });

    } else if (req.method === "DELETE") {
        
      await Extras.deleteOne({ _id: id });

      return res.json({
        extraId: id,
        message: "Extra deleted successfully!"
      });

    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/organization/extras/" + req.query.id)} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;