import React, { useEffect } from 'react';

export default function ExplainModal({ isOpen, onClose, explain, lastNInnings = [] }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explain-modal-title"
    >
      <div className="absolute inset-0 bg-[var(--text-primary)]/40" aria-hidden />
      <div
        className="relative rounded-[var(--radius-lg)] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-strong animate-fade-in focus:outline-none dark-no-border border border-[var(--muted)]/50"
        style={{ background: 'var(--bg)' }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 panel-header border-b border-[var(--muted)]/40"
          style={{ background: 'var(--surface)', color: 'white' }}
        >
          <h2 id="explain-modal-title" className="font-display font-bold text-lg">
            How Impact Score is Calculated
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-white hover:bg-white/20 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Formula */}
          <div
            className="rounded-[var(--radius-md)] p-4"
            style={{ background: 'var(--surface-muted)', border: '1px solid rgba(58,110,165,0.2)' }}
          >
            <p className="font-mono font-semibold text-[var(--accent-strong)] text-sm mb-2">
              Impact = Performance × Context × Pressure
            </p>
            {explain?.summary && (
              <p className="text-[var(--text-small)] text-[var(--text-secondary)]">{explain.summary}</p>
            )}
          </div>

          {/* Plain English */}
          {explain?.plain_english && explain.plain_english.length > 0 && (
            <div className="space-y-3">
              {explain.plain_english.map((text, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span
                    className="w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--text-primary)]">{text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Formulas Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {explain?.batting_formula && (
              <div
                className="rounded-[var(--radius-md)] p-4"
                style={{ background: 'var(--surface-muted)' }}
              >
                <h4 className="text-xs uppercase tracking-wider text-[var(--accent-strong)] mb-2 font-semibold">
                  Batting Formula
                </h4>
                <p className="text-xs font-mono text-[var(--text-secondary)]">{explain.batting_formula}</p>
              </div>
            )}
            {explain?.bowling_formula && (
              <div
                className="rounded-[var(--radius-md)] p-4"
                style={{ background: 'var(--surface-muted)' }}
              >
                <h4 className="text-xs uppercase tracking-wider text-[var(--surface)] mb-2 font-semibold">
                  Bowling Formula
                </h4>
                <p className="text-xs font-mono text-[var(--text-secondary)]">{explain.bowling_formula}</p>
              </div>
            )}
          </div>

          {/* Context Phases */}
          {explain?.context_phases && Object.keys(explain.context_phases).length > 0 && (
            <div
              className="rounded-[var(--radius-md)] p-4"
              style={{ background: 'var(--surface-muted)' }}
            >
              <h4 className="text-xs uppercase tracking-wider text-[var(--accent)] mb-3 font-semibold">
                Context Multipliers
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(explain.context_phases).map(([phase, mult]) => (
                  <div
                    key={phase}
                    className="rounded-[var(--radius-sm)] p-2 text-center min-w-[4rem]"
                    style={{ background: 'var(--surface-card)' }}
                  >
                    <p className="font-mono font-bold text-[var(--accent-strong)]">{mult}×</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 capitalize">{phase}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {explain?.categories && Object.keys(explain.categories).length > 0 && (
            <div
              className="rounded-[var(--radius-md)] p-4"
              style={{ background: 'var(--surface-muted)' }}
            >
              <h4 className="text-xs uppercase tracking-wider text-[var(--text-primary)] mb-3 font-semibold">
                Score Categories
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(explain.categories).map(([range, label]) => (
                  <div key={range} className="text-center">
                    <p className="text-xs font-mono text-[var(--text-primary)]">{range}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last N Innings table */}
          {lastNInnings.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3 font-semibold">
                Last {lastNInnings.length} Innings Breakdown
              </h4>
              <div className="overflow-x-auto rounded-[var(--radius-md)]" style={{ background: 'var(--surface-muted)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[var(--text-secondary)] border-b border-[var(--muted)]/40">
                      <th className="px-2 py-2 text-left">Date</th>
                      <th className="px-2 py-2 text-center">Runs</th>
                      <th className="px-2 py-2 text-center">Wkts</th>
                      <th className="px-2 py-2 text-center">Perf</th>
                      <th className="px-2 py-2 text-center">Ctx</th>
                      <th className="px-2 py-2 text-center">Pres</th>
                      <th className="px-2 py-2 text-center">Raw</th>
                      <th className="px-2 py-2 text-center">IM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastNInnings.map((inn, idx) => (
                      <tr key={idx} className="border-t border-[var(--muted)]/30">
                        <td className="px-2 py-1.5 text-[var(--text-secondary)]">{inn.date || '—'}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums text-[var(--accent)]">{inn.runs}</td>
                        <td className="px-2 py-1.5 text-center tabular-nums text-[var(--surface)]">{inn.wickets}</td>
                        <td className="px-2 py-1.5 text-center font-mono">{inn.performance_score}</td>
                        <td className="px-2 py-1.5 text-center font-mono">{inn.context_weight}</td>
                        <td className="px-2 py-1.5 text-center font-mono">{inn.pressure_index}</td>
                        <td className="px-2 py-1.5 text-center font-mono">{inn.raw_impact}</td>
                        <td className="px-2 py-1.5 text-center font-mono font-bold text-[var(--accent-strong)]">
                          {inn.impact_normalized_innings?.toFixed(1) ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Example */}
          <div
            className="rounded-[var(--radius-md)] p-4 border border-[var(--muted)]/40"
            style={{ background: 'var(--surface-muted)' }}
          >
            <h4 className="text-xs uppercase tracking-wider text-[var(--accent)] mb-2 font-semibold">Example</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Scored 40 chasing 12 RPO with 5 wickets down → high performance × death overs context (1.4×) ×
              extreme pressure (2.0×) = significantly higher impact than 100 runs in a dead rubber.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
