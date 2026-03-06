import React, { useState, useEffect, useRef } from 'react';

const getScoreColor = (score) => {
    if (score >= 75) return { stroke: '#818cf8', glow: 'rgba(129, 140, 248, 0.4)', label: 'ELITE' };
    if (score >= 60) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', label: 'HIGH' };
    if (score >= 40) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', label: 'AVERAGE' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', label: 'LOW' };
};

export default function ImpactMeter({ score = 0, size = 200, label = 'Impact Score' }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const circumference = 2 * Math.PI * 45; // r = 45
    const { stroke, glow, label: tier } = getScoreColor(score);

    useEffect(() => {
        const duration = 1500;
        const start = performance.now();
        const from = 0;
        const to = score;

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [score]);

    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    viewBox="0 0 100 100"
                    className="transform -rotate-90"
                    style={{ width: size, height: size }}
                >
                    {/* Background circle */}
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="#1e1e2e"
                        strokeWidth="8"
                    />
                    {/* Glow effect */}
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke={stroke}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{
                            filter: `drop-shadow(0 0 8px ${glow})`,
                            transition: 'stroke-dashoffset 0.1s linear',
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="font-mono font-bold tracking-wider"
                        style={{ fontSize: size * 0.22, color: stroke }}
                    >
                        {animatedScore}
                    </span>
                    <span className="text-xs font-semibold tracking-widest opacity-60 mt-1"
                        style={{ color: stroke }}>
                        {tier}
                    </span>
                </div>
            </div>
            <span className="text-sm text-gray-400 font-medium">{label}</span>
        </div>
    );
}
