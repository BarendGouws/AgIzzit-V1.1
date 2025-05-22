
import db from '@/utils/db';
import Organization from '@/models/Organization';

export default async function handler(req, res) {

    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    try {

      await db.connect();
      const { token, vatNumber } = req.body;
   
      const org = await Organization.findOne({
        vatNumberVerifyToken: token,
        vatNumberVerifyTokenExpires: { $gt: Date.now() }
      });
   
      if (!org) return res.status(400).json({ message: 'Invalid or expired token' });
   
      if (vatNumber !== org.vatNumber) return res.status(400).json({ message: 'VAT number does not match' });
   
      org.vatNumberVerified = true;
      org.vatNumberVerifiedAt = new Date();
      org.vatNumberVerifyToken = undefined;
      org.vatNumberVerifyTokenExpires = undefined;
   
      await org.save();
   
      res.status(200).json({ 
        message: 'VAT number successfully verified',
        organization: org
      });
   
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
   }