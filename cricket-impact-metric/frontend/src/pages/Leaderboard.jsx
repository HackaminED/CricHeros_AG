import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getLeaderboardClutch, getStats } from '../api/api';
import { useGender } from '../context/GenderContext';
import CategoryBadge from '../components/CategoryBadge';

const TABS = [
  { key: 'overall', label: 'Overall Impact', icon: '📊' },
  { key: 'clutch', label: 'Clutch', icon: '⚡' },
];

const ROLE_FILTERS = [
  { key: null, label: 'All' },
  { key: 'batter', label: 'Batters' },
  { key: 'bowler', label: 'Bowlers' },
];

const MIN_INNINGS_OPTIONS = [5, 10, 15, 20, 30];

function RankBadge({ index }) {
  if (index === 0) return <span className="text-2xl" aria-label="Gold">🥇</span>;
  if (index === 1) return <span className="text-2xl" aria-label="Silver">🥈</span>;
  if (index === 2) return <span className="text-2xl" aria-label="Bronze">🥉</span>;
  return (
    <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--surface-muted)] text-[var(--text-secondary)] tabular-nums">
      #{index + 1}
    </span>
  );
}

function Avatar({ name }) {
  const initials = (name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ background: 'linear-gradient(135deg, var(--accent-strong), var(--surface))' }}
    >
      {initials || '?'}
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { gender } = useGender();
  const [tab, setTab] = useState('overall');
  const [data, setData] = useState([]);
  const [clutchData, setClutchData] = useState([]);
  const [stats, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clutchLoading, setClutchLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [minInnings, setMinInnings] = useState(10);

  useEffect(() => {
    loadData();
  }, [role, minInnings, gender]);

  useEffect(() => {
    if (tab === 'clutch') loadClutch();
  }, [tab, gender]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lb, st] = await Promise.all([
        getLeaderboard(50, minInnings, role, null, gender),
        getStats(),
      ]);
      setData(lb.leaderboard || []);
      setStatsData(st);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClutch = async () => {
    setClutchLoading(true);
    try {
      const res = await getLeaderboardClutch(gender, 10, 100);
      setClutchData(res.leaderboard || []);
    } catch (err) {
      console.error(err);
      setClutchData([]);
    } finally {
      setClutchLoading(false);
    }
  };

  const isOverall = tab === 'overall';
  const isLoading = isOverall ? loading : clutchLoading;
  const list = isOverall ? data : clutchData;

  const handlePlayerClick = (playerName) => {
    navigate(`/player?player=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="animate-page-enter max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display font-bold text-[var(--text-primary)] text-3xl md:text-4xl tracking-tight">
          {gender}'s Leaderboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-base">
          Top players by impact score or clutch performance
        </p>
      </header>

      {/* Tabs */}
      <div
        className="inline-flex p-1 rounded-2xl mb-8"
        style={{ background: 'var(--surface-muted)' }}
        role="tablist"
        aria-label="Leaderboard type"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? 'bg-[var(--accent)] text-white shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats (Overall only) */}
      {stats && isOverall && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Players',
              value: typeof stats.total_players === 'number' ? stats.total_players.toLocaleString() : stats.total_players,
              sub: 'Analyzed',
            },
            {
              label: 'Matches',
              value: typeof stats.total_matches === 'number' ? stats.total_matches.toLocaleString() : stats.total_matches,
              sub: 'In dataset',
            },
            {
              label: 'Avg Impact',
              value: typeof stats.average_impact === 'number' ? stats.average_impact.toFixed(1) : stats.average_impact,
              sub: 'Across players',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4 dark-no-border"
              style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
            >
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-2xl font-display font-bold tabular-nums mt-0.5" style={{ color: 'var(--accent-strong)' }}>
                {card.value}
              </p>
              {card.sub && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{card.sub}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters (Overall only) */}
      {isOverall && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r.key || 'all'}
              type="button"
              onClick={() => setRole(r.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                role === r.key
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-muted)] text-[var(--text-primary)] hover:opacity-90'
              }`}
              aria-pressed={role === r.key}
            >
              {r.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <label htmlFor="min-innings" className="text-sm text-[var(--text-secondary)]">
              Min innings
            </label>
            <select
              id="min-innings"
              value={minInnings}
              onChange={(e) => setMinInnings(Number(e.target.value))}
              className="rounded-xl px-3 py-2 text-sm bg-[var(--surface-card)] text-[var(--text-primary)] border-0 focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Minimum innings"
            >
              {MIN_INNINGS_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* List */}
      <div
        className="rounded-2xl overflow-hidden dark-no-border card-hover"
        style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-strong)', border: '1px solid var(--glass-border)' }}
      >
        {isLoading ? (
          <div className="flex justify-center py-20" role="status" aria-live="polite">
            <div
              className="w-10 h-10 border-2 border-[var(--accent-strong)] border-t-transparent rounded-full animate-spin"
              aria-hidden
            />
            <span className="sr-only">Loading leaderboard</span>
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">
            <p className="text-lg">No data yet</p>
            <p className="text-sm mt-1">
              {isOverall ? 'Try lowering min innings or changing filters.' : 'Clutch data will appear when available.'}
            </p>
          </div>
        ) : isOverall ? (
          <ul className="divide-y divide-[var(--muted)]/30" aria-label="Impact leaderboard">
            {list.map((p, idx) => (
              <li key={p.player}>
                <button
                  type="button"
                  onClick={() => handlePlayerClick(p.player)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
                  style={{
                    borderLeft: idx < 3 ? '4px solid var(--accent)' : '4px solid transparent',
                  }}
                >
                  <div className="w-12 flex justify-center shrink-0">
                    <RankBadge index={idx} />
                  </div>
                  <Avatar name={p.player} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--text-primary)] truncate">
                      {p.player}
                      <span className="opacity-60 text-xs ml-1" aria-hidden>
                        {gender === 'Women' ? '♀' : '♂'}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{p.team}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">IM Score</p>
                    <p className="text-xl font-display font-bold tabular-nums" style={{ color: 'var(--accent-strong)' }}>
                      {p.impact_score?.toFixed(1) ?? '—'}
                    </p>
                  </div>
                  <div className="w-28 shrink-0 hidden sm:block text-center">
                    <CategoryBadge category={p.category} />
                  </div>
                  <div className="w-20 shrink-0 text-right hidden md:block">
                    <p className="text-xs text-[var(--text-secondary)]">Innings</p>
                    <p className="font-mono tabular-nums text-[var(--text-primary)]">{p.total_innings ?? '—'}</p>
                  </div>
                  <div className="w-16 shrink-0 text-right hidden lg:block">
                    <p className="text-xs text-[var(--text-secondary)]">Runs</p>
                    <p className="font-mono tabular-nums text-[var(--accent)]">{p.total_runs ?? '—'}</p>
                  </div>
                  <div className="w-16 shrink-0 text-right hidden lg:block">
                    <p className="text-xs text-[var(--text-secondary)]">Wkts</p>
                    <p className="font-mono tabular-nums text-[var(--text-primary)]">{p.total_wickets ?? '—'}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-[var(--muted)]/30" aria-label="Clutch leaderboard">
            {clutchData.map((row, idx) => (
              <li key={row.player}>
                <button
                  type="button"
                  onClick={() => handlePlayerClick(row.player)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
                  style={{
                    borderLeft: idx < 3 ? '4px solid var(--accent)' : '4px solid transparent',
                  }}
                >
                  <div className="w-12 flex justify-center shrink-0">
                    <RankBadge index={idx} />
                  </div>
                  <Avatar name={row.player} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{row.player}</p>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{row.team}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Swing %</p>
                    <p
                      className={`text-xl font-display font-bold tabular-nums ${
                        (row.swing_percent || 0) >= 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'
                      }`}
                    >
                      {(row.swing_percent >= 0 ? '+' : '')}{row.swing_percent}%
                    </p>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <p className="text-xs text-[var(--text-secondary)]">Matches</p>
                    <p className="font-mono tabular-nums text-[var(--text-primary)]">{row.matches ?? '—'}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
