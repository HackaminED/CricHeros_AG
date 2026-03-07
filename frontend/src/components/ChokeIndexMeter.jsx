import React from 'react';

export default function ChokeIndexMeter({ value, theme = 'indigo' }) {
    // 0 is "Clutch", 1.0 is "Average", 2+ is "Choke"
    // Let's normalize visually: 
    // 0.5 - 1.0 = Clutch (Green)
    // 1.0 - 1.5 = Stable (Yellow)
    // 1.5+ = High Choke Risk (Red)
    
    const getColor = (v) => {
        if (v < 1.0) return 'text-emerald-400';
        if (v < 1.5) return 'text-amber-400';
        return 'text-red-400';
    };

    const getLabel = (v) => {
        if (v < 0.8) return 'Ice in Veins';
        if (v < 1.0) return 'Clutch Performer';
        if (v < 1.3) return 'Steady';
        if (v < 1.7) return 'Pressure Sensitive';
        return 'Choke Risk';
    };

    const percentage = Math.min(Math.max((value / 2) * 100, 0), 100);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-800"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * percentage) / 100}
                        strokeLinecap="round"
                        className={`${getColor(value)} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold font-mono ${getColor(value)}`}>
                        {value?.toFixed(2) || '—'}
                    </span>
                    <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-tighter">
                        Index
                    </span>
                </div>
            </div>
            <p className={`mt-3 text-sm font-bold uppercase tracking-widest ${getColor(value)}`}>
                {getLabel(value)}
            </p>
        </div>
    );
}
