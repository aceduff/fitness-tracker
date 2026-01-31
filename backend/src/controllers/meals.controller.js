import {
  createMeal,
  getMealsByDate,
  getMealById,
  deleteMeal
} from '../models/meal.model.js';

// Add new meal
export const addMeal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mealData = {
      user_id: userId,
      ...req.body
    };

    const meal = await createMeal(mealData);

    res.status(201).json({
      success: true,
      message: 'Meal added successfully',
      meal
    });
  } catch (error) {
    next(error);
  }
};

// Get meals by date
export const getMeals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const meals = await getMealsByDate(userId, date);

    res.json({
      success: true,
      meals
    });
  } catch (error) {
    next(error);
  }
};

// Delete meal
export const removeMeal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;

    // Verify meal belongs to user
    const meal = await getMealById(mealId, userId);
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await deleteMeal(mealId, userId);

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
