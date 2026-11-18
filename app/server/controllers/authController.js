import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { cookieName, cookieOptions, setSession } from '../lib/session.js';
const dummyHash = await bcrypt.hash('unusable-random-dummy-password', 12);
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  const valid = await bcrypt.compare(req.body.password, user?.password || dummyHash);
  const demoCredential = (req.body.email === 'admin@gmail.com' && req.body.password === 'admin') ||
    (req.body.email === 'employee@gmail.com' && req.body.password === 'employee');
  if (!valid || !user?.active || demoCredential) return res.status(401).json({ success: false, error: 'Invalid email or password' });
  setSession(res, user);
  res.json({ success: true, user: { _id: user._id, name: user.name, role: user.role } });
};
export const verify = (req, res) => res.json({ success: true, user: { _id: req.user._id, name: req.user.name, role: req.user.role } });
export const logout = async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  res.clearCookie(cookieName, cookieOptions());
  res.json({ success: true });
};
