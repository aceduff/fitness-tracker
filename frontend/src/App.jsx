import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddMeal from './pages/AddMeal.jsx';
import AddWorkout from './pages/AddWorkout.jsx';
import WorkoutLog from './pages/WorkoutLog.jsx';
import Settings from './pages/Settings.jsx';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const { token, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      {token && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-meal" element={<ProtectedRoute><AddMeal /></ProtectedRoute>} />
          <Route path="/add-workout" element={<ProtectedRoute><AddWorkout /></ProtectedRoute>} />
          <Route path="/workout-log" element={<ProtectedRoute><WorkoutLog /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
