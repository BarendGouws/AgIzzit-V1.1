
import db from '@/utils/db';
import Staff from '@/models/Staff';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await db.connect();
    const { token, password } = req.body;

    const staff = await Staff.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!staff) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(password, salt);
    staff.passwordResetToken = undefined;
    staff.passwordResetExpires = undefined;
    staff.isTempPassword = false;
    
    await staff.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}