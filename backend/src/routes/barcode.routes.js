import { Router } from 'express';
import { lookupBarcode } from '../controllers/barcode.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/:barcode', lookupBarcode);

export default router;
