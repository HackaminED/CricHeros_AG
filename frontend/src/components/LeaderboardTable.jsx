import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGender } from '../context/GenderContext';
import CategoryBadge from './CategoryBadge';
import AnimatedList from './AnimatedList';

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

      {/* Table Replacement (Animated List) */}
      <div
        className="rounded-[var(--radius-lg)] overflow-hidden dark-no-border h-[800px] flex flex-col"
        style={{ boxShadow: 'var(--shadow-soft)', background: 'var(--bg)', border: '1px solid rgba(58,110,165,0.2)', position: 'relative' }}
      >
        {/* Header Row */}
        <div className="flex items-center text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--muted)]/50 pb-3 pt-4 px-6 bg-[var(--surface-muted)] shrink-0 z-20 shadow-md">
          <div className="w-16 text-center font-bold">Rank</div>
          <div className="flex-1 min-w-[150px] font-bold">Player</div>
          <div className="w-24 text-left font-bold hidden sm:block">Team</div>
          <div className="w-28 text-center font-bold">IM Score</div>
          <div className="w-32 text-center font-bold hidden md:block">Category</div>
          <div className="w-20 text-right font-bold hidden lg:block">Innings</div>
          <div className="w-20 text-right font-bold hidden lg:block">Runs</div>
          <div className="w-20 text-right font-bold hidden lg:block">Wickets</div>
        </div>

        {/* List Body */}
        {data.length > 0 ? (
          <div className="flex-1 w-full overflow-hidden">
            <AnimatedList
              items={data}
              onItemSelect={handleRowClick}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
              listContainerClassName="px-4 py-2"
              renderItem={(p, idx, isSelected) => (
                <div
                  className={`flex items-center px-2 py-4 rounded-xl border border-[var(--muted)]/20 cursor-pointer transition-all duration-300 card-hover mb-3 ${
                    isSelected ? 'ring-2 ring-[var(--accent)] bg-[var(--surface-muted)] scale-[1.02]' : 'bg-[var(--surface-card)] hover:bg-[var(--surface-muted)]'
                  } ${idx < 3 ? 'shadow-[0_4px_20px_rgba(16,185,129,0.1)]' : ''}`}
                  style={{
                    borderLeft: idx < 3 ? '4px solid var(--accent)' : '4px solid transparent',
                  }}
                  aria-label={`${p.player}, rank ${idx + 1}, impact score ${p.impact_score?.toFixed(1)}`}
                >
                  {/* Rank */}
                  <div className="w-16 text-center text-lg md:text-xl">
                    <RankCell index={idx} />
                  </div>
                  
                  {/* Player Name */}
                  <div className="flex-1 min-w-[150px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {p.player.substring(0, 2).toUpperCase()}
                    </div>
                    <span>
                      {p.player}{' '}
                      <span className="opacity-70 text-xs ml-1" aria-hidden>
                        {gender === 'Women' ? '♀' : '♂'}
                      </span>
                    </span>
                  </div>

                  {/* Team */}
                  <div className="w-24 text-left text-[var(--text-secondary)] text-xs hidden sm:block truncate pr-2">
                    {p.team}
                  </div>

                  {/* IM Score (Highlight) */}
                  <div className="w-28 text-center">
                    <span
                      className="font-display font-bold tabular-nums px-3 py-1 bg-black/20 rounded-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      style={{ fontSize: '24px', color: 'var(--accent-strong)' }}
                    >
                      {p.impact_score?.toFixed(1)}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="w-32 text-center hidden md:block">
                    <CategoryBadge category={p.category} />
                  </div>

                  {/* Innings */}
                  <div className="w-20 text-right font-mono tabular-nums text-[var(--text-primary)] hidden lg:block opacity-80">
                    {p.total_innings}
                  </div>

                  {/* Runs */}
                  <div className="w-20 text-right font-mono tabular-nums text-[var(--accent-strong)] hidden lg:block font-medium">
                    {p.total_runs}
                  </div>

                  {/* Wickets */}
                  <div className="w-20 text-right font-mono tabular-nums text-[var(--surface)] hidden lg:block opacity-90">
                    {p.total_wickets}
                  </div>
                </div>
              )}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[var(--text-secondary)]" role="status">
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl">🏏</span>
              <p>No players found with the current filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
