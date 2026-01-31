const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Auth
export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const register = (username, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });

// User
export const getProfile = () => request('/user/profile');
export const updateSettings = (settings) =>
  request('/user/settings', { method: 'PUT', body: JSON.stringify(settings) });
export const getDailySummary = (date) =>
  request(`/user/summary?date=${date}`);

// Meals
export const getMeals = (date) => request(`/meals?date=${date}`);
export const addMeal = (meal) =>
  request('/meals', { method: 'POST', body: JSON.stringify(meal) });
export const deleteMeal = (id) =>
  request(`/meals/${id}`, { method: 'DELETE' });

// Simple Workouts
export const getWorkouts = (date) => request(`/workouts?date=${date}`);
export const addWorkout = (workout) =>
  request('/workouts', { method: 'POST', body: JSON.stringify(workout) });
export const deleteWorkout = (id) =>
  request(`/workouts/${id}`, { method: 'DELETE' });

// Barcode
export const lookupBarcode = (barcode) => request(`/barcode/${barcode}`);

// Exercises
export const getExercises = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/exercises?${query}`);
};
export const getMuscleGroups = () => request('/exercises/muscle-groups');
export const getEquipmentTypes = () => request('/exercises/equipment-types');
export const getMyEquipment = () => request('/exercises/my-equipment');
export const updateMyEquipment = (equipmentIds) =>
  request('/exercises/my-equipment', { method: 'PUT', body: JSON.stringify({ equipment_ids: equipmentIds }) });

// Workout Sessions
export const startSession = (date) =>
  request('/sessions/start', { method: 'POST', body: JSON.stringify({ date }) });
export const getActiveSession = () => request('/sessions/active');
export const getSessionsByDate = (date) => request(`/sessions?date=${date}`);
export const stopSession = (id) =>
  request(`/sessions/${id}/stop`, { method: 'PUT' });
export const logExercise = (data) =>
  request('/sessions/log', { method: 'POST', body: JSON.stringify(data) });
export const getSessionLogs = (id) => request(`/sessions/${id}/logs`);
export const deleteExerciseLog = (logId) =>
  request(`/sessions/log/${logId}`, { method: 'DELETE' });
