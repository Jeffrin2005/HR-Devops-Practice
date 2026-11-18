import express from 'express';
import auth from '../middleware/authMiddleware.js';
import roles from '../middleware/roleMiddleware.js';
import { getSummary } from '../controllers/dashboardController.js';
const router = express.Router();
router.get('/summary', auth, roles(['admin']), getSummary);
export default router;
