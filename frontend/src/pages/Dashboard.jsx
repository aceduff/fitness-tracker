import { useState, useEffect } from 'react';
import * as api from '../api.js';

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

  if (!summary) return <div className="loading">Loading dashboard...</div>;

  const weightProgress = summary.calories_to_goal
    ? Math.max(0, Math.min(100, 100 - (summary.calories_to_goal / (Math.abs(parseFloat(summary.current_weight) - parseFloat(summary.goal_weight)) * 3500) * 100)))
    : 0;

  return (
    <div className="page dashboard">
      <h1>Dashboard</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card-grid">
        <div className="card">
          <h3>Weight Goal</h3>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-label">Current</span>
              <span className="stat-value">{summary.current_weight ? `${summary.current_weight} lbs` : 'Not set'}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Goal</span>
              <span className="stat-value">{summary.goal_weight ? `${summary.goal_weight} lbs` : 'Not set'}</span>
            </div>
          </div>
          {summary.calories_to_goal !== null && (
            <div className="goal-info">
              <p>{summary.calories_to_goal > 0
                ? `${summary.calories_to_goal.toLocaleString()} cal to burn to reach goal`
                : summary.calories_to_goal < 0
                  ? `${Math.abs(summary.calories_to_goal).toLocaleString()} cal to gain to reach goal`
                  : 'You reached your goal weight!'
              }</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${weightProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Today's Summary</h3>
          <div className="summary-breakdown">
            <div className="summary-line">
              <span>Calories Eaten</span>
              <span className="positive">+{summary.calories_eaten}</span>
            </div>
            <div className="summary-line">
              <span>Workout Burn</span>
              <span className="negative">-{summary.calories_burned}</span>
            </div>
            <div className="summary-line">
              <span>BMR ({summary.bmr})</span>
              <span className="negative">-{summary.bmr}</span>
            </div>
            <div className="summary-line summary-total">
              <span>Net Calories</span>
              <span className={summary.net_calories >= 0 ? 'positive' : 'negative'}>
                {summary.net_calories >= 0 ? '+' : ''}{summary.net_calories}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Today's Meals ({meals.length})</h3>
          {meals.length === 0 ? (
            <p className="empty-text">No meals logged today</p>
          ) : (
            <ul className="entry-list">
              {meals.map(m => (
                <li key={m.id} className="entry-item">
                  <div className="entry-info">
                    <strong>{m.name}</strong>
                    <span>{m.calories} cal{m.meal_type ? ` · ${m.meal_type}` : ''}</span>
                  </div>
                  <button onClick={() => handleDeleteMeal(m.id)} className="btn btn-sm btn-danger">X</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Today's Workouts ({workouts.length})</h3>
          {workouts.length === 0 ? (
            <p className="empty-text">No workouts logged today</p>
          ) : (
            <ul className="entry-list">
              {workouts.map(w => (
                <li key={w.id} className="entry-item">
                  <div className="entry-info">
                    <strong>{w.name}</strong>
                    <span>{w.calories_burned} cal burned</span>
                  </div>
                  <button onClick={() => handleDeleteWorkout(w.id)} className="btn btn-sm btn-danger">X</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
