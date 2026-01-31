import {
  createMeal,
  getMealsByDate,
  getMealById,
  deleteMeal,
  getRecentMealsWithMacros,
  getMacrosByDateRange
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

// Get macro breakdown (last 5 meals + last 7 days)
export const getMacros = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [recentMeals, weeklyMacros] = await Promise.all([
      getRecentMealsWithMacros(userId, 5),
      getMacrosByDateRange(userId, 7)
    ]);

    const recentTotals = recentMeals.reduce((acc, m) => ({
      protein: acc.protein + parseFloat(m.protein || 0),
      carbs: acc.carbs + parseFloat(m.carbs || 0),
      fat: acc.fat + parseFloat(m.fat || 0)
    }), { protein: 0, carbs: 0, fat: 0 });

    res.json({
      success: true,
      recent: {
        protein: Math.round(recentTotals.protein * 10) / 10,
        carbs: Math.round(recentTotals.carbs * 10) / 10,
        fat: Math.round(recentTotals.fat * 10) / 10
      },
      weekly: {
        protein: Math.round(parseFloat(weeklyMacros.total_protein) * 10) / 10,
        carbs: Math.round(parseFloat(weeklyMacros.total_carbs) * 10) / 10,
        fat: Math.round(parseFloat(weeklyMacros.total_fat) * 10) / 10
      }
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
