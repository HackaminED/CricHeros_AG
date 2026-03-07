import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedList from './AnimatedList';

export default function MatchList({ matches = [], loading = false, winnerTeamLabel }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-24" role="status" aria-live="polite">
        <div
          className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <span className="sr-only">Loading matches</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center text-[var(--text-secondary)] dark-no-border"
        style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}
        role="status"
      >
        No matches found
      </div>
    );
  }

  return (
    <div className="h-[620px] w-full" role="list">
      <AnimatedList
        items={matches}
        listContainerClassName="pr-2 pb-4 space-y-3"
        showGradients={true}
        enableArrowNavigation={true}
        displayScrollbar={true}
        onItemSelect={(m) => navigate(`/matches/${m.match_id}`)}
        renderItem={(m, index, isSelected) => (
          <div
            className={`rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-left transition-all duration-200 card-hover dark-no-border ${isSelected ? 'ring-2 ring-[var(--accent)]' : ''}`}
            style={{
              background: isSelected ? 'var(--surface-muted)' : 'var(--surface-card)',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--glass-border)',
            }}
            id={`match-${m.match_id}`}
            aria-label={`Match ${m.match_id}: ${m.teams?.join(' vs ') || 'Match'}${m.winner ? `, winner ${m.winner}` : ''}`}
          >
            <div>
              <p className="font-display font-bold text-[var(--text-primary)] text-lg">
                {m.teams?.join(' vs ') || `Match ${m.match_id}`}
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{m.date}</p>
              {winnerTeamLabel && m.winner && (
                <span
                  className="inline-block mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-glow)' }}
                >
                  Winner: {m.winner}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Match ID</p>
              <p className="font-display font-bold text-[var(--accent-strong)]">{m.match_id}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
