import Organization from "@/models/Organization";
import Locations from "@/models/Locations";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = async (req, res) => { 

  try {

    if(req.method === "POST"){

        const token = await getToken({ req, secret: process.env.JWT_SECRET });

        if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }

        if(!token?.organization?._id) return res.status(401).json({ message: 'Unauthorized' });

        await db.connect();

        const form = formidable({});
        const [fields, files] = await new Promise((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
          });
        });
     
        if (!files.logo) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
     
        const file = files.logo[0];
        const fileBuffer = await fs.promises.readFile(file.filepath);
     
        // Azure upload code
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
        const containerClient = blobServiceClient.getContainerClient('logos');
        const filename = `${uuidv4()}${path.extname(file.originalFilename)}`;
        
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        await blockBlobClient.uploadData(fileBuffer);
     
        // Update org
        const org = await Organization.findByIdAndUpdate(
          token.organization._id,
          {
            logoUrl: blockBlobClient.url,
            logoLastUpdated: new Date()
          },
          { new: true }
        );

        

        const organization = await Organization.findById(token.organization._id)
        .populate({ path: 'locations'})
        .populate({ path: 'timeline.staff', select: 'fullNames profileImage' })
        .populate({ path: 'changes.changedBy', select: 'fullNames' });
     
        res.status(200).json({ organization: organization });     

    }else{
      res.status(405).json({ msg: "Method Not Allowed" });
    }

  } catch (error) { console.log(error)
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/organization/upload")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }

};

export default handler;




