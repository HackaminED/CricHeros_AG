import React from 'react';
import { useGender } from '../context/GenderContext';

export default function PlayerCard({
  player,
  team,
  impactScore,
  category,
  totalInnings,
  totalRuns,
  totalWickets,
  onClick,
  isTop3 = false,
}) {
  const { gender } = useGender();

  const categoryStyles = {
    'Match Winner': 'bg-[var(--accent)] text-white',
    'High Impact': 'bg-[var(--surface)] text-white',
    'Neutral': 'bg-[var(--muted)] text-[var(--text-primary)]',
    'Low Impact': 'bg-[var(--accent)]/80 text-white',
    'Poor Impact': 'bg-[var(--muted)] text-[var(--text-primary)]',
  };

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-[var(--radius-lg)] p-4 transition-all duration-200 ${
        onClick ? 'card-hover cursor-pointer' : ''
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)]`}
      style={{
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid rgba(58,110,165,0.15)',
        borderLeft: isTop3 ? '6px solid var(--accent)' : undefined,
      }}
      aria-label={onClick ? `${player}, impact ${impactScore?.toFixed(1)}` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-[var(--text-primary)] text-base">
            {player}{' '}
            <span className="opacity-70 text-sm" aria-hidden>
              {gender === 'Women' ? '♀' : '♂'}
            </span>
          </h3>
          <p className="text-[var(--text-small)] text-[var(--text-secondary)] mt-0.5">{team}</p>
        </div>
        <span
          className="font-display font-bold tabular-nums shrink-0"
          style={{ fontSize: '28px', color: 'var(--accent-strong)' }}
        >
          {impactScore != null ? impactScore.toFixed(1) : '—'}
        </span>
      </div>
      {category && (
        <span
          className={`inline-block mt-2 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-semibold ${
            categoryStyles[category] || 'bg-[var(--muted)] text-[var(--text-primary)]'
          }`}
        >
          {category}
        </span>
      )}
      {(totalInnings != null || totalRuns != null || totalWickets != null) && (
        <div className="flex gap-4 mt-3 text-[var(--text-small)] text-[var(--text-secondary)]">
          {totalInnings != null && (
            <span className="tabular-nums">Inn: {totalInnings}</span>
          )}
          {totalRuns != null && (
            <span className="tabular-nums">Runs: {totalRuns}</span>
          )}
          {totalWickets != null && (
            <span className="tabular-nums">Wkts: {totalWickets}</span>
          )}
        </div>
      )}
    </article>
  );
}
