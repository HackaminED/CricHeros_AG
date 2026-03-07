import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImpactGauge from '../components/ImpactGauge';
import ImpactTrendChart from '../components/ImpactTrendChart';
import PlayerSearch from '../components/PlayerSearch';
import ExplainModal from '../components/ExplainModal';
import InningsTable from '../components/InningsTable';
import CategoryBadge from '../components/CategoryBadge';
import { getPlayerImpact, getPlayerTrend, getPlayerWpa } from '../api/api';
import { useGender } from '../context/GenderContext';

const CARD_PADDING = '20px';
const SECTION_GAP = 32;

function StatCard({ label, value, sub, colorClass = 'text-[var(--accent-strong)]', info }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] relative group dark-no-border"
      style={{ padding: CARD_PADDING, background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
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
  const [wpaData, setWpaData] = useState(null);
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
      const [impact, trend, wpa] = await Promise.all([
        getPlayerImpact(name, lastN, currentGender),
        getPlayerTrend(name, 10, lastN, currentGender),
        getPlayerWpa(name, lastN, currentGender).catch(() => null),
      ]);

      if (impact.gender && impact.gender !== currentGender) {
        toggleGender(impact.gender);
        return;
      }

      setPlayerData(impact);
      setTrendData(trend.trend || []);
      setTrend3Layer(trend.trend_3layer || impact.last_n_innings || []);
      setWpaData(wpa || null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load player data');
      setPlayerData(null);
      setTrendData([]);
      setTrend3Layer([]);
      setWpaData(null);
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
          {/* 1. Player Info + Impact Score */}
          <div
            className="rounded-[var(--radius-lg)] relative overflow-hidden dark-no-border"
            style={{ padding: CARD_PADDING, background: 'var(--surface-card)', boxShadow: 'var(--shadow-strong)', marginBottom: SECTION_GAP }}
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
              </div>
            </div>
          </div>

          {/* Last N slider - shared for all sections */}
          <div className="flex items-center justify-end gap-3" style={{ marginBottom: SECTION_GAP }}>
            <span className="text-[var(--text-small)] text-[var(--text-secondary)]">Last N games:</span>
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
            <span className="text-sm font-mono font-bold w-6 text-center text-[var(--accent-strong)] tabular-nums">{lastN}</span>
          </div>

          {/* 2. Performance Metrics */}
          <section style={{ marginBottom: SECTION_GAP }}>
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: 'var(--text-h3)' }}>
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Runs" value={stats?.runs} colorClass="text-[var(--accent)]" />
              <StatCard label="Strike Rate" value={stats?.strike_rate} colorClass="text-[var(--accent-strong)]" />
              <StatCard label="Bat Average" value={stats?.batting_average} colorClass="text-[var(--text-primary)]" />
              <StatCard label="Innings" value={stats?.innings ?? playerData?.last_n_count} />
              <StatCard label="Wickets" value={stats?.wickets} colorClass="text-[var(--text-primary)]" />
              <StatCard label="Economy" value={stats?.economy} colorClass="text-[var(--accent)]" />
            </div>
          </section>

          {/* 3. Match Context */}
          <section style={{ marginBottom: SECTION_GAP }}>
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: 'var(--text-h3)' }}>
              Match Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                label="Average Context Weight"
                value={playerData.context_weight_avg != null ? `${playerData.context_weight_avg}×` : '—'}
                sub="1.0 = normal situations; >1.0 = tougher match conditions"
                info="How difficult the situations were when the player batted or bowled. 1.0 = normal situations, >1.0 = tougher match conditions."
              />
              <StatCard
                label="Average Pressure Index"
                value={playerData.pressure_index_avg != null ? `${playerData.pressure_index_avg}×` : '—'}
                sub="Higher values = more critical moments"
                info="Measures match pressure during player events. Higher values indicate more critical moments."
              />
            </div>
          </section>

          {/* 4. Impact Metrics (Clutch, Weighted Impact) */}
          <section style={{ marginBottom: SECTION_GAP }}>
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: 'var(--text-h3)' }}>
              Impact Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {wpaData && (
                <div
                  className="rounded-[var(--radius-lg)] relative group dark-no-border"
                  style={{ padding: CARD_PADDING, background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
                >
                  <p className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                    Clutch <span className="cursor-help text-[var(--text-secondary)]" title="Clutch: total win probability swing (percent points) the player added per match.">ℹ</span>
                  </p>
                  <p className={`text-3xl font-display font-bold tabular-nums ${(wpaData.clutch_impact_percent || 0) >= 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'}`}>
                    {(wpaData.clutch_impact_percent >= 0 ? '+' : '')}{wpaData.clutch_impact_percent}%
                  </p>
                  <p className="text-[var(--text-small)] text-[var(--text-secondary)] mt-1">Avg swing per match</p>
                </div>
              )}
              <StatCard
                label="Weighted Impact"
                value={playerData.impact_weighted != null ? playerData.impact_weighted : '—'}
                sub="Context-weighted impact"
                info="Impact score adjusted for match context (difficulty of situations)."
              />
            </div>
          </section>

          {/* 5. Recent Match Trend */}
          <section style={{ marginBottom: SECTION_GAP }}>
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: 'var(--text-h3)' }}>
              Recent Match Trend
            </h3>
            <div className="rounded-[var(--radius-lg)] dark-no-border" style={{ padding: CARD_PADDING, background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}>
              {trend3Layer.length > 0 ? (
                <ImpactTrendChart data={trend3Layer} height={380} use3Layer />
              ) : (
                <ImpactTrendChart data={trendData} height={380} />
              )}
            </div>
          </section>

          {/* Innings table */}
          {playerData.last_n_innings && playerData.last_n_innings.length > 0 && (
            <InningsTable innings={playerData.last_n_innings} highPressureThreshold={1.5} />
          )}

          {/* Career */}
          {career && (
            <div
              className="rounded-[var(--radius-lg)] dark-no-border"
              style={{ padding: CARD_PADDING, background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
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
