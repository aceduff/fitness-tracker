import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">FitTrack</div>
      <div className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/add-meal">Meals</NavLink>
        <NavLink to="/workout">Workout</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </div>
      <div className="nav-user">
        <span className="nav-username">{user?.username}</span>
        <button onClick={handleLogout} className="btn btn-sm">Logout</button>
      </div>
    </nav>
  );
}
