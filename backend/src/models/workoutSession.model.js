import pool from '../config/database.js';

// Start a new workout session
export const createWorkoutSession = async (userId, date) => {
  const now = new Date();
  const query = `
    INSERT INTO workout_sessions (user_id, start_time, last_activity, date, status)
    VALUES ($1, $2, $2, $3, 'active')
    RETURNING *
  `;
  const result = await pool.query(query, [userId, now, date || now.toISOString().split('T')[0]]);
  return result.rows[0];
};

// Get active workout session for a user
export const getActiveWorkoutSession = async (userId) => {
  const query = `
    SELECT * FROM workout_sessions
    WHERE user_id = $1 AND status = 'active'
    ORDER BY start_time DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Get workout session by ID
export const getWorkoutSessionById = async (sessionId, userId) => {
  const query = `
    SELECT * FROM workout_sessions
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [sessionId, userId]);
  return result.rows[0];
};

// Get completed workout sessions by date
export const getWorkoutSessionsByDate = async (userId, date) => {
  const query = `
    SELECT * FROM workout_sessions
    WHERE user_id = $1 AND date = $2 AND status IN ('completed', 'auto_stopped')
    ORDER BY start_time DESC
  `;
  const result = await pool.query(query, [userId, date]);
  return result.rows;
};

// Update session last_activity timestamp
export const updateSessionActivity = async (sessionId) => {
  const query = `
    UPDATE workout_sessions
    SET last_activity = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [sessionId]);
  return result.rows[0];
};

// Stop workout session (manually)
export const stopWorkoutSession = async (sessionId, userId, totalCalories) => {
  const query = `
    UPDATE workout_sessions
    SET status = 'completed', end_time = NOW(), total_calories_burned = $1
    WHERE id = $2 AND user_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [totalCalories, sessionId, userId]);
  return result.rows[0];
};

// Auto-stop inactive sessions (called by cron job)
export const autoStopInactiveSessions = async () => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const query = `
    UPDATE workout_sessions
    SET status = 'auto_stopped', end_time = last_activity + INTERVAL '2 hours'
    WHERE status = 'active' AND last_activity < $1
    RETURNING *
  `;

  const result = await pool.query(query, [twoHoursAgo]);
  return result.rows;
};

// Get total calories burned from sessions for a date
export const getTotalSessionCaloriesByDate = async (userId, date) => {
  const query = `
    SELECT COALESCE(SUM(total_calories_burned), 0) as total
    FROM workout_sessions
    WHERE user_id = $1 AND date = $2 AND status IN ('completed', 'auto_stopped')
  `;
  const result = await pool.query(query, [userId, date]);
  return parseInt(result.rows[0].total);
};
