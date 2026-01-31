import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Username must be between 3 and 255 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

// Validation rules for user login
export const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validation rules for adding a meal
export const mealValidation = [
  body('name').trim().notEmpty().withMessage('Meal name is required'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  body('protein').optional().isFloat({ min: 0 }).withMessage('Protein must be a positive number'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Carbs must be a positive number'),
  body('fat').optional().isFloat({ min: 0 }).withMessage('Fat must be a positive number'),
  body('servings').optional().isFloat({ min: 0.1 }).withMessage('Servings must be greater than 0'),
  body('date').isDate().withMessage('Valid date is required (YYYY-MM-DD)')
];

// Validation rules for adding a simple workout
export const workoutValidation = [
  body('name').trim().notEmpty().withMessage('Workout name is required'),
  body('calories_burned').isInt({ min: 0 }).withMessage('Calories burned must be a positive integer'),
  body('date').isDate().withMessage('Valid date is required (YYYY-MM-DD)')
];

// Validation rules for user settings
export const settingsValidation = [
  body('bmr').optional().isInt({ min: 1000, max: 5000 }).withMessage('BMR must be between 1000 and 5000'),
  body('current_weight').optional().isFloat({ min: 0 }).withMessage('Current weight must be positive'),
  body('goal_weight').optional().isFloat({ min: 0 }).withMessage('Goal weight must be positive')
];

// Validation rules for workout session
export const workoutSessionValidation = [
  body('date').optional().isDate().withMessage('Valid date is required (YYYY-MM-DD)')
];

// Validation rules for exercise log
export const exerciseLogValidation = [
  body('workout_session_id').isInt({ min: 1 }).withMessage('Valid workout session ID required'),
  body('exercise_id').isInt({ min: 1 }).withMessage('Valid exercise ID required'),
  body('set_number').isInt({ min: 1 }).withMessage('Set number must be at least 1'),
  body('reps').isInt({ min: 1 }).withMessage('Reps must be at least 1'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive')
];
