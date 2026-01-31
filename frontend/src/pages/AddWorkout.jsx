import { useState } from 'react';
import * as api from '../api.js';

export default function AddWorkout() {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [date, setDate] = useState(today);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.addWorkout({
        name,
        calories_burned: parseInt(caloriesBurned),
        date
      });
      setSuccess('Workout added!');
      setName('');
      setCaloriesBurned('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Add Workout</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Exercise Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Running, Swimming, Cycling"
            required
          />
        </div>
        <div className="form-group">
          <label>Calories Burned *</label>
          <input
            type="number"
            min="0"
            value={caloriesBurned}
            onChange={e => setCaloriesBurned(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Adding...' : 'Add Workout'}
        </button>
      </form>
    </div>
  );
}
