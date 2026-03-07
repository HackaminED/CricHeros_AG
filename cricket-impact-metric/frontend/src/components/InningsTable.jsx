import React from 'react';

export default function InningsTable({ innings = [], highPressureThreshold = 1.5 }) {
  if (!innings || innings.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-lg)] p-6 text-center text-[var(--text-secondary)]"
        style={{ background: 'var(--surface-muted)' }}
      >
        No innings data
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid rgba(58,110,165,0.2)',
      }}
    >
      <div className="px-6 py-4 border-b border-[var(--muted)]/40">
        <h3 className="font-display font-semibold text-[var(--text-primary)]" style={{ fontSize: 'var(--text-h3)' }}>
          Innings Breakdown (Last {innings.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid" aria-label="Innings breakdown">
          <thead>
            <tr className="text-[var(--text-small)] text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--muted)]/50">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-center tabular-nums">Runs</th>
              <th className="px-3 py-3 text-center tabular-nums">Balls</th>
              <th className="px-3 py-3 text-center tabular-nums">Wkts</th>
              <th className="px-3 py-3 text-center">Bat Perf</th>
              <th className="px-3 py-3 text-center">Bowl Perf</th>
              <th className="px-3 py-3 text-center">Context</th>
              <th className="px-3 py-3 text-center">Pressure</th>
              <th className="px-3 py-3 text-center">Raw</th>
              <th className="px-3 py-3 text-center">IM</th>
            </tr>
          </thead>
          <tbody>
            {innings.map((inn, idx) => {
              const isHighPressure = (inn.pressure_index || 0) >= highPressureThreshold;
              return (
                <tr
                  key={idx}
                  className="border-t border-[var(--muted)]/40 hover:bg-[var(--surface-muted)] transition-colors"
                  style={{
                    borderLeft: isHighPressure ? '6px solid var(--accent)' : undefined,
                  }}
                >
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] text-xs">
                    {inn.date || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-[var(--accent)]">{inn.runs}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-[var(--text-primary)]">{inn.balls_faced}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-[var(--surface)]">{inn.wickets}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-[var(--text-primary)]">{inn.batting_performance}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-[var(--text-primary)]">{inn.bowling_performance}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-[var(--accent)]">{inn.context_weight}×</td>
                  <td className="px-3 py-2.5 text-center font-mono text-[var(--accent-strong)]">{inn.pressure_index}×</td>
                  <td className="px-3 py-2.5 text-center font-mono text-[var(--text-primary)]">{inn.raw_impact}</td>
                  <td className="px-3 py-2.5 text-center font-mono font-bold text-[var(--accent-strong)]">
                    {inn.impact_normalized_innings?.toFixed(1) ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
