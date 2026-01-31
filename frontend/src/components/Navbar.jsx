import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode, palette, setPalette, PALETTES } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkBase = 'px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors';
  const linkInactive = `${linkBase} text-[var(--palette-text-muted)] hover:bg-[var(--palette-bg)]`;
  const linkActive = `${linkBase} bg-[var(--palette-primary)] text-white`;

  return (
    <nav className="sticky top-0 z-50 bg-[var(--palette-card)] border-b border-[var(--palette-border)] px-4 py-3 flex items-center gap-4 overflow-x-auto transition-colors">
      <div className="font-bold text-lg text-[var(--palette-primary)] whitespace-nowrap">FitTrack</div>
      <div className="flex gap-1 flex-1">
        <NavLink to="/" end className={({ isActive }) => isActive ? linkActive : linkInactive}>Dashboard</NavLink>
        <NavLink to="/add-meal" className={({ isActive }) => isActive ? linkActive : linkInactive}>Meals</NavLink>
        <NavLink to="/workout" className={({ isActive }) => isActive ? linkActive : linkInactive}>Workout</NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? linkActive : linkInactive}>Settings</NavLink>
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <select
          value={palette}
          onChange={e => setPalette(e.target.value)}
          className="px-2 py-1 text-xs rounded-lg border border-[var(--palette-border)] bg-[var(--palette-card)] text-[var(--palette-text)] cursor-pointer"
        >
          {PALETTES.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg border border-[var(--palette-border)] bg-[var(--palette-card)] text-[var(--palette-text)] hover:bg-[var(--palette-bg)] transition-colors cursor-pointer"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <span className="text-sm text-[var(--palette-text-muted)] hidden sm:inline">{user?.username}</span>
        <button
          onClick={handleLogout}
          className="px-2 py-1 rounded-lg text-xs border border-[var(--palette-border)] bg-[var(--palette-card)] text-[var(--palette-text)] hover:bg-[var(--palette-bg)] transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
