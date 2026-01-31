import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as api from '../api.js';
import { card, alertError, alertSuccess, btnPrimary, input } from '../styles.js';

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
    <div className="animate-[fadeIn_0.2s_ease]">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      {error && <div className={alertError}>{error}</div>}
      {success && <div className={alertSuccess}>{success}</div>}

      <form onSubmit={handleSubmit} className={card}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">BMR (Basal Metabolic Rate)</label>
          <input
            type="number"
            min="1000"
            max="5000"
            className={input}
            value={bmr}
            onChange={e => setBmr(e.target.value)}
          />
          <small className="block mt-1 text-[var(--palette-text-muted)] text-xs">Default is 1800 cal/day. This is auto-deducted from your daily calories.</small>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Current Weight (lbs)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            className={input}
            value={currentWeight}
            onChange={e => setCurrentWeight(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Goal Weight (lbs)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            className={input}
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
          />
        </div>
        <button type="submit" className={`${btnPrimary} w-full`} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
