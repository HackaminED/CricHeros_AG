import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function WpaTimelineChart({ timeline = [], perPlayer = [], height = 280 }) {
  const data = (timeline || []).map((e) => ({
    ball_index: e.ball_index,
    wp: (e.wp_after ?? 0) * 100,
    wp_before: (e.wp_before ?? 0) * 100,
    swing: (e.swing ?? 0) * 100,
    player: e.player,
    event: e.event,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div
        className="rounded-[var(--radius-md)] p-3 text-sm border border-[var(--muted)]/50"
        style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
      >
        <p className="text-[var(--text-secondary)] text-xs">Ball #{d.ball_index}</p>
        <p className="font-semibold text-[var(--text-primary)]">{d.player}</p>
        <p className="text-[var(--accent-strong)]">WP: {d.wp_before?.toFixed(1)}% → {d.wp?.toFixed(1)}%</p>
        <p className="text-[var(--accent)]">Swing: {(d.swing >= 0 ? '+' : '') + d.swing?.toFixed(2)}%</p>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-lg)] p-6 flex items-center justify-center text-[var(--text-secondary)]"
        style={{ height, background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
      >
        No WPA timeline data for this match
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4"
      style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)', height }}
    >
      <h3 className="font-display font-semibold text-[var(--text-primary)] mb-2" style={{ fontSize: 'var(--text-h3)' }}>
        Match Swing (Win Probability)
      </h3>
      <ResponsiveContainer width="100%" height={height - 60}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id="wpaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-strong)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--accent-strong)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="ball_index" stroke="var(--text-secondary)" fontSize={10} />
          <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={10} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="var(--muted)" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="wp" stroke="var(--accent-strong)" strokeWidth={2} fill="url(#wpaGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      {perPlayer?.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mt-2 pb-1 scrollbar-thin" style={{ minHeight: '36px' }}>
          {perPlayer.map((p) => (
            <span
              key={p.player}
              className="shrink-0 text-[var(--text-small)] rounded-[999px] font-medium"
              style={{ padding: '6px 12px', background: 'rgba(58, 110, 165, 0.2)' }}
              title={`Swing: ${(p.swing_percent >= 0 ? '+' : '')}${p.swing_percent}%`}
            >
              {p.player} {(p.swing_percent >= 0 ? '+' : '')}{p.swing_percent}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
