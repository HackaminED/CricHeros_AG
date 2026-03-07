import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GenderToggle from './GenderToggle';

const navItems = [
  { to: '/player', icon: '👤', label: 'Player Dashboard' },
  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { to: '/matches', icon: '🏏', label: 'Match Explorer' },
  { to: '/predictor', icon: '🔮', label: 'AI Predictor' },
];

export default function Sidebar({ open = true, onCollapse }) {
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className="fixed top-0 left-0 h-screen z-40 flex flex-col w-[280px] shrink-0 transition-all duration-300"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--glass-border)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="sidebar-section px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/favicon.png"
              alt=""
              className="w-10 h-10 shrink-0 rounded-xl object-cover shadow-lg"
              aria-hidden
            />
            {open && (
              <div className="hidden md:block min-w-0">
                <p
                  className="font-display font-bold leading-tight tracking-tight"
                  style={{ fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                >
                  Impact Heros
                </p>
                <p className="text-[var(--text-secondary)] text-xs font-medium mt-0.5">Performance Analytics</p>
              </div>
            )}
          </div>
          {open && (
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-1.02 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '🌙' : '☀'}
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5" aria-label="Primary">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 py-3 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              }`
            }
            end={to === '/matches' ? false : to === '/'}
          >
            <span className="text-lg opacity-90" aria-hidden>{icon}</span>
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-section px-3 py-5 space-y-4">
        {open && (
          <div aria-label="Toggle gender: men or women">
            <GenderToggle />
          </div>
        )}
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? '← Collapse' : '→'}
          </button>
        )}
      </div>
    </aside>
  );
}
