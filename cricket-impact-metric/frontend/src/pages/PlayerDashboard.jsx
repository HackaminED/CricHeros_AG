import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImpactGauge from '../components/ImpactGauge';
import ImpactTrendChart from '../components/ImpactTrendChart';
import PlayerSearch from '../components/PlayerSearch';
import ExplainModal from '../components/ExplainModal';
import StatInfoModal from '../components/StatInfoModal';
import InningsTable from '../components/InningsTable';
import CategoryBadge from '../components/CategoryBadge';
import { getPlayerImpact, getPlayerTrend, getPlayerWpa } from '../api/api';
import { useGender } from '../context/GenderContext';

const SECTION_GAP = 40;

function StatCard({ label, value, sub, colorClass = 'text-[var(--accent-strong)]', info, onInfoClick, className = '' }) {
  return (
    <motion.div
      layout
      className={`rounded-2xl relative group dark-no-border card-hover ${className}`}
      style={{
        padding: '1.25rem 1.5rem',
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid var(--glass-border)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold tabular-nums ${colorClass}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-[var(--text-secondary)] mt-1.5">{sub}</p>}
      {info && (
        <button
          type="button"
          onClick={() => onInfoClick?.(label, info)}
          className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-secondary)] text-xs opacity-60 hover:opacity-100 hover:bg-[var(--surface-muted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label={`Info about ${label}`}
        >
          ℹ
        </button>
      )}
    </motion.div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

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
  const [statInfo, setStatInfo] = useState(null);
  const gaugeAnchorRef = useRef(null);
  const { gender, toggleGender } = useGender();

  const handleStatInfoClick = (title, content) => {
    setStatInfo({ title, content });
  };

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
    <div className="animate-page-enter">
      <motion.header
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="font-display font-bold text-[var(--text-primary)] text-3xl md:text-4xl tracking-tight">
            Player Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1.5 text-base">Search and analyze player impact metrics</p>
        </div>
        <PlayerSearch onSelect={handleSelect} />
      </motion.header>

      {loading && (
        <div className="flex justify-center py-24" role="status" aria-live="polite">
          <div
            className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          <span className="sr-only">Loading player</span>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-8 text-center border-2 dark-no-border"
          style={{ borderColor: 'var(--accent)', background: 'var(--surface-muted)' }}
        >
          <p className="text-[var(--text-primary)] font-medium">{error}</p>
        </motion.div>
      )}

      {!playerName && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-16 text-center dark-no-border card-hover"
          style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-strong)', border: '1px solid var(--glass-border)' }}
        >
          <div className="text-7xl mb-6" aria-hidden>🏏</div>
          <h2 className="font-display font-bold text-[var(--text-primary)] text-2xl mb-3">
            Search for a Player
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Use the search bar above to find a player and view their impact analysis
          </p>
        </motion.div>
      )}

      {playerData && !loading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Hero: Player + Gauge */}
          <motion.section
            variants={item}
            className="rounded-2xl relative overflow-hidden dark-no-border"
            style={{
              padding: '2rem 2.5rem',
              background: 'var(--surface-card)',
              boxShadow: 'var(--shadow-strong)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{ background: 'var(--accent-glow)', filter: 'blur(60px)' }} />
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div ref={gaugeAnchorRef} className="shrink-0">
                <ImpactGauge
                  score={playerData.impact_score || 0}
                  size={200}
                  onInfoClick={() => setShowExplain(true)}
                  showNeonRim={playerData.impact_score >= 80}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-display font-bold text-[var(--text-primary)] text-2xl md:text-3xl mb-1 flex items-center justify-center md:justify-start gap-2">
                  {playerData.player}
                  <span className="opacity-70 text-[var(--accent-strong)]" aria-hidden>
                    {gender === 'Women' ? '♀' : '♂'}
                  </span>
                </h2>
                <p className="text-[var(--text-secondary)] font-medium flex items-center justify-center md:justify-start gap-2">
                  {playerData.team}
                  <span
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                    style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
                  >
                    {gender}
                  </span>
                </p>
                {playerData.category && (
                  <span className="inline-block mt-3">
                    <CategoryBadge category={playerData.category} />
                  </span>
                )}
              </div>
            </div>
          </motion.section>

          {/* Last N */}
          <motion.div variants={item} className="flex items-center justify-end gap-3">
            <span className="text-sm text-[var(--text-secondary)] font-medium">Last N games</span>
            <input
              type="range"
              min={1}
              max={10}
              value={lastN}
              onChange={(e) => setLastN(Number(e.target.value))}
              className="w-32 h-2 rounded-full accent-[var(--accent)]"
              id="last-n-slider"
              aria-label="Number of last games"
            />
            <span className="text-sm font-display font-bold w-8 text-center text-[var(--accent-strong)] tabular-nums">{lastN}</span>
          </motion.div>

          {/* Performance — Bento grid */}
          <motion.section variants={item}>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-xl mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Runs" value={stats?.runs} colorClass="text-[var(--accent)]" />
              <StatCard label="Strike Rate" value={stats?.strike_rate} colorClass="text-[var(--accent-strong)]" />
              <StatCard label="Bat Average" value={stats?.batting_average} colorClass="text-[var(--text-primary)]" />
              <StatCard label="Innings" value={stats?.innings ?? playerData?.last_n_count} />
              <StatCard label="Wickets" value={stats?.wickets} colorClass="text-[var(--text-primary)]" />
              <StatCard label="Economy" value={stats?.economy} colorClass="text-[var(--accent)]" />
            </div>
          </motion.section>

          {/* Match Context */}
          <motion.section variants={item}>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-xl mb-4">Match Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                label="Average Context Weight"
                value={playerData.context_weight_avg != null ? `${playerData.context_weight_avg}×` : '—'}
                sub="1.0 = normal; >1.0 = tougher"
                info="How difficult the situations were when the player batted or bowled."
                onInfoClick={handleStatInfoClick}
              />
              <StatCard
                label="Average Pressure Index"
                value={playerData.pressure_index_avg != null ? `${playerData.pressure_index_avg}×` : '—'}
                sub="Higher = more critical moments"
                info="Measures match pressure during player events."
                onInfoClick={handleStatInfoClick}
              />
            </div>
          </motion.section>

          {/* Impact Metrics */}
          <motion.section variants={item}>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-xl mb-4">Impact Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {wpaData && (
                <div
                  className="rounded-2xl p-5 dark-no-border card-hover relative"
                  style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}
                >
                  <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                    Clutch{' '}
                    <button
                      type="button"
                      onClick={() => handleStatInfoClick('Clutch', 'Total win probability swing per match. Measures how much the player shifted their team\'s win probability in high-leverage moments.')}
                      className="w-5 h-5 rounded flex items-center justify-center text-xs opacity-60 hover:opacity-100 hover:bg-[var(--surface-muted)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      aria-label="Info about Clutch"
                    >
                      ℹ
                    </button>
                  </p>
                  <p className={`text-3xl font-display font-bold tabular-nums ${(wpaData.clutch_impact_percent || 0) >= 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'}`}>
                    {(wpaData.clutch_impact_percent >= 0 ? '+' : '')}{wpaData.clutch_impact_percent}%
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Avg swing per match</p>
                </div>
              )}
              <StatCard
                label="Weighted Impact"
                value={playerData.impact_weighted != null ? playerData.impact_weighted : '—'}
                sub="Context-weighted"
                info="Impact score adjusted for match context."
                onInfoClick={handleStatInfoClick}
              />
            </div>
          </motion.section>

          {/* Recent Match Trend */}
          <motion.section variants={item}>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-xl mb-4">Recent Match Trend</h3>
            <div
              className="rounded-2xl dark-no-border overflow-hidden"
              style={{ padding: '1.5rem', background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}
            >
              {trend3Layer.length > 0 ? (
                <ImpactTrendChart data={trend3Layer} height={380} use3Layer />
              ) : (
                <ImpactTrendChart data={trendData} height={380} />
              )}
            </div>
          </motion.section>

          {playerData.last_n_innings && playerData.last_n_innings.length > 0 && (
            <motion.div variants={item}>
              <InningsTable innings={playerData.last_n_innings} highPressureThreshold={1.5} />
            </motion.div>
          )}

          {career && (
            <motion.section variants={item}>
              <h3 className="font-display font-bold text-[var(--text-primary)] text-xl mb-4">Career Statistics</h3>
              <div
                className="rounded-2xl p-6 dark-no-border"
                style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--glass-border)' }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <StatCard label="Matches" value={career.total_matches ?? 0} />
                  <StatCard label="Total Runs" value={career.total_runs ?? 0} colorClass="text-[var(--accent)]" />
                  <StatCard label="Balls Faced" value={career.total_balls_faced ?? 0} />
                  <StatCard label="Wickets" value={career.total_wickets ?? 0} colorClass="text-[var(--text-primary)]" />
                  <StatCard label="Avg Bat Impact" value={career.avg_batting_impact?.toFixed(3) ?? '0'} colorClass={career.avg_batting_impact > 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--accent)]'} />
                  <StatCard label="Avg Bowl Impact" value={career.avg_bowling_impact?.toFixed(3) ?? '0'} colorClass={career.avg_bowling_impact > 0 ? 'text-[var(--accent-strong)]' : 'text-[var(--text-secondary)]'} />
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      )}

      <ExplainModal
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
        explain={playerData?.explain}
        lastNInnings={playerData?.last_n_innings || []}
        anchorRef={gaugeAnchorRef}
      />
      <StatInfoModal
        isOpen={!!statInfo}
        onClose={() => setStatInfo(null)}
        title={statInfo?.title ?? ''}
        content={statInfo?.content ?? ''}
      />
    </div>
  );
}
