import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddMeal from './pages/AddMeal.jsx';
import Workout from './pages/Workout.jsx';
import Settings from './pages/Settings.jsx';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="text-center p-8 text-[var(--palette-text-muted)]">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const { token, loading } = useAuth();

  if (loading) return <div className="text-center p-8 text-[var(--palette-text-muted)]">Loading...</div>;

  return (
    <div className="min-h-screen">
      {token && <Navbar />}
      <main className="max-w-[900px] mx-auto p-4 pb-20">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-meal" element={<ProtectedRoute><AddMeal /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
