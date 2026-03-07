import React from 'react';

const defaultStats = {
  total_players: '—',
  total_matches: '—',
  average_impact: '—',
};

export default function KPIGrid({ stats = defaultStats }) {
  const cards = [
    {
      label: 'Players analyzed',
      value: typeof stats.total_players === 'number' ? stats.total_players.toLocaleString() : stats.total_players,
      sub: 'Major nations',
    },
    {
      label: 'Matches',
      value: typeof stats.total_matches === 'number' ? stats.total_matches.toLocaleString() : stats.total_matches,
      sub: 'Analyzed',
    },
    {
      label: 'Average Impact',
      value: typeof stats.average_impact === 'number' ? stats.average_impact.toFixed(1) : stats.average_impact,
      sub: 'Across players',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--grid-gap)]" role="group" aria-label="Key metrics">
      {cards.map((card, i) => (
        <div
          key={card.label}
        className="rounded-[var(--radius-lg)] p-4 md:p-6 transition-transform duration-200 hover:shadow-strong dark-no-border"
        style={{
          background: 'var(--surface-card)',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid rgba(58,110,165,0.15)',
        }}
        >
          <p className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p
            className="text-stat font-display font-bold tabular-nums"
            style={{ color: 'var(--accent-strong)', fontSize: '36px', lineHeight: 1.2 }}
          >
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[var(--text-small)] text-[var(--text-secondary)] mt-1">{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
