import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ className = '' }) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={`header-bar flex items-center justify-between gap-4 py-3 px-4 md:px-6 border-b border-[var(--muted)]/40 bg-[var(--bg)] ${className}`}
      role="banner"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ background: 'var(--accent-strong)', boxShadow: 'var(--shadow-soft)' }}
          aria-hidden
        >
          IM
        </div>
        <h1 className="font-display font-bold text-[var(--text-primary)] text-lg md:text-xl">
          Impact Heros
        </h1>
      </div>
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="theme-toggle rounded-[999px] px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,78,152,0.5)] ml-4"
        style={{
          background: 'var(--surface-muted)',
          color: 'var(--text-primary)',
        }}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
      </button>
    </header>
  );
}
