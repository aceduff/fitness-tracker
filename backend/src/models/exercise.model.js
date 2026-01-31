import pool from '../config/database.js';

// Get all exercises
export const getAllExercises = async () => {
  const query = `
    SELECT e.*, mg.name as muscle_group_name, et.name as equipment_name
    FROM exercises e
    INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    INNER JOIN equipment_types et ON e.equipment_type_id = et.id
    ORDER BY mg.name, e.name
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get exercises filtered by muscle group
export const getExercisesByMuscleGroup = async (muscleGroupId) => {
  const query = `
    SELECT e.*, mg.name as muscle_group_name, et.name as equipment_name
    FROM exercises e
    INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    INNER JOIN equipment_types et ON e.equipment_type_id = et.id
    WHERE e.muscle_group_id = $1
    ORDER BY e.name
  `;
  const result = await pool.query(query, [muscleGroupId]);
  return result.rows;
};

// Get exercises filtered by equipment type
export const getExercisesByEquipment = async (equipmentTypeId) => {
  const query = `
    SELECT e.*, mg.name as muscle_group_name, et.name as equipment_name
    FROM exercises e
    INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    INNER JOIN equipment_types et ON e.equipment_type_id = et.id
    WHERE e.equipment_type_id = $1
    ORDER BY mg.name, e.name
  `;
  const result = await pool.query(query, [equipmentTypeId]);
  return result.rows;
};

// Get exercises filtered by user's available equipment
export const getExercisesByUserEquipment = async (userId, muscleGroupId = null) => {
  const query = `
    SELECT DISTINCT e.*, mg.name as muscle_group_name, et.name as equipment_name
    FROM exercises e
    INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    INNER JOIN equipment_types et ON e.equipment_type_id = et.id
    INNER JOIN user_equipment ue ON e.equipment_type_id = ue.equipment_type_id
    WHERE ue.user_id = $1
    ${muscleGroupId ? 'AND e.muscle_group_id = $2' : ''}
    ORDER BY mg.name, e.name
  `;

  const params = muscleGroupId ? [userId, muscleGroupId] : [userId];
  const result = await pool.query(query, params);
  return result.rows;
};

// Get exercise by ID
export const getExerciseById = async (id) => {
  const query = `
    SELECT e.*, mg.name as muscle_group_name, et.name as equipment_name
    FROM exercises e
    INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    INNER JOIN equipment_types et ON e.equipment_type_id = et.id
    WHERE e.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
