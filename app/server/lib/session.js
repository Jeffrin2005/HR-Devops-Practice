import jwt from 'jsonwebtoken';
export const cookieName = 'hr_session';
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api' });
export function setSession(res, user) {
  const token = jwt.sign({ _id: user._id, version: user.tokenVersion || 0 }, process.env.JWT_KEY,
    { algorithm: 'HS256', expiresIn: '1h', issuer: 'hr-api', audience: 'hr-app' });
  res.cookie(cookieName, token, { ...cookieOptions(), maxAge: 3600000 });
}
