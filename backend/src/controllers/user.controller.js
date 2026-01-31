import { findUserById, updateUserSettings } from '../models/user.model.js';
import { getTotalCaloriesByDate } from '../models/meal.model.js';
import { getTotalWorkoutCaloriesByDate } from '../models/workout.model.js';
import { getTotalSessionCaloriesByDate } from '../models/workoutSession.model.js';

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update user settings (bmr, current_weight, goal_weight)
export const updateSettings = async (req, res, next) => {
  try {
    const user = await updateUserSettings(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Settings updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get daily calorie summary
export const getDailySummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const user = await findUserById(userId);
    const caloriesEaten = await getTotalCaloriesByDate(userId, date);
    const simpleWorkoutCalories = await getTotalWorkoutCaloriesByDate(userId, date);
    const sessionCalories = await getTotalSessionCaloriesByDate(userId, date);
    const caloriesBurned = simpleWorkoutCalories + sessionCalories;

    const bmr = user.bmr || 1800;
    const netCalories = caloriesEaten - caloriesBurned - bmr;

    // Calculate calories remaining to reach goal weight
    let caloriesToGoal = null;
    if (user.current_weight && user.goal_weight) {
      const weightDiff = parseFloat(user.current_weight) - parseFloat(user.goal_weight);
      caloriesToGoal = Math.round(weightDiff * 3500); // 1 pound = 3500 calories
    }

    res.json({
      success: true,
      summary: {
        date,
        calories_eaten: caloriesEaten,
        calories_burned: caloriesBurned,
        bmr,
        net_calories: netCalories,
        current_weight: user.current_weight,
        goal_weight: user.goal_weight,
        calories_to_goal: caloriesToGoal
      }
    });
  } catch (error) {
    next(error);
  }
};
