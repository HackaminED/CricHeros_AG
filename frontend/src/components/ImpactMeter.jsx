import React, { useState, useEffect } from 'react';

const getColor = (s, theme) => {
    // We can use the theme parameter here to override emerald/amber/rose if we want
    // But aligning with friend's design:
    if (s < 40) return "#f43f5e"; // Rose 500
    if (s < 60) return "#f59e0b"; // Amber 500
    // If the gender is set, we use the active theme instead of standard emerald.
    return theme === 'fuchsia' ? '#d946ef' : '#6366f1'; 
};

export default function ImpactMeter({ score = 0, size = 180, label = 'Impact Score', onInfoClick, theme = 'indigo' }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    const normalizedScore = Math.min(100, Math.max(0, score));

    // Circumference of half circle = pi * r
    const r = 40;
    const circum = Math.PI * r;
    const offset = circum - (animatedScore / 100) * circum;

    const color = getColor(animatedScore, theme);

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

    return (
        <div className="relative flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-[2rem] border border-gray-800 backdrop-blur-md shadow-xl">
            {onInfoClick && (
                <button
                    onClick={onInfoClick}
                    className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-lg
                        ${theme === 'fuchsia' 
                            ? 'bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/40 hover:text-white shadow-fuchsia-500/10' 
                            : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/40 hover:text-white shadow-indigo-500/10'}`}
                    title="How is this calculated?"
                >
                    ℹ
                </button>
            )}

            <h3 className="text-gray-400 font-medium tracking-wide text-xs uppercase mb-4">
                {label}
            </h3>

            <div className="relative flex items-end justify-center overflow-hidden" style={{ width: size, height: size / 2 }}>
                {/* Background Arc */}
                <svg className="absolute top-0 w-full" style={{ height: size }} viewBox="0 0 100 100">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Foreground Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circum}
                        strokeDashoffset={offset}
                        style={{
                            filter: `drop-shadow(0 0 8px ${color}80)`,
                            transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease',
                        }}
                    />
                </svg>

                {/* Score Display */}
                <div
                    className="absolute font-black tabular-nums tracking-tighter"
                    style={{ color: color, fontSize: size * 0.25, bottom: -size * 0.05 }}
                >
                    {animatedScore}
                </div>
            </div>

            {/* Legend / Baseline markers */}
            <div className="flex justify-between w-full mt-4 max-w-[12rem] text-[10px] font-semibold text-gray-500">
                <span>0</span>
                <span className="text-gray-400">50</span>
                <span>100</span>
            </div>
        </div>
    );
}
