import { Router } from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favorites.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validators.js';

const router = Router();

router.use(authMiddleware);

const favoriteValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('protein').optional().isFloat({ min: 0 }),
  body('carbs').optional().isFloat({ min: 0 }),
  body('fat').optional().isFloat({ min: 0 }),
  body('serving_size').optional().trim(),
  body('default_servings').optional().isFloat({ min: 0.1 })
];

router.get('/', getFavorites);
router.post('/', favoriteValidation, validate, addFavorite);
router.delete('/:id', removeFavorite);

export default router;
