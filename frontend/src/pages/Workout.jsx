import { useState, useEffect, useRef } from 'react';
import * as api from '../api.js';

export default function Workout() {
  const [tab, setTab] = useState('quick'); // 'quick' or 'session'
  const today = new Date().toISOString().split('T')[0];

  // Quick entry state
  const [quickName, setQuickName] = useState('');
  const [quickCalories, setQuickCalories] = useState('');
  const [quickDate, setQuickDate] = useState(today);
  const [quickError, setQuickError] = useState('');
  const [quickSuccess, setQuickSuccess] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

  // Exercise search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);

  // Session state
  const [activeSession, setActiveSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterUserEquipment, setFilterUserEquipment] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [setNumber, setSetNumber] = useState(1);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [sessionError, setSessionError] = useState('');
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => { loadSessionData(); }, []);

  async function loadSessionData() {
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
      setSessionError(err.message);
    } finally {
      setSessionLoading(false);
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
      setSessionError(err.message);
    }
  }

  useEffect(() => { loadExercises(); }, [filterMuscle, filterEquipment, filterUserEquipment]);

  // Fuzzy search
  function handleSearchChange(value) {
    setSearchQuery(value);
    setQuickName(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.searchExercises(value);
        setSearchResults(res.exercises);
        setShowResults(true);
      } catch {}
    }, 300);
  }

  function selectSearchResult(exercise) {
    setQuickName(exercise.name);
    setSearchQuery(exercise.name);
    setShowResults(false);
  }

  // Quick entry
  async function handleQuickSubmit(e) {
    e.preventDefault();
    setQuickError('');
    setQuickLoading(true);
    try {
      await api.addWorkout({ name: quickName, calories_burned: parseInt(quickCalories), date: quickDate });
      setQuickSuccess('Workout added!');
      setQuickName(''); setQuickCalories(''); setSearchQuery('');
      setTimeout(() => setQuickSuccess(''), 2000);
    } catch (err) {
      setQuickError(err.message);
    } finally {
      setQuickLoading(false);
    }
  }

  // Session controls
  async function handleStartSession() {
    setSessionError('');
    try {
      const res = await api.startSession(today);
      setActiveSession(res.session);
      setSessionLogs([]);
    } catch (err) { setSessionError(err.message); }
  }

  async function handleStopSession() {
    if (!activeSession) return;
    setSessionError('');
    try {
      await api.stopSession(activeSession.id);
      setActiveSession(null);
      setSessionLogs([]);
      const completedRes = await api.getSessionsByDate(today);
      setCompletedSessions(completedRes.sessions);
    } catch (err) { setSessionError(err.message); }
  }

  async function handleLogExercise(e) {
    e.preventDefault();
    if (!activeSession || !selectedExercise) return;
    setSessionError('');
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
      setSetNumber(prev => parseInt(prev) + 1);
      setReps('');
      setWeight('');
    } catch (err) { setSessionError(err.message); }
  }

  async function handleDeleteLog(logId) {
    try {
      await api.deleteExerciseLog(logId);
      const logsRes = await api.getSessionLogs(activeSession.id);
      setSessionLogs(logsRes.logs);
    } catch (err) { setSessionError(err.message); }
  }

  return (
    <div className="page">
      <h1>Workout</h1>

      <div className="tab-bar">
        <button className={`tab ${tab === 'quick' ? 'active' : ''}`} onClick={() => setTab('quick')}>
          Quick Entry
        </button>
        <button className={`tab ${tab === 'session' ? 'active' : ''}`} onClick={() => setTab('session')}>
          Workout Session
        </button>
      </div>

      {/* QUICK ENTRY TAB */}
      {tab === 'quick' && (
        <>
          {quickError && <div className="alert alert-error">{quickError}</div>}
          {quickSuccess && <div className="alert alert-success">{quickSuccess}</div>}
          <form onSubmit={handleQuickSubmit} className="card">
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Exercise Name *</label>
              <input
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Start typing to search exercises..."
                required
              />
              {showResults && searchResults.length > 0 && (
                <ul className="search-dropdown">
                  {searchResults.map(ex => (
                    <li key={ex.id} onMouseDown={() => selectSearchResult(ex)}>
                      <strong>{ex.name}</strong>
                      <span className="exercise-meta">{ex.muscle_group_name} / {ex.equipment_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Calories Burned *</label>
              <input type="number" min="0" value={quickCalories} onChange={e => setQuickCalories(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={quickLoading}>
              {quickLoading ? 'Adding...' : 'Add Workout'}
            </button>
          </form>
        </>
      )}

      {/* SESSION TAB */}
      {tab === 'session' && (
        <>
          {sessionError && <div className="alert alert-error">{sessionError}</div>}

          <div className="card">
            <h3>Session</h3>
            {!activeSession ? (
              <div>
                <p className="text-muted">No active workout session</p>
                <button onClick={handleStartSession} className="btn btn-primary">Start Workout Session</button>
              </div>
            ) : (
              <div>
                <p>Session active since {new Date(activeSession.start_time).toLocaleTimeString()}</p>
                <button onClick={handleStopSession} className="btn btn-danger">Stop Session</button>
              </div>
            )}
          </div>

          {activeSession && (
            <>
              <div className="card">
                <h3>Find Exercise</h3>
                <div className="filter-row">
                  <select value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}>
                    <option value="">All Muscle Groups</option>
                    {muscleGroups.map(mg => <option key={mg.id} value={mg.id}>{mg.name}</option>)}
                  </select>
                  <select value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)}>
                    <option value="">All Equipment</option>
                    {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                  </select>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={filterUserEquipment} onChange={e => setFilterUserEquipment(e.target.checked)} />
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
                        <span className="exercise-meta">{ex.muscle_group_name} / {ex.equipment_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
        </>
      )}
    </div>
  );
}
