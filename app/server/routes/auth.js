import express from 'express';
import { login, verify, logout } from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js';
import { z, email, validate } from '../lib/validation.js';
const router = express.Router();
router.post('/login', validate(z.object({ email, password: z.string().min(1).max(72) })), login);
router.get('/verify', auth, verify);
router.post('/logout', auth, logout);
export default router;
