import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="rounded-[var(--radius-md)] p-3 text-sm border border-[var(--muted)]/50"
        style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-soft)' }}
      >
        <p className="text-[var(--text-secondary)] text-xs mb-1">
          {data.date || `Innings ${label}`}
        </p>
        <p className="font-semibold text-[var(--accent-strong)]">
          IM: {data.impact_normalized_innings?.toFixed(1) ?? payload[0].value?.toFixed(1) ?? 'N/A'}
        </p>
        {data.runs !== undefined && (
          <div className="text-xs text-[var(--text-secondary)] mt-1 space-y-0.5">
            <p>Runs: {data.runs} ({data.balls_faced}b) | Wkts: {data.wickets}</p>
            <p>Perf: {data.performance_score} × Ctx: {data.context_weight} × Pres: {data.pressure_index}</p>
          </div>
        )}
        {data.runs_scored !== undefined && !data.runs && (
          <p className="text-[var(--text-secondary)] text-xs mt-1">
            Runs: {data.runs_scored} | Wickets: {data.wickets_taken}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function ImpactTrendChart({ data = [], height = 300, use3Layer = false }) {
  const chartData = data.map((d, i) => ({
    ...d,
    index: i + 1,
    impact: use3Layer
      ? (d.impact_normalized_innings ?? d.raw_impact ?? 0)
      : (d.match_impact ?? d.impact ?? 0),
  }));

  const avgImpact = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.impact, 0) / chartData.length
    : 0;

  const yDomain = use3Layer ? [0, 100] : undefined;

  return (
    <div
      className="w-full rounded-[var(--radius-lg)] p-6 flex flex-col dark-no-border"
      style={{
        height,
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid rgba(58,110,165,0.2)',
      }}
    >
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
          No trend data available
        </div>
      ) : (
        <div className="flex-1 w-full h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <defs>
                <linearGradient id="impactGradientNeo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A6EA5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3A6EA5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.5} />
              <XAxis
                dataKey="index"
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Innings', position: 'insideBottom', offset: -5, fill: 'var(--text-secondary)', fontSize: 11 }}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={11}
                tickLine={false}
                domain={yDomain}
                label={{
                  value: use3Layer ? 'Impact (0-100)' : 'Impact',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'var(--text-secondary)',
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              {use3Layer && (
                <ReferenceLine
                  y={50}
                  stroke="var(--muted)"
                  strokeDasharray="3 3"
                  label={{ value: 'Neutral', fill: 'var(--text-secondary)', fontSize: 10 }}
                />
              )}
              {!use3Layer && (
                <ReferenceLine
                  y={0}
                  stroke="var(--muted)"
                  strokeDasharray="3 3"
                  label={{ value: 'Zero', fill: 'var(--text-secondary)', fontSize: 10 }}
                />
              )}
              <ReferenceLine
                y={avgImpact}
                stroke="var(--accent-strong)"
                strokeDasharray="5 5"
                label={{ value: 'Avg', fill: 'var(--accent-strong)', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="impact"
                stroke="var(--accent-strong)"
                strokeWidth={3}
                fill="url(#impactGradientNeo)"
                dot={{ fill: 'var(--surface)', strokeWidth: 1, r: 4, stroke: 'var(--accent-strong)' }}
                activeDot={{ fill: 'var(--accent)', strokeWidth: 0, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
