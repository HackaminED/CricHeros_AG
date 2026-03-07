import React, { useState, useEffect } from 'react';

const STROKE_WIDTH = 18;
const RADIUS = 45;

export default function ImpactGauge({
  score = 0,
  size = 200,
  label = 'Impact Score',
  onInfoClick,
  showNeonRim = true,
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const normalizedScore = Math.min(100, Math.max(0, score));
  const r = RADIUS;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const from = 0;
    const to = normalizedScore;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [normalizedScore]);

  const showOrangeRim = showNeonRim && animatedScore >= 80;

  return (
    <div
      className="relative flex flex-col items-center justify-center p-6 rounded-[var(--radius-lg)] dark-no-border"
      style={{
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-strong)',
        border: '1px solid rgba(58,110,165,0.2)',
        minWidth: size,
        minHeight: size,
      }}
    >
      {onInfoClick && (
        <button
          type="button"
          onClick={onInfoClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,78,152,0.5)]"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: 'var(--shadow-soft)',
          }}
          title="How is this calculated?"
          aria-label="How is Impact Score calculated?"
        >
          ℹ
        </button>
      )}

      <h3 className="text-[var(--text-secondary)] font-medium tracking-wide text-xs uppercase mb-4">
        {label}
      </h3>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          aria-hidden
        >
          <defs>
            <filter id="gauge-inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor="rgba(0,78,152,0.15)" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {showOrangeRim && (
              <filter id="orange-glow">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feFlood floodColor="var(--accent)" floodOpacity="0.4" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={STROKE_WIDTH}
            strokeOpacity={0.4}
          />
          {/* Progress ring with inner bevel */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent-strong)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: showOrangeRim ? 'url(#orange-glow)' : 'url(#gauge-inner-shadow)',
            }}
          />
          {showOrangeRim && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r - STROKE_WIDTH / 2}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeOpacity={0.5}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          )}
        </svg>
        {/* Center number */}
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-black tabular-nums"
          style={{
            fontSize: '48px',
            color: 'var(--accent-strong)',
            lineHeight: 1,
          }}
        >
          {animatedScore}
        </div>
      </div>

      <div className="flex justify-between w-full mt-4 max-w-[10rem] text-[10px] font-semibold text-[var(--text-secondary)]">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
