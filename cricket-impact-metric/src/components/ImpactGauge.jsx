import React, { useState, useEffect } from 'react';

const STROKE_WIDTH = 14;
const RADIUS = 48;

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
    const duration = 1200;
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
      className="relative flex flex-col items-center justify-center p-6 rounded-2xl dark-no-border card-hover"
      style={{
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-strong)',
        border: '1px solid var(--glass-border)',
        minWidth: size,
        minHeight: size,
      }}
    >
      {onInfoClick && (
        <button
          type="button"
          onClick={onInfoClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}
          title="How is this calculated?"
          aria-label="How is Impact Score calculated?"
        >
          ℹ
        </button>
      )}

      <p className="text-[var(--text-secondary)] font-semibold tracking-wider text-xs uppercase mb-4">
        {label}
      </p>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          aria-hidden
        >
          <defs>
            <linearGradient id="gauge-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-strong)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-muted)"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={showOrangeRim ? 'var(--accent)' : 'url(#gauge-fill)'}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-black tabular-nums"
          style={{
            fontSize: '3rem',
            background: 'linear-gradient(135deg, var(--accent-strong), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}
        >
          {animatedScore}
        </div>
      </div>
    </div>
  );
}
