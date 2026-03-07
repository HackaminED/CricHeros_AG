import React, { useState, useEffect } from 'react';
import { getLeaderboard, getStats } from '../api/api';
import { useGender } from '../context/GenderContext';
import KPIGrid from '../components/KPIGrid';
import LeaderboardTable from '../components/LeaderboardTable';

export default function Leaderboard() {
  const { gender } = useGender();
  const [data, setData] = useState([]);
  const [stats, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [minInnings, setMinInnings] = useState(10);

  useEffect(() => {
    loadData();
  }, [role, minInnings, gender]);

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
          Top players ranked by Three-Layer Impact Metric
        </p>
      </header>

      {stats && <KPIGrid stats={stats} />}

      <LeaderboardTable
        data={data}
        loading={loading}
        role={role}
        setRole={setRole}
        minInnings={minInnings}
        setMinInnings={setMinInnings}
      />
    </div>
  );
}
