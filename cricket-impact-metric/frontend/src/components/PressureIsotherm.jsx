import React, { useState, useMemo } from 'react';

const BIN_COLORS = [
  'rgba(0,78,152,0.15)',
  'rgba(0,78,152,0.35)',
  'rgba(0,78,152,0.55)',
  'rgba(0,78,152,0.75)',
  'rgba(0,78,152,0.95)',
];

export default function PressureIsotherm({ data }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { grid, bins, xLabels, yLabels } = useMemo(() => {
    if (!data || data.length === 0) {
      return { grid: [], bins: [], xLabels: [], yLabels: [] };
    }
    const rrrValues = [...new Set(data.map((d) => d.rrr))].sort((a, b) => a - b);
    const wktValues = [...new Set(data.map((d) => d.wickets))].sort((a, b) => a - b);
    const impactByKey = {};
    data.forEach((d) => {
      const key = `${d.rrr}-${d.wickets}`;
      if (!impactByKey[key]) impactByKey[key] = [];
      impactByKey[key].push(d);
    });
    const allImpacts = data.map((d) => d.impact).filter((x) => typeof x === 'number');
    const minImpact = Math.min(...allImpacts, 0);
    const maxImpact = Math.max(...allImpacts, 1);
    const step = (maxImpact - minImpact) / 5 || 1;
    const bins = Array.from({ length: 5 }, (_, i) => ({
      min: minImpact + i * step,
      max: minImpact + (i + 1) * step,
      color: BIN_COLORS[i],
    }));

    const grid = rrrValues.map((rrr) =>
      wktValues.map((wkt) => {
        const key = `${rrr}-${wkt}`;
        const items = impactByKey[key] || [];
        const avgImpact = items.length ? items.reduce((s, x) => s + x.impact, 0) / items.length : null;
        let binIndex = 0;
        if (avgImpact != null && maxImpact > minImpact) {
          binIndex = Math.min(4, Math.floor(((avgImpact - minImpact) / (maxImpact - minImpact)) * 5));
        }
        return {
          rrr,
          wkt,
          items,
          avgImpact,
          binIndex,
        };
      })
    );

    return {
      grid,
      bins,
      xLabels: rrrValues,
      yLabels: wktValues,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full rounded-[var(--radius-lg)] flex items-center justify-center text-sm text-[var(--text-secondary)] italic min-h-[200px]"
        style={{ background: 'var(--surface-muted)' }}
      >
        Insufficient data to map pressure isotherms.
      </div>
    );
  }

  const cellSize = 32;
  const padding = 24;

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4 md:p-6 relative dark-no-border"
      style={{
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-soft)',
        border: '1px solid rgba(58,110,165,0.2)',
      }}
    >
      <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4" style={{ fontSize: 'var(--text-h3)' }}>
        Pressure Isotherm
      </h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="overflow-x-auto">
          <svg
            width={Math.max(200, padding + (grid[0]?.length || 0) * cellSize + padding)}
            height={Math.max(200, padding + grid.length * cellSize + padding + 20)}
            aria-describedby="isotherm-legend"
          >
            {grid.map((row, i) =>
              row.map((cell, j) => (
                <g key={`${i}-${j}`}>
                  <rect
                    x={padding + j * cellSize + 2}
                    y={padding + i * cellSize + 2}
                    width={cellSize - 4}
                    height={cellSize - 4}
                    rx="6"
                    ry="6"
                    fill={BIN_COLORS[cell.binIndex]}
                    stroke={hoveredCell?.i === i && hoveredCell?.j === j ? 'var(--accent)' : 'rgba(0,78,152,0.3)'}
                    strokeWidth={hoveredCell?.i === i && hoveredCell?.j === j ? 3 : 1}
                    onMouseEnter={() => setHoveredCell({ i, j, cell })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onFocus={() => setHoveredCell({ i, j, cell })}
                    onBlur={() => setHoveredCell(null)}
                    tabIndex={0}
                    role="img"
                    aria-label={`RRR ${cell.rrr}, Wickets ${cell.wkt}, ${cell.items.length} innings, avg impact ${cell.avgImpact?.toFixed(1) ?? 'N/A'}`}
                  />
                </g>
              ))
            )}
            {xLabels.map((label, j) => (
              <text
                key={label}
                x={padding + j * cellSize + cellSize / 2}
                y={padding + grid.length * cellSize + 14}
                textAnchor="middle"
                className="text-[10px] fill-[var(--text-secondary)]"
              >
                {label}
              </text>
            ))}
            {yLabels.map((label, i) => (
              <text
                key={label}
                x={padding - 4}
                y={padding + i * cellSize + cellSize / 2 + 4}
                textAnchor="end"
                className="text-[10px] fill-[var(--text-secondary)]"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
        <div id="isotherm-legend" className="space-y-2" aria-label="Pressure bins">
          <p className="text-[var(--text-small)] font-semibold text-[var(--text-primary)]">Pressure bins</p>
          {bins.map((bin, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-[var(--radius-sm)] shrink-0"
                style={{ background: bin.color, border: '1px solid rgba(0,78,152,0.4)' }}
              />
              <span className="text-[var(--text-small)] text-[var(--text-secondary)] tabular-nums">
                {bin.min.toFixed(1)} – {bin.max.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
        {hoveredCell && (
          <div
            className="rounded-[var(--radius-md)] p-3 shadow-strong border border-[var(--muted)]/50 text-[var(--text-small)]"
            style={{
              background: 'var(--bg)',
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              minWidth: 160,
            }}
          >
            <p className="font-semibold text-[var(--text-primary)]">
              RRR {hoveredCell.cell.rrr} · Wkts {hoveredCell.cell.wkt}
            </p>
            <p className="text-[var(--text-secondary)] mt-1">
              Innings in bin: {hoveredCell.cell.items.length}
            </p>
            {hoveredCell.cell.avgImpact != null && (
              <p className="text-[var(--accent-strong)] font-mono mt-1">
                Avg impact: {hoveredCell.cell.avgImpact.toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
