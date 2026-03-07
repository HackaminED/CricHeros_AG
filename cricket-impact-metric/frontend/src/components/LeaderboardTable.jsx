import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGender } from '../context/GenderContext';
import CategoryBadge from './CategoryBadge';

function RankCell({ index }) {
  if (index === 0) return <span aria-label="Gold">🥇</span>;
  if (index === 1) return <span aria-label="Silver">🥈</span>;
  if (index === 2) return <span aria-label="Bronze">🥉</span>;
  return <span className="tabular-nums font-semibold">#{index + 1}</span>;
}

export default function LeaderboardTable({
  data = [],
  loading = false,
  role,
  setRole,
  minInnings,
  setMinInnings,
  onPlayerClick,
}) {
  const navigate = useNavigate();
  const { gender } = useGender();

  const handleRowClick = (player) => {
    if (onPlayerClick) onPlayerClick(player);
    else navigate(`/player?player=${encodeURIComponent(player.player)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <div
          className="w-10 h-10 border-2 border-[var(--accent-strong)] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <span className="sr-only">Loading leaderboard</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-end">
        {[
          { key: null, label: 'All' },
          { key: 'batter', label: 'Batters' },
          { key: 'bowler', label: 'Bowlers' },
        ].map((r) => (
          <button
            key={r.key || 'all'}
            type="button"
            onClick={() => setRole(r.key)}
            className={`px-4 py-2 rounded-[var(--radius-pill)] text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)] ${
              role === r.key
                ? 'bg-[var(--accent)] text-white shadow-soft'
                : 'bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--surface-card)]'
            }`}
            id={`filter-${r.key || 'all'}`}
            aria-pressed={role === r.key}
          >
            {r.label}
          </button>
        ))}
        <label htmlFor="min-innings-select" className="text-[var(--text-small)] text-[var(--text-secondary)] ml-2">
          Min Innings:
        </label>
        <select
          id="min-innings-select"
          value={minInnings}
          onChange={(e) => setMinInnings(Number(e.target.value))}
          className="rounded-[var(--radius-md)] px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--muted)] text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,78,152,0.5)]"
          aria-label="Minimum innings filter"
        >
          {[5, 10, 15, 20, 30].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-[var(--radius-lg)] overflow-hidden dark-no-border"
        style={{ boxShadow: 'var(--shadow-soft)', background: 'var(--surface-card)', border: '1px solid rgba(58,110,165,0.2)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid" aria-label="Leaderboard">
            <thead>
              <tr className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--muted)]/50">
                <th className="px-4 py-4 text-center w-16">Rank</th>
                <th className="px-6 py-4 text-left">Player</th>
                <th className="px-4 py-4 text-left">Team</th>
                <th className="px-4 py-4 text-center">IM Score</th>
                <th className="px-4 py-4 text-center">Category</th>
                <th className="px-4 py-4 text-right tabular-nums">Innings</th>
                <th className="px-4 py-4 text-right tabular-nums">Runs</th>
                <th className="px-4 py-4 text-right tabular-nums">Wickets</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, idx) => (
                <tr
                  key={p.player}
                  onClick={() => handleRowClick(p)}
                  className={`border-t border-[var(--muted)]/40 cursor-pointer transition-all duration-200 card-hover ${
                    idx < 3 ? 'bg-[var(--surface-muted)]' : ''
                  }`}
                  style={{
                    padding: 'var(--space-3)',
                    borderLeft: idx < 3 ? '4px solid var(--accent)' : undefined,
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(p);
                    }
                  }}
                  aria-label={`${p.player}, rank ${idx + 1}, impact score ${p.impact_score?.toFixed(1)}`}
                >
                  <td className="px-4 py-3 text-center text-lg">
                    <RankCell index={idx} />
                  </td>
                  <td className="px-6 py-3 font-semibold text-[var(--text-primary)]">
                    {p.player}{' '}
                    <span className="opacity-70 text-xs ml-1" aria-hidden>
                      {gender === 'Women' ? '♀' : '♂'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">
                    {p.team}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="font-display font-bold tabular-nums"
                      style={{ fontSize: '36px', color: 'var(--accent-strong)' }}
                    >
                      {p.impact_score?.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CategoryBadge category={p.category} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--text-primary)]">
                    {p.total_innings}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--accent-strong)]">
                    {p.total_runs}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--surface)]">
                    {p.total_wickets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="p-8 text-center text-[var(--text-secondary)]" role="status">
            No players found with the current filters
          </div>
        )}
      </div>
    </div>
  );
}
