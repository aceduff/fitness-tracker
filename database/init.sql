-- Fitness Tracker Database Schema
-- PostgreSQL Database Initialization Script

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS exercise_logs CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS user_equipment CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS equipment_types CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bmr INTEGER DEFAULT 1800,
    current_weight DECIMAL(5,2),
    goal_weight DECIMAL(5,2),
    initial_weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Meals table
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    serving_size VARCHAR(100),
    servings DECIMAL(5,2) DEFAULT 1,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Muscle Groups table
CREATE TABLE muscle_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Equipment Types table
CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Exercises table
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group_id INTEGER NOT NULL REFERENCES muscle_groups(id),
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
    description TEXT,
    calories_per_minute INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create User Equipment table (tracks which equipment each user has)
CREATE TABLE user_equipment (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, equipment_type_id)
);

-- Create Workout Sessions table
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    last_activity TIMESTAMP NOT NULL,
    total_calories_burned INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Exercise Logs table (tracks sets, reps, weight for each exercise in a session)
CREATE TABLE exercise_logs (
    id SERIAL PRIMARY KEY,
    workout_session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL(6,2),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, date);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_exercise_logs_session ON exercise_logs(workout_session_id);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_type_id);
CREATE INDEX idx_user_equipment_user ON user_equipment(user_id);
CREATE INDEX idx_users_username ON users(username);

-- ========================================
-- SEED DATA
-- ========================================

-- Insert Muscle Groups
INSERT INTO muscle_groups (name, description) VALUES
  ('Chest', 'Pectoral muscles - upper, middle, lower'),
  ('Back', 'Latissimus dorsi, traps, rhomboids'),
  ('Legs', 'Quadriceps, hamstrings, glutes, calves'),
  ('Shoulders', 'Deltoids - anterior, lateral, posterior'),
  ('Arms', 'Biceps, triceps, forearms'),
  ('Core', 'Abdominals, obliques, lower back');

-- Insert Equipment Types
INSERT INTO equipment_types (name, icon) VALUES
  ('Bodyweight', 'person'),
  ('Dumbbells', 'dumbbell'),
  ('Barbell', 'barbell'),
  ('Machine', 'machine'),
  ('Resistance Bands', 'band'),
  ('Kettlebell', 'kettlebell'),
  ('Cable', 'cable');

-- Insert Exercises (30+ exercises across all muscle groups)
-- Chest exercises (muscle_group_id = 1)
INSERT INTO exercises (name, muscle_group_id, equipment_type_id, calories_per_minute, description) VALUES
  ('Push-ups', 1, 1, 7, 'Classic bodyweight chest exercise'),
  ('Bench Press', 1, 3, 8, 'Barbell chest press on flat bench'),
  ('Dumbbell Fly', 1, 2, 6, 'Isolation exercise for chest'),
  ('Cable Crossover', 1, 7, 6, 'Cable chest fly movement'),
  ('Incline Bench Press', 1, 3, 8, 'Upper chest focused press'),
  ('Dumbbell Press', 1, 2, 7, 'Dumbbell chest press on flat bench');

-- Back exercises (muscle_group_id = 2)
INSERT INTO exercises (name, muscle_group_id, equipment_type_id, calories_per_minute, description) VALUES
  ('Pull-ups', 2, 1, 9, 'Bodyweight back exercise'),
  ('Bent Over Row', 2, 3, 8, 'Barbell rowing movement'),
  ('Lat Pulldown', 2, 4, 7, 'Machine back pull'),
  ('Dumbbell Row', 2, 2, 7, 'Single arm rowing'),
  ('Deadlift', 2, 3, 10, 'Full body compound movement'),
  ('Seated Cable Row', 2, 7, 6, 'Cable rowing exercise');

-- Legs exercises (muscle_group_id = 3)
INSERT INTO exercises (name, muscle_group_id, equipment_type_id, calories_per_minute, description) VALUES
  ('Squats', 3, 3, 9, 'Barbell back squats'),
  ('Lunges', 3, 1, 7, 'Bodyweight or weighted lunges'),
  ('Leg Press', 3, 4, 8, 'Machine leg press'),
  ('Romanian Deadlift', 3, 3, 9, 'Hamstring focused deadlift'),
  ('Calf Raises', 3, 1, 5, 'Standing calf raises'),
  ('Dumbbell Squats', 3, 2, 8, 'Goblet or dumbbell squats'),
  ('Leg Curls', 3, 4, 6, 'Machine hamstring curls'),
  ('Leg Extensions', 3, 4, 6, 'Machine quad extensions');

-- Shoulders exercises (muscle_group_id = 4)
INSERT INTO exercises (name, muscle_group_id, equipment_type_id, calories_per_minute, description) VALUES
  ('Overhead Press', 4, 3, 7, 'Barbell shoulder press'),
  ('Lateral Raises', 4, 2, 5, 'Dumbbell side raises'),
  ('Face Pulls', 4, 7, 5, 'Cable rear delt exercise'),
  ('Arnold Press', 4, 2, 7, 'Rotating dumbbell press'),
  ('Front Raises', 4, 2, 5, 'Dumbbell front raises'),
  ('Dumbbell Shoulder Press', 4, 2, 6, 'Seated dumbbell press');

-- Arms exercises (muscle_group_id = 5)
INSERT INTO exercises (name, muscle_group_id, equipment_type_id, calories_per_minute, description) VALUES
  ('Bicep Curls', 5, 2, 5, 'Dumbbell bicep curls'),
  ('Tricep Dips', 5, 1, 6, 'Bodyweight tricep dips'),
  ('Hammer Curls', 5, 2, 5, 'Neutral grip curls'),
  ('Tricep Pushdown', 5, 7, 5, 'Cable tricep extension'),
  ('Skull Crushers', 5, 3, 6, 'Lying tricep extension'),
  ('Barbell Curls', 5, 3, 6, 'Standing barbell curls'),
  ('Close-Grip Bench Press', 5, 3, 7, 'Tricep focused bench press');

-- Core exercises (muscle_group_id = 6)
INSERT INTO exercises (name, muscle_group_id, equipment_type_id, calories_per_minute, description) VALUES
  ('Plank', 6, 1, 4, 'Static core hold'),
  ('Crunches', 6, 1, 5, 'Abdominal crunches'),
  ('Russian Twists', 6, 1, 6, 'Oblique rotations'),
  ('Hanging Leg Raises', 6, 1, 7, 'Advanced core exercise'),
  ('Cable Woodchoppers', 6, 7, 6, 'Diagonal core movement'),
  ('Bicycle Crunches', 6, 1, 6, 'Alternating ab crunches'),
  ('Mountain Climbers', 6, 1, 8, 'Dynamic core cardio');

-- Database initialization complete
