import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getLeaderboardClutch, getStats } from '../api/api';
import { useGender } from '../context/GenderContext';
import KPIGrid from '../components/KPIGrid';
import LeaderboardTable from '../components/LeaderboardTable';

const TABS = [
  { key: 'overall', label: 'Overall Impact' },
  { key: 'clutch', label: 'Clutch Leaderboard' },
];

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
      const res = await getLeaderboardClutch(gender, 5, 100);
      setClutchData(res.leaderboard || []);
    } catch (err) {
      console.error(err);
      setClutchData([]);
    } finally {
      setClutchLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1
          className="font-display font-bold text-[var(--text-primary)]"
          style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--text-h1-lh)' }}
        >
          {gender}'s Leaderboard
        </h1>
        <p className="text-[var(--text-secondary)] mt-1" style={{ fontSize: 'var(--text-body)' }}>
          Top players ranked by Impact or Clutch
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-all ${
              tab === t.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {stats && tab === 'overall' && <KPIGrid stats={stats} />}

      {tab === 'overall' && (
        <LeaderboardTable
          data={data}
          loading={loading}
          role={role}
          setRole={setRole}
          minInnings={minInnings}
          setMinInnings={setMinInnings}
        />
      )}

      {tab === 'clutch' && (
        <div className="rounded-[var(--radius-lg)] overflow-hidden dark-no-border" style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}>
          {clutchLoading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[var(--accent-strong)] border-t-transparent rounded-full animate-spin" aria-hidden /></div>}
          {!clutchLoading && clutchData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--muted)]/50">
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    <th className="px-4 py-3 text-center">Swing % (avg/match)</th>
                    <th className="px-4 py-3 text-center">Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {clutchData.map((row) => (
                    <tr
                      key={row.player}
                      className="border-t border-[var(--muted)]/40 hover:bg-[var(--surface-muted)] cursor-pointer"
                      onClick={() => navigate(`/player?player=${encodeURIComponent(row.player)}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{row.player}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{row.team}</td>
                      <td className={`px-4 py-3 text-center font-mono font-bold ${(row.swing_percent || 0) >= 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'}`}>
                        {(row.swing_percent >= 0 ? '+' : '')}{row.swing_percent}%
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">{row.matches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!clutchLoading && clutchData.length === 0 && <p className="p-6 text-center text-[var(--text-secondary)]">No clutch data yet.</p>}
        </div>
      )}
    </div>
  );
}
