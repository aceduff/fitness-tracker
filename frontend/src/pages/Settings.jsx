import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../api.js';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [bmr, setBmr] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProfile();
        const u = data.user;
        setBmr(u.bmr || 1800);
        setCurrentWeight(u.current_weight || '');
        setGoalWeight(u.goal_weight || '');
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const settings = {};
      if (bmr) settings.bmr = parseInt(bmr);
      if (currentWeight) settings.current_weight = parseFloat(currentWeight);
      if (goalWeight) settings.goal_weight = parseFloat(goalWeight);

      const data = await api.updateSettings(settings);
      updateUser({ ...user, ...data.user });
      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>BMR (Basal Metabolic Rate)</label>
          <input
            type="number"
            min="1000"
            max="5000"
            value={bmr}
            onChange={e => setBmr(e.target.value)}
          />
          <small>Default is 1800 cal/day. This is auto-deducted from your daily calories.</small>
        </div>
        <div className="form-group">
          <label>Current Weight (lbs)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={currentWeight}
            onChange={e => setCurrentWeight(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Goal Weight (lbs)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
