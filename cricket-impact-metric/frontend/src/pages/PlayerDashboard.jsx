import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImpactGauge from '../components/ImpactGauge';
import ImpactTrendChart from '../components/ImpactTrendChart';
import PlayerSearch from '../components/PlayerSearch';
import ExplainModal from '../components/ExplainModal';
import InningsTable from '../components/InningsTable';
import CategoryBadge from '../components/CategoryBadge';
import { getPlayerImpact, getPlayerTrend } from '../api/api';
import { useGender } from '../context/GenderContext';

function StatCard({ label, value, sub, colorClass = 'text-[var(--accent-strong)]', info }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] p-4 relative group"
      style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(58,110,165,0.15)' }}
    >
      <p className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold tabular-nums ${colorClass}`}>{value ?? '—'}</p>
      {sub && <p className="text-[var(--text-small)] text-[var(--text-secondary)] mt-1">{sub}</p>}
      {info && (
        <span
          className="absolute top-2 right-2 text-[var(--text-secondary)] text-xs cursor-help opacity-0 group-hover:opacity-100 transition-opacity"
          title={info}
        >
          ℹ
        </span>
      )}
    </div>
  );
}

export default function PlayerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerData, setPlayerData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [trend3Layer, setTrend3Layer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastN, setLastN] = useState(10);
  const [showExplain, setShowExplain] = useState(false);
  const { gender, toggleGender } = useGender();

  const playerName = searchParams.get('player');

  useEffect(() => {
    if (!playerName) return;
    loadPlayer(playerName, gender);
  }, [playerName, lastN, gender]);

  const loadPlayer = async (name, currentGender) => {
    setLoading(true);
    setError(null);
    try {
      const [impact, trend] = await Promise.all([
        getPlayerImpact(name, lastN, currentGender),
        getPlayerTrend(name, 10, lastN, currentGender),
      ]);

      if (impact.gender && impact.gender !== currentGender) {
        toggleGender(impact.gender);
        return;
      }

      setPlayerData(impact);
      setTrendData(trend.trend || []);
      setTrend3Layer(trend.trend_3layer || impact.last_n_innings || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load player data');
      setPlayerData(null);
      setTrendData([]);
      setTrend3Layer([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (player) => {
    setSearchParams({ player: player.player });
  };

  const stats = playerData?.last_n_stats;
  const career = playerData?.career;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1
            className="font-display font-bold text-[var(--text-primary)]"
            style={{ fontSize: 'var(--text-h1)', lineHeight: 'var(--text-h1-lh)' }}
          >
            Player Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Search and analyze player impact metrics</p>
        </div>
        <PlayerSearch onSelect={handleSelect} />
      </header>

      {loading && (
        <div className="flex justify-center py-20" role="status" aria-live="polite">
          <div
            className="w-10 h-10 border-2 border-[var(--accent-strong)] border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          <span className="sr-only">Loading player</span>
        </div>
      )}

      {error && (
        <div
          className="rounded-[var(--radius-lg)] p-6 border-2 text-center"
          style={{ borderColor: 'var(--accent)', background: 'var(--surface-muted)' }}
        >
          <p className="text-[var(--text-primary)]">{error}</p>
        </div>
      )}

      {!playerName && !loading && (
        <div
          className="rounded-[var(--radius-lg)] p-16 text-center"
          style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
        >
          <div className="text-6xl mb-4" aria-hidden>🏏</div>
          <h2 className="font-display font-semibold text-[var(--text-primary)] mb-2" style={{ fontSize: 'var(--text-h2)' }}>
            Search for a Player
          </h2>
          <p className="text-[var(--text-secondary)]">Use the search bar above to find a player and view their impact analysis</p>
        </div>
      )}

      {playerData && !loading && (
        <>
          {/* Player header + Impact Gauge */}
          <div
            className="rounded-[var(--radius-lg)] p-6 md:p-8 relative overflow-hidden"
            style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-strong)', border: '1px solid rgba(58,110,165,0.2)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <ImpactGauge
                score={playerData.impact_score || 0}
                size={200}
                onInfoClick={() => setShowExplain(true)}
                showNeonRim={playerData.impact_score >= 80}
              />

              <div className="flex-1 text-center md:text-left">
                <h2
                  className="font-display font-bold text-[var(--text-primary)] mb-1 flex items-center justify-center md:justify-start gap-3"
                  style={{ fontSize: 'var(--text-h2)' }}
                >
                  {playerData.player}
                  <span className="opacity-80 text-[var(--accent-strong)]" aria-hidden>
                    {gender === 'Women' ? '♀' : '♂'}
                  </span>
                </h2>
                <p className="text-[var(--text-secondary)] font-medium mb-1 flex items-center justify-center md:justify-start gap-2">
                  {playerData.team}
                  <span
                    className="text-xs px-3 py-1 rounded-[var(--radius-pill)] uppercase tracking-wider font-semibold"
                    style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
                  >
                    {gender}
                  </span>
                </p>
                {playerData.category && (
                  <span className="inline-block mt-2">
                    <CategoryBadge category={playerData.category} />
                  </span>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  <StatCard
                    label="Batting Component"
                    value={playerData.batting_impact_component?.toFixed(1) || '0'}
                    sub="Avg performance"
                    colorClass={playerData.batting_impact_component > 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'}
                    info="Average batting performance score across last N innings"
                  />
                  <StatCard
                    label="Bowling Component"
                    value={playerData.bowling_impact_component?.toFixed(1) || '0'}
                    sub="Avg performance"
                    colorClass={playerData.bowling_impact_component > 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--text-secondary)]'}
                    info="Average bowling performance score across last N innings"
                  />
                  <StatCard
                    label="Total Innings"
                    value={playerData.total_innings ?? 0}
                    sub={`Showing last ${playerData.last_n_count ?? 0}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Last N Stats */}
          <div
            className="rounded-[var(--radius-lg)] p-6"
            style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(58,110,165,0.15)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-[var(--text-primary)]" style={{ fontSize: 'var(--text-h3)' }}>
                Stats for Last {lastN} {lastN === 1 ? 'Game' : 'Games'}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-small)] text-[var(--text-secondary)]">Last N:</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={lastN}
                  onChange={(e) => setLastN(Number(e.target.value))}
                  className="w-28 accent-[var(--accent-strong)]"
                  id="last-n-slider"
                  aria-label="Number of last games"
                />
                <span className="text-sm font-mono font-bold w-6 text-center text-[var(--accent-strong)] tabular-nums">
                  {lastN}
                </span>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard label="Innings" value={stats.innings} />
                <StatCard label="Runs" value={stats.runs} colorClass="text-[var(--accent)]" info="Total runs in last N" />
                <StatCard label="Strike Rate" value={stats.strike_rate} colorClass="text-[var(--accent-strong)]" />
                <StatCard label="Bat Average" value={stats.batting_average} colorClass="text-[var(--surface)]" />
                <StatCard label="Wickets" value={stats.wickets} colorClass="text-[var(--surface)]" />
                <StatCard label="Economy" value={stats.economy} colorClass="text-[var(--accent)]" info="Runs per over" />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <StatCard label="Avg Context Weight" value={playerData.context_weight_avg ? `${playerData.context_weight_avg}×` : '—'} />
              <StatCard label="Avg Pressure Index" value={playerData.pressure_index_avg ? `${playerData.pressure_index_avg}×` : '—'} />
              <StatCard label="Weighted Impact" value={playerData.impact_weighted} />
              <StatCard label="Bowling SR" value={stats?.bowling_strike_rate ?? '—'} />
            </div>
          </div>

          {/* Trend chart */}
          <div>
            {trend3Layer.length > 0 ? (
              <ImpactTrendChart data={trend3Layer} height={380} use3Layer />
            ) : (
              <ImpactTrendChart data={trendData} height={380} />
            )}
          </div>

          {/* Innings table */}
          {playerData.last_n_innings && playerData.last_n_innings.length > 0 && (
            <InningsTable innings={playerData.last_n_innings} highPressureThreshold={1.5} />
          )}

          {/* Career */}
          {career && (
            <div
              className="rounded-[var(--radius-lg)] p-6"
              style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
            >
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: 'var(--text-h3)' }}>
                Career Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard label="Matches" value={career.total_matches ?? 0} />
                <StatCard label="Total Runs" value={career.total_runs ?? 0} colorClass="text-[var(--accent)]" />
                <StatCard label="Balls Faced" value={career.total_balls_faced ?? 0} />
                <StatCard label="Wickets" value={career.total_wickets ?? 0} colorClass="text-[var(--surface)]" />
                <StatCard label="Avg Bat Impact" value={career.avg_batting_impact?.toFixed(3) ?? '0'} colorClass={career.avg_batting_impact > 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'} />
                <StatCard label="Avg Bowl Impact" value={career.avg_bowling_impact?.toFixed(3) ?? '0'} colorClass={career.avg_bowling_impact > 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--text-secondary)]'} />
              </div>
            </div>
          )}
        </>
      )}

      <ExplainModal
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
        explain={playerData?.explain}
        lastNInnings={playerData?.last_n_innings || []}
      />
    </div>
  );
}
