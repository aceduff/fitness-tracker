import pool from '../config/database.js';

export const createFavoriteMeal = async (data) => {
  const { user_id, name, calories, protein, carbs, fat, serving_size, default_servings } = data;
  const query = `
    INSERT INTO favorite_meals (user_id, name, calories, protein, carbs, fat, serving_size, default_servings)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await pool.query(query, [
    user_id, name, calories,
    protein || null, carbs || null, fat || null,
    serving_size || null, default_servings || 1
  ]);
  return result.rows[0];
};

export const getFavoriteMeals = async (userId) => {
  const query = `
    SELECT * FROM favorite_meals
    WHERE user_id = $1
    ORDER BY name ASC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const deleteFavoriteMeal = async (id, userId) => {
  const query = 'DELETE FROM favorite_meals WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};
