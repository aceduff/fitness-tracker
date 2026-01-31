import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import authRoutes from './routes/auth.routes.js';
import mealsRoutes from './routes/meals.routes.js';
import workoutsRoutes from './routes/workouts.routes.js';
import userRoutes from './routes/user.routes.js';
import barcodeRoutes from './routes/barcode.routes.js';
import exercisesRoutes from './routes/exercises.routes.js';
import sessionsRoutes from './routes/sessions.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { autoStopInactiveSessions } from './models/workoutSession.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Serve React frontend in production
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res, next) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Cron job: auto-stop inactive workout sessions every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const stopped = await autoStopInactiveSessions();
    if (stopped.length > 0) {
      console.log(`Auto-stopped ${stopped.length} inactive workout session(s)`);
    }
  } catch (error) {
    console.error('Cron error (auto-stop sessions):', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
