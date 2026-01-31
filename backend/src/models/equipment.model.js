import pool from '../config/database.js';

// Get all equipment types
export const getAllEquipmentTypes = async () => {
  const query = 'SELECT * FROM equipment_types ORDER BY name';
  const result = await pool.query(query);
  return result.rows;
};

// Get equipment type by ID
export const getEquipmentTypeById = async (id) => {
  const query = 'SELECT * FROM equipment_types WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get user's selected equipment
export const getUserEquipment = async (userId) => {
  const query = `
    SELECT et.*
    FROM equipment_types et
    INNER JOIN user_equipment ue ON et.id = ue.equipment_type_id
    WHERE ue.user_id = $1
    ORDER BY et.name
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Set user's equipment (replace all)
export const setUserEquipment = async (userId, equipmentIds) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete existing equipment for user
    await client.query('DELETE FROM user_equipment WHERE user_id = $1', [userId]);

    // Insert new equipment selections
    if (equipmentIds && equipmentIds.length > 0) {
      const insertQuery = `
        INSERT INTO user_equipment (user_id, equipment_type_id)
        VALUES ${equipmentIds.map((_, i) => `($1, $${i + 2})`).join(', ')}
      `;
      await client.query(insertQuery, [userId, ...equipmentIds]);
    }

    await client.query('COMMIT');

    // Return updated equipment list
    return await getUserEquipment(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Add all equipment types to a new user (called during registration)
export const addAllEquipmentToUser = async (userId) => {
  const query = `
    INSERT INTO user_equipment (user_id, equipment_type_id)
    SELECT $1, id FROM equipment_types
  `;
  await pool.query(query, [userId]);
};
