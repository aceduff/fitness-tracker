import pool from '../config/database.js';

// Create new meal
export const createMeal = async (mealData) => {
  const { user_id, name, calories, protein, carbs, fat, serving_size, servings, meal_type, date } = mealData;

  const query = `
    INSERT INTO meals (user_id, name, calories, protein, carbs, fat, serving_size, servings, meal_type, date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const result = await pool.query(query, [
    user_id,
    name,
    calories,
    protein || null,
    carbs || null,
    fat || null,
    serving_size || null,
    servings || 1,
    meal_type || 'snack',
    date
  ]);

  return result.rows[0];
};

// Get meals for a user by date
export const getMealsByDate = async (userId, date) => {
  const query = `
    SELECT *
    FROM meals
    WHERE user_id = $1 AND date = $2
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [userId, date]);
  return result.rows;
};

// Get meal by ID (for verification before delete)
export const getMealById = async (mealId, userId) => {
  const query = 'SELECT * FROM meals WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [mealId, userId]);
  return result.rows[0];
};

// Delete meal
export const deleteMeal = async (mealId, userId) => {
  const query = 'DELETE FROM meals WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await pool.query(query, [mealId, userId]);
  return result.rows[0];
};

// Get last N meals with macros
export const getRecentMealsWithMacros = async (userId, limit) => {
  const query = `
    SELECT name, calories, protein, carbs, fat, date, created_at
    FROM meals
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};

// Get macro totals for last N days
export const getMacrosByDateRange = async (userId, days) => {
  const query = `
    SELECT
      COALESCE(SUM(protein), 0) as total_protein,
      COALESCE(SUM(carbs), 0) as total_carbs,
      COALESCE(SUM(fat), 0) as total_fat
    FROM meals
    WHERE user_id = $1 AND date >= CURRENT_DATE - $2::integer + 1
  `;
  const result = await pool.query(query, [userId, days]);
  return result.rows[0];
};

// Get total calories consumed for a date
export const getTotalCaloriesByDate = async (userId, date) => {
  const query = `
    SELECT COALESCE(SUM(calories), 0) as total
    FROM meals
    WHERE user_id = $1 AND date = $2
  `;

  const result = await pool.query(query, [userId, date]);
  return parseInt(result.rows[0].total);
};
