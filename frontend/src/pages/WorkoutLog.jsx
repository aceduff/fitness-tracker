import { useState, useEffect } from 'react';
import * as api from '../api.js';

export default function WorkoutLog() {
  const [activeSession, setActiveSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);

  // Filters
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterUserEquipment, setFilterUserEquipment] = useState(false);

  // Log form
  const [selectedExercise, setSelectedExercise] = useState('');
  const [setNumber, setSetNumber] = useState(1);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [sessionRes, muscleRes, equipRes, completedRes] = await Promise.all([
        api.getActiveSession(),
        api.getMuscleGroups(),
        api.getEquipmentTypes(),
        api.getSessionsByDate(today)
      ]);
      setActiveSession(sessionRes.session);
      setMuscleGroups(muscleRes.muscle_groups);
      setEquipmentTypes(equipRes.equipment_types);
      setCompletedSessions(completedRes.sessions);

      if (sessionRes.session) {
        const logsRes = await api.getSessionLogs(sessionRes.session.id);
        setSessionLogs(logsRes.logs);
      }

      await loadExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadExercises() {
    try {
      const params = {};
      if (filterUserEquipment) params.user_equipment = 'true';
      if (filterMuscle) params.muscle_group = filterMuscle;
      if (filterEquipment) params.equipment = filterEquipment;
      const res = await api.getExercises(params);
      setExercises(res.exercises);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadExercises(); }, [filterMuscle, filterEquipment, filterUserEquipment]);

  async function handleStartSession() {
    setError('');
    try {
      const res = await api.startSession(today);
      setActiveSession(res.session);
      setSessionLogs([]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStopSession() {
    if (!activeSession) return;
    setError('');
    try {
      await api.stopSession(activeSession.id);
      setActiveSession(null);
      setSessionLogs([]);
      const completedRes = await api.getSessionsByDate(today);
      setCompletedSessions(completedRes.sessions);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogExercise(e) {
    e.preventDefault();
    if (!activeSession || !selectedExercise) return;
    setError('');
    try {
      await api.logExercise({
        workout_session_id: activeSession.id,
        exercise_id: parseInt(selectedExercise),
        set_number: parseInt(setNumber),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : undefined
      });
      const logsRes = await api.getSessionLogs(activeSession.id);
      setSessionLogs(logsRes.logs);
      setSetNumber(prev => prev + 1);
      setReps('');
      setWeight('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteLog(logId) {
    try {
      await api.deleteExerciseLog(logId);
      const logsRes = await api.getSessionLogs(activeSession.id);
      setSessionLogs(logsRes.logs);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Loading workout log...</div>;

  return (
    <div className="page">
      <h1>Workout Log</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Session controls */}
      <div className="card">
        <h3>Session</h3>
        {!activeSession ? (
          <div>
            <p className="text-muted">No active workout session</p>
            <button onClick={handleStartSession} className="btn btn-primary">
              Start Workout Session
            </button>
          </div>
        ) : (
          <div>
            <p>Session active since {new Date(activeSession.start_time).toLocaleTimeString()}</p>
            <button onClick={handleStopSession} className="btn btn-danger">
              Stop Session
            </button>
          </div>
        )}
      </div>

      {/* Exercise browser with filters */}
      {activeSession && (
        <>
          <div className="card">
            <h3>Find Exercise</h3>
            <div className="filter-row">
              <select value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}>
                <option value="">All Muscle Groups</option>
                {muscleGroups.map(mg => (
                  <option key={mg.id} value={mg.id}>{mg.name}</option>
                ))}
              </select>
              <select value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)}>
                <option value="">All Equipment</option>
                {equipmentTypes.map(et => (
                  <option key={et.id} value={et.id}>{et.name}</option>
                ))}
              </select>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterUserEquipment}
                  onChange={e => setFilterUserEquipment(e.target.checked)}
                />
                My Equipment Only
              </label>
            </div>

            <div className="exercise-list">
              {exercises.length === 0 ? (
                <p className="text-muted">No exercises match your filters</p>
              ) : (
                exercises.map(ex => (
                  <div
                    key={ex.id}
                    className={`exercise-item ${selectedExercise == ex.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedExercise(ex.id); setSetNumber(1); }}
                  >
                    <strong>{ex.name}</strong>
                    <span className="exercise-meta">
                      {ex.muscle_group_name} / {ex.equipment_name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Log form */}
          {selectedExercise && (
            <form onSubmit={handleLogExercise} className="card">
              <h3>Log Set - {exercises.find(e => e.id == selectedExercise)?.name}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Set #</label>
                  <input type="number" min="1" value={setNumber} onChange={e => setSetNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Reps *</label>
                  <input type="number" min="1" value={reps} onChange={e => setReps(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Weight (lbs)</label>
                  <input type="number" min="0" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Log Set</button>
            </form>
          )}

          {/* Session logs */}
          {sessionLogs.length > 0 && (
            <div className="card">
              <h3>Current Session Logs</h3>
              <ul className="entry-list">
                {sessionLogs.map(log => (
                  <li key={log.id} className="entry-item">
                    <div className="entry-info">
                      <strong>{log.exercise_name}</strong>
                      <span>Set {log.set_number}: {log.reps} reps{log.weight ? ` @ ${log.weight} lbs` : ''}</span>
                    </div>
                    <button onClick={() => handleDeleteLog(log.id)} className="btn btn-sm btn-danger">X</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Completed sessions */}
      {completedSessions.length > 0 && (
        <div className="card">
          <h3>Completed Sessions Today</h3>
          {completedSessions.map(s => (
            <div key={s.id} className="completed-session">
              <span>{new Date(s.start_time).toLocaleTimeString()} - {s.end_time ? new Date(s.end_time).toLocaleTimeString() : 'N/A'}</span>
              <span>{s.total_calories_burned} cal burned</span>
              <span className="badge">{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
