import { createUser, findUserByUsername } from '../models/user.model.js';
import { addAllEquipmentToUser } from '../models/equipment.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// Register new user
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(username, passwordHash);

    // Add all equipment types to new user by default
    try {
      await addAllEquipmentToUser(user.id);
    } catch (e) {
      console.warn('Could not assign default equipment:', e.message);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        bmr: user.bmr,
        current_weight: user.current_weight,
        goal_weight: user.goal_weight
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        bmr: user.bmr,
        current_weight: user.current_weight,
        goal_weight: user.goal_weight,
      },
      token
    });
  } catch (error) {
    next(error);
  }
};
