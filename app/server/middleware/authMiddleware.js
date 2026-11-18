import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cookieName } from '../lib/session.js';
export default async function verifyUser(req, res, next) {
  const header = req.get('authorization');
  const token = req.cookies?.[cookieName] || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_KEY, { algorithms: ['HS256'], issuer: 'hr-api', audience: 'hr-app' });
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired or invalid' });
  }
  try {
    const user = await User.findById(decoded._id);
    if (!user || !user.active || decoded.version !== user.tokenVersion) return res.status(401).json({ success: false, error: 'Session expired or invalid' });
    req.user = user;
    next();
  } catch (error) { next(error); }
}
