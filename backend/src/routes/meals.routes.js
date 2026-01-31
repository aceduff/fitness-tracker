import { Router } from 'express';
import { addMeal, getMeals, removeMeal, getMacros } from '../controllers/meals.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { mealValidation, validate } from '../middleware/validators.js';

const router = Router();

router.use(authMiddleware);

router.get('/macros', getMacros);
router.post('/', mealValidation, validate, addMeal);
router.get('/', getMeals);
router.delete('/:id', removeMeal);

export default router;
