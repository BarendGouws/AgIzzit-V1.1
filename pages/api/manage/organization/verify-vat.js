
import crypto from 'crypto';
import Organization from '@/models/Organization';
import db from '@/utils/db';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {

    if (req.method === 'POST') {

      try {

        const authToken = await getToken({ req, secret: process.env.JWT_SECRET });

        if (!authToken) { return res.status(401).json({ message: 'Unauthorized' }); }

        if(!authToken?.organization?._id) return res.status(401).json({ message: 'Unauthorized' }); 

        const { vatNumber, accountantEmail, accountantName } = req.body;
        const token = crypto.randomBytes(32).toString('hex');

        await db.connect();
   
        const org = await Organization.findOneAndUpdate(
          { _id: authToken.organization._id },
          { 
            vatNumber: vatNumber,
            vatNumberVerifyToken: token,
            vatNumberVerifyTokenExpires: Date.now() + 86400000, // 24 hours
            vatNumberVerifiedByEmail: accountantEmail.toString().toLowerCase(),
            vatNumberVerifiedByName: toTitleCase(accountantName),
          }
        );

        if (!org) return res.status(404).json({ message: 'Organization not found' });
   
        // Send email to accountant with verification link
        console.log(`/manage/verify-vat?token=${token}`);
   
        res.status(200).json({
          message: 'Verification email sent to accountant',
          organization: org
        });
   
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}