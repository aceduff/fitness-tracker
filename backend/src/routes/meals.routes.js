import { Router } from 'express';
import { addMeal, getMeals, removeMeal } from '../controllers/meals.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { mealValidation, validate } from '../middleware/validators.js';

const router = Router();

router.use(authMiddleware);

router.post('/', mealValidation, validate, addMeal);
router.get('/', getMeals);
router.delete('/:id', removeMeal);

export default router;
