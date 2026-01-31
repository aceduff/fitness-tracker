import pool from '../config/database.js';

// Create a simple workout entry
export const createWorkout = async (workoutData) => {
  const { user_id, name, calories_burned, date } = workoutData;
  const query = `
    INSERT INTO workouts (user_id, name, calories_burned, date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await pool.query(query, [user_id, name, calories_burned, date]);
  return result.rows[0];
};

// Get workouts for a user by date
export const getWorkoutsByDate = async (userId, date) => {
  const query = `
    SELECT * FROM workouts
    WHERE user_id = $1 AND date = $2
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId, date]);
  return result.rows;
};

// Get workout by ID
export const getWorkoutById = async (workoutId, userId) => {
  const query = 'SELECT * FROM workouts WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [workoutId, userId]);
  return result.rows[0];
};

// Delete workout
export const deleteWorkout = async (workoutId, userId) => {
  const query = 'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *';
  const result = await pool.query(query, [workoutId, userId]);
  return result.rows[0];
};

// Get total calories burned from simple workouts for a date
export const getTotalWorkoutCaloriesByDate = async (userId, date) => {
  const query = `
    SELECT COALESCE(SUM(calories_burned), 0) as total
    FROM workouts
    WHERE user_id = $1 AND date = $2
  `;
  const result = await pool.query(query, [userId, date]);
  return parseInt(result.rows[0].total);
};
