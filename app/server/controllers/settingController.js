import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { cookieName, cookieOptions } from '../lib/session.js';
export const changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !await bcrypt.compare(req.body.oldPassword, user.password)) return res.status(400).json({ success: false, error: 'Old password is incorrect' });
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  user.tokenVersion += 1;
  await user.save();
  res.clearCookie(cookieName, cookieOptions());
  res.json({ success: true, message: 'Password changed. Please sign in again.' });
};
