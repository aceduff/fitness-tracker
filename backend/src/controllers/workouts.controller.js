import {
  createWorkout,
  getWorkoutsByDate,
  getWorkoutById,
  deleteWorkout
} from '../models/workout.model.js';

// Add new workout
export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workoutData = {
      user_id: userId,
      ...req.body
    };

    const workout = await createWorkout(workoutData);

    res.status(201).json({
      success: true,
      message: 'Workout added successfully',
      workout
    });
  } catch (error) {
    next(error);
  }
};

// Get workouts by date
export const getWorkouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const workouts = await getWorkoutsByDate(userId, date);

    res.json({
      success: true,
      workouts
    });
  } catch (error) {
    next(error);
  }
};

// Delete workout
export const removeWorkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workoutId = req.params.id;

    const workout = await getWorkoutById(workoutId, userId);
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await deleteWorkout(workoutId, userId);

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
