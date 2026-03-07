import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGender } from '../context/GenderContext';
import GenderToggle from './GenderToggle';

const navItems = [
  { to: '/player', icon: '👤', label: 'Player Dashboard' },
  { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { to: '/matches', icon: '🏏', label: 'Match Explorer' },
];

export default function Sidebar({ open = true, onCollapse }) {
  return (
    <aside
      className="fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col w-[280px] shrink-0 transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, rgba(58,110,165,0.06), rgba(0,78,152,0.02)), var(--bg)',
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="sidebar-section px-4 py-6 border-b border-[var(--muted)]/40">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl font-bold text-white shadow-soft"
            style={{ background: 'var(--accent-strong)' }}
          >
            IM
          </div>
          {open && (
            <div className="hidden md:block">
              <p className="font-display font-bold text-[var(--text-primary)] text-sm">Cricket Impact</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Metric</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav pills */}
      <nav className="flex-1 px-3 py-6 space-y-2.5" aria-label="Primary" style={{ ['--item-gap']: '10px' }}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)] ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-soft'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              }`
            }
            style={{ padding: '12px 16px' }}
            end={to === '/matches' ? false : to === '/'}
          >
            <span className="text-lg" aria-hidden>{icon}</span>
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Gender toggle + collapse */}
      <div className="sidebar-section px-3 py-6 border-t border-[var(--muted)]/40 space-y-4">
        {open && (
          <div aria-label="Toggle gender: men or women">
            <GenderToggle />
          </div>
        )}
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="w-full flex items-center justify-center py-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)]"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? '← Collapse' : '→'}
          </button>
        )}
      </div>
    </aside>
  );
}
