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
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <div
          className="w-10 h-10 border-2 border-[var(--accent-strong)] border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
        <span className="sr-only">Loading match</span>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div
        className="rounded-[var(--radius-lg)] p-8 text-center text-[var(--text-secondary)]"
        style={{ background: 'var(--surface-muted)' }}
      >
        Match not found
      </div>
    );
  }

  const teams = matchData.teams || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,78,152,0.5)]"
            style={{
              background: 'var(--surface-muted)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            ← Back
          </button>
        )}
        <div>
          <h1 className="font-display font-bold text-[var(--text-primary)]" style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--text-h2-lh)' }}>
            Match {matchId}
          </h1>
          {matchData.date && (
            <p className="text-[var(--text-small)] text-[var(--text-secondary)]">{matchData.date}</p>
          )}
        </div>
      </div>

      {Object.entries(teams).map(([teamName, players]) => (
        <section
          key={teamName}
          className="rounded-[var(--radius-lg)] overflow-hidden dark-no-border"
          style={{
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-soft)',
          }}
          aria-label={`Roster: ${teamName}`}
        >
          <div
            className="px-6 py-4 panel-header dark-no-border"
            style={{ background: 'var(--surface-muted)' }}
          >
            <h3
              className="font-display font-semibold"
              style={{ color: 'var(--accent-strong)', fontSize: 'var(--text-h3)' }}
            >
              {teamName}
            </h3>
          </div>
          <div className="flex items-center text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--muted)]/50 pb-2 pt-3 px-6 bg-[var(--surface-muted)] shrink-0 z-10 shadow-sm">
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
          
          <div className="w-full">
            <AnimatedList
              items={[...(players || [])].sort((a, b) => (b.raw_impact || 0) - (a.raw_impact || 0))}
              showGradients={false}
              displayScrollbar={false}
              enableArrowNavigation={true}
              listContainerClassName="px-4 py-2"
              onItemSelect={(p) => navigate(`/player?player=${encodeURIComponent(p.player)}`)}
              renderItem={(p, idx, isSelected) => (
                <div
                  className={`flex items-center px-2 py-3 mb-2 rounded-lg border border-[var(--muted)]/20 cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[var(--accent)] bg-[var(--surface-muted)] scale-[1.01]' : 'bg-[var(--surface-card)] hover:bg-[var(--surface-muted)]'
                  }`}
                  aria-label={`${p.player}, IM ${p.impact_normalized?.toFixed(1)}`}
                >
                  <div className="flex-1 font-medium text-[var(--text-primary)] truncate min-w-[120px]" title={p.player}>
                    {p.player}{' '}
                    <span className="opacity-70 text-xs ml-1" aria-hidden>
                      {gender === 'Women' ? '♀' : '♂'}
                    </span>
                  </div>
                  <div className="w-12 text-center tabular-nums font-bold text-[var(--accent)]">{p.runs_scored}</div>
                  <div className="w-12 text-center tabular-nums text-[var(--surface)]">{p.wickets_taken}</div>
                  <div className="w-20 text-center font-mono text-[var(--text-primary)] hidden md:block opacity-80">{p.batting_performance}</div>
                  <div className="w-20 text-center font-mono text-[var(--text-primary)] hidden md:block opacity-80">{p.bowling_performance}</div>
                  <div className="w-20 text-center font-mono text-[var(--accent)]">{p.context_weight}×</div>
                  <div className="w-20 text-center font-mono text-[var(--accent-strong)]">{p.pressure_index}×</div>
                  <div className="w-16 text-center font-mono text-[var(--text-primary)] hidden sm:block opacity-70">{p.raw_impact}</div>
                  <div className="w-20 text-center font-mono font-bold text-[var(--accent-strong)] drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
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
