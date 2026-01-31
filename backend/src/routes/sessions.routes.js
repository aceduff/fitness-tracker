import { Router } from 'express';
import {
  startSession,
  getActive,
  getSessionsByDate,
  stopSession,
  logExercise,
  getSessionLogs,
  removeExerciseLog
} from '../controllers/workoutSessions.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { workoutSessionValidation, exerciseLogValidation, validate } from '../middleware/validators.js';

const router = Router();

router.use(authMiddleware);

router.post('/start', workoutSessionValidation, validate, startSession);
router.get('/active', getActive);
router.get('/', getSessionsByDate);
router.put('/:id/stop', stopSession);
router.post('/log', exerciseLogValidation, validate, logExercise);
router.get('/:id/logs', getSessionLogs);
router.delete('/log/:logId', removeExerciseLog);

export default router;
