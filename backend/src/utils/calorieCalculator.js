// Calculate calories burned for a single exercise log
// Estimation: 3 seconds per rep average
export const calculateExerciseCalories = (exercise, reps) => {
  const durationMinutes = (reps * 3) / 60; // 3 seconds per rep
  return Math.round(exercise.calories_per_minute * durationMinutes);
};

// Calculate total calories for a workout session
export const calculateSessionCalories = (exerciseLogs) => {
  let totalCalories = 0;

  for (const log of exerciseLogs) {
    const calories = calculateExerciseCalories(log.exercise, log.reps);
    totalCalories += calories;
  }

  return Math.round(totalCalories);
};
