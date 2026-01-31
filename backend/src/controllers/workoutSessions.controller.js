import {
  createWorkoutSession,
  getActiveWorkoutSession,
  getWorkoutSessionById,
  getWorkoutSessionsByDate,
  stopWorkoutSession,
  updateSessionActivity
} from '../models/workoutSession.model.js';
import {
  createExerciseLog,
  getExerciseLogsBySession,
  deleteExerciseLog
} from '../models/exerciseLog.model.js';
import { calculateExerciseCalories } from '../utils/calorieCalculator.js';
import { getExerciseById } from '../models/exercise.model.js';

// Start a new workout session
export const startSession = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if there's already an active session
    const activeSession = await getActiveWorkoutSession(userId);
    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active workout session',
        session: activeSession
      });
    }

    const session = await createWorkoutSession(userId, req.body.date);
    res.status(201).json({
      success: true,
      message: 'Workout session started',
      session
    });
  } catch (error) {
    next(error);
  }
};

// Get active session
export const getActive = async (req, res, next) => {
  try {
    const session = await getActiveWorkoutSession(req.user.id);
    res.json({ success: true, session: session || null });
  } catch (error) {
    next(error);
  }
};

// Get sessions by date
export const getSessionsByDate = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const sessions = await getWorkoutSessionsByDate(req.user.id, date);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

// Stop a workout session
export const stopSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await getWorkoutSessionById(sessionId, userId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }

    // Calculate total calories from exercise logs
    const logs = await getExerciseLogsBySession(sessionId);
    let totalCalories = 0;
    for (const log of logs) {
      totalCalories += calculateExerciseCalories(
        { calories_per_minute: log.calories_per_minute },
        log.reps
      );
    }

    const updatedSession = await stopWorkoutSession(sessionId, userId, totalCalories);
    res.json({
      success: true,
      message: 'Workout session completed',
      session: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

// Log an exercise in a session
export const logExercise = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workout_session_id, exercise_id, set_number, reps, weight } = req.body;

    // Verify session belongs to user and is active
    const session = await getWorkoutSessionById(workout_session_id, userId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }

    // Verify exercise exists
    const exercise = await getExerciseById(exercise_id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    const log = await createExerciseLog({
      workout_session_id,
      exercise_id,
      set_number,
      reps,
      weight
    });

    // Update session activity
    await updateSessionActivity(workout_session_id);

    res.status(201).json({
      success: true,
      message: 'Exercise logged',
      log: { ...log, exercise_name: exercise.name }
    });
  } catch (error) {
    next(error);
  }
};

// Get exercise logs for a session
export const getSessionLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await getWorkoutSessionById(sessionId, userId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const logs = await getExerciseLogsBySession(sessionId);
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

// Delete an exercise log
export const removeExerciseLog = async (req, res, next) => {
  try {
    const deleted = await deleteExerciseLog(req.params.logId, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Exercise log not found' });
    }
    res.json({ success: true, message: 'Exercise log deleted' });
  } catch (error) {
    next(error);
  }
};
