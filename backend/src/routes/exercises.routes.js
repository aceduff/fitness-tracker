import { Router } from 'express';
import {
  getExercises,
  getMuscleGroups,
  getEquipmentTypes,
  getMyEquipment,
  updateMyEquipment
} from '../controllers/exercises.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getExercises);
router.get('/muscle-groups', getMuscleGroups);
router.get('/equipment-types', getEquipmentTypes);
router.get('/my-equipment', getMyEquipment);
router.put('/my-equipment', updateMyEquipment);

export default router;
