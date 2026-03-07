import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGender } from '../context/GenderContext';
import CategoryBadge from './CategoryBadge';

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed" style={{ tableLayout: 'fixed' }} role="grid">
              <colgroup>
                <col style={{ width: '200px', minWidth: '200px' }} />
                <col style={{ width: '80px', minWidth: '80px' }} />
                <col style={{ width: '80px', minWidth: '80px' }} />
                <col style={{ width: '120px', minWidth: '120px' }} />
                <col style={{ width: '120px', minWidth: '120px' }} />
                <col style={{ width: '100px', minWidth: '100px' }} />
                <col style={{ width: '100px', minWidth: '100px' }} />
                <col style={{ width: '120px', minWidth: '120px' }} />
                <col style={{ width: '120px', minWidth: '120px' }} />
                <col style={{ width: '150px', minWidth: '150px' }} />
              </colgroup>
              <thead>
                <tr className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--muted)]/50">
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-2 py-3 text-center tabular-nums">Runs</th>
                  <th className="px-2 py-3 text-center tabular-nums">Wkts</th>
                  <th className="px-2 py-3 text-center">Bat Perf</th>
                  <th className="px-2 py-3 text-center">Bowl Perf</th>
                  <th className="px-2 py-3 text-center">Context</th>
                  <th className="px-2 py-3 text-center">Pressure</th>
                  <th className="px-2 py-3 text-center">Raw IM</th>
                  <th className="px-2 py-3 text-center">IM Score</th>
                  <th className="px-2 py-3 text-center">Category</th>
                </tr>
              </thead>
              <tbody>
                {[...(players || [])]
                  .sort((a, b) => (b.raw_impact || 0) - (a.raw_impact || 0))
                  .map((p) => (
                    <tr
                      key={p.player}
                      onClick={() => navigate(`/player?player=${encodeURIComponent(p.player)}`)}
                      className="border-t border-[var(--muted)]/40 cursor-pointer transition-colors hover:bg-[var(--surface-muted)] focus-within:bg-[var(--surface-muted)]"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/player?player=${encodeURIComponent(p.player)}`);
                        }
                      }}
                      aria-label={`${p.player}, IM ${p.impact_normalized?.toFixed(1)}`}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)] truncate" title={p.player}>
                        {p.player}{' '}
                        <span className="opacity-70 text-xs ml-1" aria-hidden>
                          {gender === 'Women' ? '♀' : '♂'}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center tabular-nums text-[var(--accent)]">{p.runs_scored}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-[var(--surface)]">{p.wickets_taken}</td>
                      <td className="px-2 py-3 text-center font-mono text-[var(--text-primary)]">{p.batting_performance}</td>
                      <td className="px-2 py-3 text-center font-mono text-[var(--text-primary)]">{p.bowling_performance}</td>
                      <td className="px-2 py-3 text-center font-mono text-[var(--accent)]">{p.context_weight}×</td>
                      <td className="px-2 py-3 text-center font-mono text-[var(--accent-strong)]">{p.pressure_index}×</td>
                      <td className="px-2 py-3 text-center font-mono text-[var(--text-primary)]">{p.raw_impact}</td>
                      <td className="px-2 py-3 text-center font-mono font-bold text-[var(--accent-strong)]">
                        {p.impact_normalized?.toFixed(1)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <CategoryBadge category={p.category} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
