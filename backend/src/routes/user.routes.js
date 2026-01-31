import { Router } from 'express';
import { getProfile, updateSettings, getDailySummary } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { settingsValidation, validate } from '../middleware/validators.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/settings', settingsValidation, validate, updateSettings);
router.get('/summary', getDailySummary);

export default router;
