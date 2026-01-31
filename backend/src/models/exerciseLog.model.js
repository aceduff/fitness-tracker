import pool from '../config/database.js';

// Create exercise log (log a set)
export const createExerciseLog = async (logData) => {
  const { workout_session_id, exercise_id, set_number, reps, weight } = logData;

  const query = `
    INSERT INTO exercise_logs (workout_session_id, exercise_id, set_number, reps, weight)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await pool.query(query, [
    workout_session_id,
    exercise_id,
    set_number,
    reps,
    weight || null
  ]);

  return result.rows[0];
};

// Get all exercise logs for a workout session
export const getExerciseLogsBySession = async (sessionId) => {
  const query = `
    SELECT el.*, e.name as exercise_name, e.calories_per_minute,
           mg.name as muscle_group_name, et.name as equipment_name
    FROM exercise_logs el
    INNER JOIN exercises e ON el.exercise_id = e.id
    INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    INNER JOIN equipment_types et ON e.equipment_type_id = et.id
    WHERE el.workout_session_id = $1
    ORDER BY el.completed_at ASC
  `;

  const result = await pool.query(query, [sessionId]);
  return result.rows;
};

// Get exercise log by ID
export const getExerciseLogById = async (logId) => {
  const query = `
    SELECT el.*, e.name as exercise_name
    FROM exercise_logs el
    INNER JOIN exercises e ON el.exercise_id = e.id
    WHERE el.id = $1
  `;

  const result = await pool.query(query, [logId]);
  return result.rows[0];
};

// Delete exercise log
export const deleteExerciseLog = async (logId, userId) => {
  const query = `
    DELETE FROM exercise_logs
    WHERE id = $1
    AND workout_session_id IN (SELECT id FROM workout_sessions WHERE user_id = $2)
    RETURNING *
  `;

  const result = await pool.query(query, [logId, userId]);
  return result.rows[0];
};
