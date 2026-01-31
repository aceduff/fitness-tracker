import { useState, useEffect } from 'react';
import * as api from '../api.js';
import { card, alertError, btnDanger } from '../styles.js';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  async function loadData() {
    try {
      const [summaryRes, mealsRes, workoutsRes] = await Promise.all([
        api.getDailySummary(today),
        api.getMeals(today),
        api.getWorkouts(today)
      ]);
      setSummary(summaryRes.summary);
      setMeals(mealsRes.meals);
      setWorkouts(workoutsRes.workouts);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleDeleteMeal(id) {
    try {
      await api.deleteMeal(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteWorkout(id) {
    try {
      await api.deleteWorkout(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!summary) return <div className="text-center p-8 text-[var(--palette-text-muted)]">Loading dashboard...</div>;

  const weightProgress = summary.calories_to_goal
    ? Math.max(0, Math.min(100, 100 - (summary.calories_to_goal / (Math.abs(parseFloat(summary.current_weight) - parseFloat(summary.goal_weight)) * 3500) * 100)))
    : 0;

  return (
    <div className="animate-[fadeIn_0.2s_ease]">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      {error && <div className={alertError}>{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <h3 className="mb-3 text-base font-semibold">Weight Goal</h3>
          <div className="flex gap-8 mb-3">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--palette-text-muted)] uppercase">Current</span>
              <span className="text-xl font-bold">{summary.current_weight ? `${summary.current_weight} lbs` : 'Not set'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[var(--palette-text-muted)] uppercase">Goal</span>
              <span className="text-xl font-bold">{summary.goal_weight ? `${summary.goal_weight} lbs` : 'Not set'}</span>
            </div>
          </div>
          {summary.calories_to_goal !== null && (
            <div className="mt-2">
              <p className="text-sm mb-2">{summary.calories_to_goal > 0
                ? `${summary.calories_to_goal.toLocaleString()} cal to burn to reach goal`
                : summary.calories_to_goal < 0
                  ? `${Math.abs(summary.calories_to_goal).toLocaleString()} cal to gain to reach goal`
                  : 'You reached your goal weight!'
              }</p>
              <div className="h-2 bg-[var(--palette-border)] rounded overflow-hidden">
                <div className="h-full bg-[var(--palette-primary)] rounded progress-fill-transition" style={{ width: `${weightProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className={card}>
          <h3 className="mb-3 text-base font-semibold">Today's Summary</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm py-1">
              <span>Calories Eaten</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">+{summary.calories_eaten}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span>Workout Burn</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">-{summary.calories_burned}</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span>BMR ({summary.bmr})</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">-{summary.bmr}</span>
            </div>
            <div className="flex justify-between border-t-2 border-[var(--palette-border)] pt-2 font-bold text-base">
              <span>Net Calories</span>
              <span className={summary.net_calories >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {summary.net_calories >= 0 ? '+' : ''}{summary.net_calories}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className={card}>
          <h3 className="mb-3 text-base font-semibold">Today's Meals ({meals.length})</h3>
          {meals.length === 0 ? (
            <p className="text-[var(--palette-text-muted)] text-sm">No meals logged today</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {meals.map(m => (
                <li key={m.id} className="flex items-center justify-between p-2 px-3 border border-[var(--palette-border)] rounded-lg text-sm">
                  <div className="flex flex-col gap-0.5">
                    <strong>{m.name}</strong>
                    <span className="text-xs text-[var(--palette-text-muted)]">{m.calories} cal{m.meal_type ? ` · ${m.meal_type}` : ''}</span>
                  </div>
                  <button onClick={() => handleDeleteMeal(m.id)} className={btnDanger}>X</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card}>
          <h3 className="mb-3 text-base font-semibold">Today's Workouts ({workouts.length})</h3>
          {workouts.length === 0 ? (
            <p className="text-[var(--palette-text-muted)] text-sm">No workouts logged today</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {workouts.map(w => (
                <li key={w.id} className="flex items-center justify-between p-2 px-3 border border-[var(--palette-border)] rounded-lg text-sm">
                  <div className="flex flex-col gap-0.5">
                    <strong>{w.name}</strong>
                    <span className="text-xs text-[var(--palette-text-muted)]">{w.calories_burned} cal burned</span>
                  </div>
                  <button onClick={() => handleDeleteWorkout(w.id)} className={btnDanger}>X</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
