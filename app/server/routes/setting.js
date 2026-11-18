import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { z, password, validate } from '../lib/validation.js';
import { changePassword } from '../controllers/settingController.js';
const router = express.Router();
router.put('/change-password', auth, validate(z.object({ oldPassword: z.string().min(1).max(72), newPassword: password })), changePassword);
export default router;
