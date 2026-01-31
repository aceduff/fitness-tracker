import pool from '../config/database.js';

// Get all muscle groups
export const getAllMuscleGroups = async () => {
  const query = 'SELECT * FROM muscle_groups ORDER BY name';
  const result = await pool.query(query);
  return result.rows;
};

// Get muscle group by ID
export const getMuscleGroupById = async (id) => {
  const query = 'SELECT * FROM muscle_groups WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
