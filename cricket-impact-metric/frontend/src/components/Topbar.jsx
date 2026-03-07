import React from 'react';
import PlayerSearch from './PlayerSearch';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ onPlayerSelect, className = '' }) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={`flex items-center justify-between gap-4 py-3 px-4 md:px-6 border-b border-[var(--muted)]/40 bg-[var(--bg)] ${className}`}
      role="banner"
    >
      <div className="flex-1 flex justify-end max-w-xl ml-auto">
        <PlayerSearch onSelect={onPlayerSelect} />
      </div>
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="rounded-[var(--radius-lg)] px-4 py-2 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,78,152,0.5)]"
        style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
      </button>
    </header>
  );
}
