import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGender } from '../context/GenderContext';
import CategoryBadge from './CategoryBadge';
import AnimatedList from './AnimatedList';

export default function MatchDetail({ matchId, matchData, loading, onBack }) {
  const navigate = useNavigate();
  const { gender } = useGender();

  if (loading) {
    return (
      <div className="flex justify-center py-24" role="status" aria-live="polite">
        <div
          className="w-12 h-12 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <span className="sr-only">Loading match</span>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div
        className="rounded-2xl p-12 text-center text-[var(--text-secondary)] dark-no-border"
        style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
      >
        Match not found
      </div>
    );
  }

  const teams = matchData.teams || {};

  return (
    <div className="animate-page-enter space-y-8">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{
              background: 'var(--surface-muted)',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--glass-border)',
            }}
          >
            ← Back
          </button>
        )}
        <div>
          <h1 className="font-display font-bold text-[var(--text-primary)] text-2xl md:text-3xl tracking-tight">
            Match {matchId}
          </h1>
          {matchData.date && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{matchData.date}</p>
          )}
        </div>
      </div>

      {Object.entries(teams).map(([teamName, players]) => (
        <section
          key={teamName}
          className="rounded-2xl overflow-hidden dark-no-border"
          style={{
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-strong)',
            border: '1px solid var(--glass-border)',
          }}
          aria-label={`Roster: ${teamName}`}
        >
          <div
            className="px-6 py-4 dark-no-border"
            style={{ background: 'var(--surface-muted)' }}
          >
            <h3 className="font-display font-bold text-[var(--accent-strong)] text-lg">
              {teamName}
            </h3>
          </div>
          <div className="flex items-center text-xs text-[var(--text-secondary)] uppercase tracking-wider pb-2 pt-3 px-6 gap-2">
            <div className="flex-1 font-bold min-w-[120px]">Player</div>
            <div className="w-12 text-center font-bold">Runs</div>
            <div className="w-12 text-center font-bold">Wkts</div>
            <div className="w-20 text-center font-bold hidden md:block">Bat Perf</div>
            <div className="w-20 text-center font-bold hidden md:block">Bowl Perf</div>
            <div className="w-20 text-center font-bold">Context</div>
            <div className="w-20 text-center font-bold">Pressure</div>
            <div className="w-16 text-center font-bold hidden sm:block">Raw IM</div>
            <div className="w-20 text-center font-bold text-[var(--accent-strong)]">IM Score</div>
            <div className="w-24 text-center font-bold hidden lg:block">Category</div>
          </div>

          <div className="w-full px-4 pb-4">
            <AnimatedList
              items={[...(players || [])].sort((a, b) => (b.raw_impact || 0) - (a.raw_impact || 0))}
              showGradients={false}
              displayScrollbar={false}
              enableArrowNavigation={true}
              listContainerClassName="space-y-2"
              onItemSelect={(p) => navigate(`/player?player=${encodeURIComponent(p.player)}`)}
              renderItem={(p, idx, isSelected) => (
                <div
                  className={`flex items-center px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-[var(--accent)] bg-[var(--surface-muted)]' : 'hover:bg-[var(--surface-muted)]'
                  }`}
                  style={{ border: '1px solid var(--glass-border)' }}
                  aria-label={`${p.player}, IM ${p.impact_normalized?.toFixed(1)}`}
                >
                  <div className="flex-1 font-semibold text-[var(--text-primary)] truncate min-w-[120px]">
                    {p.player}{' '}
                    <span className="opacity-60 text-xs" aria-hidden>
                      {gender === 'Women' ? '♀' : '♂'}
                    </span>
                  </div>
                  <div className="w-12 text-center tabular-nums font-bold text-[var(--accent)]">{p.runs_scored}</div>
                  <div className="w-12 text-center tabular-nums text-[var(--text-primary)]">{p.wickets_taken}</div>
                  <div className="w-20 text-center font-mono text-sm text-[var(--text-primary)] hidden md:block opacity-80">{p.batting_performance}</div>
                  <div className="w-20 text-center font-mono text-sm text-[var(--text-primary)] hidden md:block opacity-80">{p.bowling_performance}</div>
                  <div className="w-20 text-center font-mono text-[var(--accent)]">{p.context_weight}×</div>
                  <div className="w-20 text-center font-mono text-[var(--accent-strong)]">{p.pressure_index}×</div>
                  <div className="w-16 text-center font-mono text-[var(--text-primary)] hidden sm:block opacity-70">{p.raw_impact}</div>
                  <div className="w-20 text-center font-mono font-bold text-[var(--accent-strong)]">
                    {p.impact_normalized?.toFixed(1)}
                  </div>
                  <div className="w-24 text-center hidden lg:block">
                    <CategoryBadge category={p.category} />
                  </div>
                </div>
              )}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
