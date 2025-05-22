import Staff from "@/models/Staff";
import db from "@/utils/db";
import crypto from 'crypto';

export default async function handler(req, res) {
  
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      await db.connect();
      const { email } = req.body;
  
      const staff = await Staff.findOne({ email: email.toLowerCase() });
      if (!staff) {
        return res.status(404).json({ message: 'No account found with this email' });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      staff.passwordResetToken = resetToken;
      staff.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await staff.save();
  
      // In production, send email here
      console.log(`Password reset link: ${process.env.NEXT_PUBLIC_URL}/manage/reset-password?token=${resetToken}`);
  
      res.status(200).json({ 
        message: 'Password reset instructions have been sent to your email' 
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
}