import React from 'react';
import AnimatedList from './AnimatedList';

export default function InningsTable({ innings = [], highPressureThreshold = 1.5 }) {
  if (!innings || innings.length === 0) {
    return (
      <div
        className="rounded-lg p-6 text-center text-(--text-secondary)"
        style={{ background: 'var(--surface-muted)' }}
      >
        No innings data
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden dark-no-border h-[400px] flex flex-col"
      style={{
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid rgba(58,110,165,0.2)',
      }}
    >
      <div className="px-6 py-4 panel-header border-b border-[var(--muted)]/40 shrink-0 shadow-sm z-20">
        <h3 className="font-display font-semibold text-[var(--text-primary)]" style={{ fontSize: 'var(--text-h3)' }}>
          Innings Breakdown (Last {innings.length})
        </h3>
      </div>
      
      {/* Header Row */}
      <div className="flex items-center text-(--text-small) text-(--text-secondary) uppercase tracking-wider border-b border-[var(--muted)]/50 pb-2 pt-3 px-6 bg-[var(--surface-muted)] shrink-0 z-10 shadow-sm">
        <div className="flex-1 text-left font-bold min-w-[80px]">Date</div>
        <div className="w-12 text-center font-bold">Runs</div>
        <div className="w-12 text-center font-bold">Balls</div>
        <div className="w-12 text-center font-bold">Wkts</div>
        <div className="w-20 text-center font-bold hidden md:block">Bat Perf</div>
        <div className="w-20 text-center font-bold hidden md:block">Bowl Perf</div>
        <div className="w-20 text-center font-bold">Context</div>
        <div className="w-20 text-center font-bold">Pressure</div>
        <div className="w-16 text-center font-bold hidden sm:block">Raw</div>
        <div className="w-20 text-center font-bold">IM Score</div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <AnimatedList
          items={innings}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          listContainerClassName="px-4 py-2"
          renderItem={(inn, idx, isSelected) => {
            const isHighPressure = (inn.pressure_index || 0) >= highPressureThreshold;
            return (
              <div
                className={`flex items-center px-2 py-3 mb-2 rounded-lg border border-[var(--muted)]/20 transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-[var(--accent)] bg-[var(--surface-muted)] scale-[1.01]' : 'bg-[var(--surface-card)] hover:bg-[var(--surface-muted)]'
                }`}
                style={{
                  borderLeft: isHighPressure ? '4px solid var(--accent)' : '4px solid transparent',
                }}
              >
                <div className="flex-1 text-(--text-secondary) text-xs min-w-[80px]">
                  {inn.date || '—'}
                </div>
                <div className="w-12 text-center tabular-nums font-bold text-[var(--accent)]">{inn.runs}</div>
                <div className="w-12 text-center tabular-nums text-[var(--text-primary)]">{inn.balls_faced}</div>
                <div className="w-12 text-center tabular-nums text-[var(--surface)]">{inn.wickets}</div>
                <div className="w-20 text-center font-mono text-[var(--text-primary)] hidden md:block opacity-80">{inn.batting_performance}</div>
                <div className="w-20 text-center font-mono text-[var(--text-primary)] hidden md:block opacity-80">{inn.bowling_performance}</div>
                <div className="w-20 text-center font-mono text-[var(--accent)]">{inn.context_weight}×</div>
                <div className="w-20 text-center font-mono text-[var(--accent-strong)]">{inn.pressure_index}×</div>
                <div className="w-16 text-center font-mono text-[var(--text-primary)] hidden sm:block opacity-70">{inn.raw_impact}</div>
                <div className="w-20 text-center font-mono font-bold text-[var(--accent-strong)] drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  {inn.impact_normalized_innings?.toFixed(1) ?? '—'}
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
