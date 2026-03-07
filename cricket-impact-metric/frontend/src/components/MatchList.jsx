import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatchList({ matches = [], loading = false, winnerTeamLabel }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <div
          className="w-10 h-10 border-2 border-[var(--accent-strong)] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <span className="sr-only">Loading matches</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-lg)] p-8 text-center text-[var(--text-secondary)]"
        style={{ background: 'var(--surface-muted)' }}
        role="status"
      >
        No matches found
      </div>
    );
  }

  return (
    <div className="grid gap-[var(--grid-gap)]" role="list">
      {matches.map((m) => (
        <button
          key={m.match_id}
          type="button"
          onClick={() => navigate(`/matches/${m.match_id}`)}
          className="rounded-[var(--radius-lg)] p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 text-left transition-all duration-200 card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)] dark-no-border"
          style={{
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid rgba(58,110,165,0.2)',
          }}
          id={`match-${m.match_id}`}
          aria-label={`Match ${m.match_id}: ${m.teams?.join(' vs ') || 'Match'}${m.winner ? `, winner ${m.winner}` : ''}`}
        >
          <div>
            <p className="font-display font-bold text-[var(--text-primary)] text-base md:text-lg">
              {m.teams?.join(' vs ') || `Match ${m.match_id}`}
            </p>
            <p className="text-[var(--text-small)] text-[var(--text-secondary)] mt-1">{m.date}</p>
            {winnerTeamLabel && m.winner && (
              <span
                className="inline-block mt-2 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Winner: {m.winner}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-[var(--text-small)] text-[var(--text-secondary)]">Match ID</p>
            <p className="font-mono font-semibold text-[var(--accent-strong)]">{m.match_id}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
