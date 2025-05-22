import Extras from "@/models/Extras";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  try {
    if (req.method === "GET") {
        
      const token = await getToken({ req, secret: process.env.JWT_SECRET });

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!token?.organization?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await db.connect();

      const extras = await Extras.find({ organization: token.organization._id })
        .populate({ path: 'addedBy', select: 'fullNames' });

      return res.json({ extras });

    } else if (req.method === "POST") {
      const token = await getToken({ req, secret: process.env.JWT_SECRET });

      if (!token?.organization?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await db.connect();

      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const extra = await Extras.create({
        ...data,
        organization: token.organization._id,
        addedBy: token._id
      });

      const populatedExtra = await extra.populate('addedBy', 'fullNames');

      return res.status(201).json({
        extra: populatedExtra,
        message: "Extra created successfully!"
      });

    } else if (req.method === "PUT") {
      const token = await getToken({ req, secret: process.env.JWT_SECRET });

      if (!token?.organization?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await db.connect();

      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { _id } = data;

      const existingExtra = await Extras.findOne({
        _id,
        organization: token.organization._id
      });

      if (!existingExtra) {
        return res.status(404).json({ message: 'Extra not found' });
      }

      const updatedExtra = await Extras.findOneAndUpdate(
        { _id, organization: token.organization._id },
        data,
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
      const token = await getToken({ req, secret: process.env.JWT_SECRET });

      if (!token?.organization?._id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await db.connect();

      const { id } = req.query;

      const existingExtra = await Extras.findOne({
        _id: id,
        organization: token.organization._id
      });

      if (!existingExtra) {
        return res.status(404).json({ message: 'Extra not found' });
      }

      await Extras.deleteOne({ _id: id });

      return res.json({
        extraId: id,
        message: "Extra deleted successfully!"
      });

    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/organization/extras")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;