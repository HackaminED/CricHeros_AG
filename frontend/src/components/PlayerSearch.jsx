import React, { useState, useEffect, useRef } from 'react';
import { getPlayers } from '../api/api';
import { useGender } from '../context/GenderContext';
import { useTheme } from '../context/ThemeContext';

export default function PlayerSearch({ onSelect }) {
  const { gender } = useGender();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);
  const [searchGender, setSearchGender] = useState(gender);

  useEffect(() => {
    setSearchGender(gender);
  }, [gender]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getPlayers(query, 8, searchGender);
        setResults(data.players || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [query, searchGender]);

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (player) => {
    setQuery(player.player);
    setIsOpen(false);
    onSelect?.(player);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className="relative rounded-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg)]"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search players…"
          className="player-search-input w-full pl-12 pr-12 py-3.5 rounded-2xl bg-transparent border-0 focus:outline-none text-[var(--input-text)] placeholder-[var(--input-placeholder)]"
          id="player-search-input"
          aria-label="Search players"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden>
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-50 py-1 dark-no-border"
          style={{
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-strong)',
            border: '1px solid var(--glass-border)',
          }}
          role="listbox"
        >
          {results.map((player, idx) => (
            <li key={player.player} role="option" id={`suggestion-${idx}`} aria-selected={idx === selectedIndex}>
              <button
                type="button"
                onClick={() => handleSelect(player)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors rounded-xl mx-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  idx === selectedIndex ? 'bg-[var(--surface-muted)]' : 'hover:bg-[var(--surface-muted)]'
                }`}
                style={{ color: 'var(--text-primary)' }}
              >
                <div>
                  <p className="font-semibold text-sm">{player.player}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{player.team}</p>
                </div>
                <span className="font-display font-bold text-sm tabular-nums" style={{ color: 'var(--accent-strong)' }}>
                  {player.impact_score?.toFixed(1)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
