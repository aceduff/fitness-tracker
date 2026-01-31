import pool from '../config/database.js';

// Create new user
export const createUser = async (username, passwordHash) => {
  const query = `
    INSERT INTO users (username, password_hash)
    VALUES ($1, $2)
    RETURNING id, username, bmr, current_weight, goal_weight, initial_weight, created_at
  `;
  const result = await pool.query(query, [username, passwordHash]);
  return result.rows[0];
};

// Find user by username
export const findUserByUsername = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

// Find user by ID
export const findUserById = async (userId) => {
  const query = `
    SELECT id, username, bmr, current_weight, goal_weight, initial_weight, created_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Update user settings
export const updateUserSettings = async (userId, updates) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.bmr !== undefined) {
    fields.push(`bmr = $${paramIndex++}`);
    values.push(updates.bmr);
  }
  if (updates.current_weight !== undefined) {
    fields.push(`current_weight = $${paramIndex++}`);
    values.push(updates.current_weight);
  }
  if (updates.goal_weight !== undefined) {
    fields.push(`goal_weight = $${paramIndex++}`);
    values.push(updates.goal_weight);
  }
  if (updates.initial_weight !== undefined) {
    fields.push(`initial_weight = $${paramIndex++}`);
    values.push(updates.initial_weight);
  }

  if (fields.length === 0) {
    return await findUserById(userId);
  }

  values.push(userId);
  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, username, bmr, current_weight, goal_weight, initial_weight, created_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};
