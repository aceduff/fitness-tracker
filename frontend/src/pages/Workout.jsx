import { useState, useEffect, useRef } from 'react';
import * as api from '../api.js';
import { card, alertError, alertSuccess, btnPrimary, btnDanger, btn, input, select } from '../styles.js';

export default function Workout() {
  const [tab, setTab] = useState('quick');
  const today = new Date().toISOString().split('T')[0];

  const [quickName, setQuickName] = useState('');
  const [quickCalories, setQuickCalories] = useState('');
  const [quickFasted, setQuickFasted] = useState(false);
  const [quickDate, setQuickDate] = useState(today);
  const [quickError, setQuickError] = useState('');
  const [quickSuccess, setQuickSuccess] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

  const [quickMuscleFilter, setQuickMuscleFilter] = useState('');
  const [quickEquipFilter, setQuickEquipFilter] = useState('');
  const [quickExercises, setQuickExercises] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);

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

  useEffect(() => {
    async function loadQuickExercises() {
      if (!quickMuscleFilter && !quickEquipFilter) {
        setQuickExercises([]);
        return;
      }
      try {
        const params = {};
        if (quickMuscleFilter) params.muscle_group = quickMuscleFilter;
        if (quickEquipFilter) params.equipment = quickEquipFilter;
        const res = await api.getExercises(params);
        setQuickExercises(res.exercises);
      } catch {}
    }
    loadQuickExercises();
  }, [quickMuscleFilter, quickEquipFilter]);

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

  async function handleQuickSubmit(e) {
    e.preventDefault();
    setQuickError('');
    setQuickLoading(true);
    try {
      await api.addWorkout({ name: quickName, calories_burned: parseInt(quickCalories), fasted: quickFasted, date: quickDate });
      setQuickSuccess('Workout added!');
      setQuickName(''); setQuickCalories(''); setSearchQuery(''); setQuickFasted(false);
      setTimeout(() => setQuickSuccess(''), 2000);
    } catch (err) {
      setQuickError(err.message);
    } finally {
      setQuickLoading(false);
    }
  }

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

  const tabBase = 'px-4 py-2 border border-[var(--palette-border)] rounded-lg bg-[var(--palette-card)] text-sm cursor-pointer transition-colors';
  const tabActive = `${tabBase} bg-[var(--palette-primary)] text-white border-[var(--palette-primary)]`;
  const tabInactive = `${tabBase} text-[var(--palette-text)] hover:bg-[var(--palette-bg)]`;

  const chipBase = 'px-3 py-1.5 border rounded-2xl text-sm cursor-pointer transition-colors';
  const chipActive = `${chipBase} bg-[var(--palette-primary)] text-white border-[var(--palette-primary)]`;
  const chipInactive = `${chipBase} border-[var(--palette-border)] bg-[var(--palette-card)] text-[var(--palette-text)] hover:bg-[var(--palette-bg)]`;

  const exerciseItemBase = 'p-2 px-3 border rounded-lg cursor-pointer flex justify-between items-center text-sm transition-colors';
  const exerciseItemSelected = `${exerciseItemBase} border-[var(--palette-primary)] bg-[var(--palette-primary)]/10`;
  const exerciseItemDefault = `${exerciseItemBase} border-[var(--palette-border)] hover:border-[var(--palette-primary)]`;

  return (
    <div className="animate-[fadeIn_0.2s_ease]">
      <h1 className="mb-4 text-2xl font-bold">Workout</h1>

      <div className="flex gap-1 mb-4">
        <button className={tab === 'quick' ? tabActive : tabInactive} onClick={() => setTab('quick')}>
          Quick Entry
        </button>
        <button className={tab === 'session' ? tabActive : tabInactive} onClick={() => setTab('session')}>
          Workout Session
        </button>
      </div>

      {/* QUICK ENTRY TAB */}
      {tab === 'quick' && (
        <>
          {quickError && <div className={alertError}>{quickError}</div>}
          {quickSuccess && <div className={alertSuccess}>{quickSuccess}</div>}

          <div className={card}>
            <h3 className="mb-3 text-base font-semibold">Browse by Muscle Group</h3>
            <div className="flex flex-wrap gap-1.5">
              {muscleGroups.map(mg => (
                <button
                  key={mg.id}
                  type="button"
                  className={quickMuscleFilter == mg.id ? chipActive : chipInactive}
                  onClick={() => setQuickMuscleFilter(quickMuscleFilter == mg.id ? '' : mg.id)}
                >
                  {mg.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <select className={select} value={quickEquipFilter} onChange={e => setQuickEquipFilter(e.target.value)}>
                <option value="">All Equipment</option>
                {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
              </select>
            </div>
            {quickExercises.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1 mt-3">
                {quickExercises.map(ex => (
                  <div
                    key={ex.id}
                    className={quickName === ex.name ? exerciseItemSelected : exerciseItemDefault}
                    onClick={() => { setQuickName(ex.name); setSearchQuery(ex.name); }}
                  >
                    <strong>{ex.name}</strong>
                    <span className="text-xs text-[var(--palette-text-muted)]">{ex.muscle_group_name} / {ex.equipment_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleQuickSubmit} className={card}>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium mb-1">Exercise Name *</label>
              <input
                className={input}
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Start typing to search exercises..."
                required
              />
              {showResults && searchResults.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-[var(--palette-card)] border border-[var(--palette-border)] rounded-lg max-h-[200px] overflow-y-auto z-50 shadow-lg">
                  {searchResults.map(ex => (
                    <li
                      key={ex.id}
                      onMouseDown={() => selectSearchResult(ex)}
                      className="px-3 py-2 cursor-pointer flex justify-between items-center text-sm hover:bg-[var(--palette-bg)] transition-colors"
                    >
                      <strong>{ex.name}</strong>
                      <span className="text-xs text-[var(--palette-text-muted)]">{ex.muscle_group_name} / {ex.equipment_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Calories Burned *</label>
              <input className={input} type="number" min="0" value={quickCalories} onChange={e => setQuickCalories(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input className={input} type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)} required />
            </div>
            <label className="flex items-center gap-1.5 text-sm mb-4 cursor-pointer">
              <input type="checkbox" checked={quickFasted} onChange={e => setQuickFasted(e.target.checked)} className="accent-[var(--palette-primary)]" />
              Fasted workout (you haven't eaten for 12 hours)
            </label>
            <button type="submit" className={`${btnPrimary} w-full`} disabled={quickLoading}>
              {quickLoading ? 'Adding...' : 'Add Workout'}
            </button>
          </form>
        </>
      )}

      {/* SESSION TAB */}
      {tab === 'session' && (
        <>
          {sessionError && <div className={alertError}>{sessionError}</div>}

          <div className={card}>
            <h3 className="mb-3 text-base font-semibold">Session</h3>
            {!activeSession ? (
              <div>
                <p className="text-[var(--palette-text-muted)] text-sm mb-3">No active workout session</p>
                <button onClick={handleStartSession} className={btnPrimary}>Start Workout Session</button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-3">Session active since {new Date(activeSession.start_time).toLocaleTimeString()}</p>
                <button onClick={handleStopSession} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Stop Session</button>
              </div>
            )}
          </div>

          {activeSession && (
            <>
              <div className={card}>
                <h3 className="mb-3 text-base font-semibold">Find Exercise</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <select className={select} value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}>
                    <option value="">All Muscle Groups</option>
                    {muscleGroups.map(mg => <option key={mg.id} value={mg.id}>{mg.name}</option>)}
                  </select>
                  <select className={select} value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)}>
                    <option value="">All Equipment</option>
                    {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                  </select>
                  <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                    <input type="checkbox" checked={filterUserEquipment} onChange={e => setFilterUserEquipment(e.target.checked)} className="accent-[var(--palette-primary)]" />
                    My Equipment Only
                  </label>
                </div>
                <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1">
                  {exercises.length === 0 ? (
                    <p className="text-[var(--palette-text-muted)] text-sm">No exercises match your filters</p>
                  ) : (
                    exercises.map(ex => (
                      <div
                        key={ex.id}
                        className={selectedExercise == ex.id ? exerciseItemSelected : exerciseItemDefault}
                        onClick={() => { setSelectedExercise(ex.id); setSetNumber(1); }}
                      >
                        <strong>{ex.name}</strong>
                        <span className="text-xs text-[var(--palette-text-muted)]">{ex.muscle_group_name} / {ex.equipment_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedExercise && (
                <form onSubmit={handleLogExercise} className={card}>
                  <h3 className="mb-3 text-base font-semibold">Log Set - {exercises.find(e => e.id == selectedExercise)?.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Set #</label>
                      <input className={input} type="number" min="1" value={setNumber} onChange={e => setSetNumber(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Reps *</label>
                      <input className={input} type="number" min="1" value={reps} onChange={e => setReps(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
                      <input className={input} type="number" min="0" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className={`${btnPrimary} w-full`}>Log Set</button>
                </form>
              )}

              {sessionLogs.length > 0 && (
                <div className={card}>
                  <h3 className="mb-3 text-base font-semibold">Current Session Logs</h3>
                  <ul className="flex flex-col gap-2">
                    {sessionLogs.map(log => (
                      <li key={log.id} className="flex items-center justify-between p-2 px-3 border border-[var(--palette-border)] rounded-lg text-sm">
                        <div className="flex flex-col gap-0.5">
                          <strong>{log.exercise_name}</strong>
                          <span className="text-xs text-[var(--palette-text-muted)]">Set {log.set_number}: {log.reps} reps{log.weight ? ` @ ${log.weight} lbs` : ''}</span>
                        </div>
                        <button onClick={() => handleDeleteLog(log.id)} className={btnDanger}>X</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {completedSessions.length > 0 && (
            <div className={card}>
              <h3 className="mb-3 text-base font-semibold">Completed Sessions Today</h3>
              {completedSessions.map(s => (
                <div key={s.id} className="flex flex-wrap justify-between items-center gap-2 py-2 border-b border-[var(--palette-border)] last:border-b-0 text-sm">
                  <span>{new Date(s.start_time).toLocaleTimeString()} - {s.end_time ? new Date(s.end_time).toLocaleTimeString() : 'N/A'}</span>
                  <span>{s.total_calories_burned} cal burned</span>
                  <span className="text-[0.7rem] px-2 py-0.5 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
