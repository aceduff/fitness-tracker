import pool from '../config/database.js';

// Create new meal
export const createMeal = async (mealData) => {
  const { user_id, name, calories, protein, carbs, fat, serving_size, servings, date } = mealData;

  const query = `
    INSERT INTO meals (user_id, name, calories, protein, carbs, fat, serving_size, servings, date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
