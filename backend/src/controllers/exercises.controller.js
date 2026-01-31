import {
  getAllExercises,
  getExercisesByMuscleGroup,
  getExercisesByEquipment,
  getExercisesByUserEquipment
} from '../models/exercise.model.js';
import { getAllMuscleGroups } from '../models/muscleGroup.model.js';
import { getAllEquipmentTypes, getUserEquipment, setUserEquipment } from '../models/equipment.model.js';

// Get all exercises with optional filters
export const getExercises = async (req, res, next) => {
  try {
    const { muscle_group, equipment, user_equipment } = req.query;
    let exercises;

    if (user_equipment === 'true') {
      exercises = await getExercisesByUserEquipment(req.user.id, muscle_group || null);
    } else if (muscle_group) {
      exercises = await getExercisesByMuscleGroup(parseInt(muscle_group));
    } else if (equipment) {
      exercises = await getExercisesByEquipment(parseInt(equipment));
    } else {
      exercises = await getAllExercises();
    }

    res.json({ success: true, exercises });
  } catch (error) {
    next(error);
  }
};

// Get all muscle groups
export const getMuscleGroups = async (req, res, next) => {
  try {
    const muscleGroups = await getAllMuscleGroups();
    res.json({ success: true, muscle_groups: muscleGroups });
  } catch (error) {
    next(error);
  }
};

// Get all equipment types
export const getEquipmentTypes = async (req, res, next) => {
  try {
    const equipmentTypes = await getAllEquipmentTypes();
    res.json({ success: true, equipment_types: equipmentTypes });
  } catch (error) {
    next(error);
  }
};

// Get user's equipment
export const getMyEquipment = async (req, res, next) => {
  try {
    const equipment = await getUserEquipment(req.user.id);
    res.json({ success: true, equipment });
  } catch (error) {
    next(error);
  }
};

// Update user's equipment
export const updateMyEquipment = async (req, res, next) => {
  try {
    const { equipment_ids } = req.body;
    const equipment = await setUserEquipment(req.user.id, equipment_ids);
    res.json({
      success: true,
      message: 'Equipment updated successfully',
      equipment
    });
  } catch (error) {
    next(error);
  }
};
