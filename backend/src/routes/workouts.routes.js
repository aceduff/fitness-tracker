import { Router } from 'express';
import { addWorkout, getWorkouts, removeWorkout } from '../controllers/workouts.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { workoutValidation, validate } from '../middleware/validators.js';

const router = Router();

router.use(authMiddleware);

router.post('/', workoutValidation, validate, addWorkout);
router.get('/', getWorkouts);
router.delete('/:id', removeWorkout);

export default router;
