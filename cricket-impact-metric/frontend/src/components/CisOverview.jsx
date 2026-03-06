import React from 'react';

export default function CisOverview({ cis, wpa, theme = 'indigo' }) {
    if (!cis) return null;

    const components = [
        { label: 'Runs Above Avg', value: cis.runs_added, sub: 'Replacement Baseline', color: 'text-amber-400' },
        { label: 'SR Delta', value: cis.sr_delta, sub: 'v Contextual Mean', color: 'text-emerald-400', suffix: '%' },
        { label: 'Batting CIS', value: cis.batting_cis, sub: 'Contextual Impact', color: theme === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400' },
        { label: 'WPA (Clutch)', value: wpa?.clutch_pct, sub: 'Match Swing Avg', color: 'text-blue-400', suffix: '%' }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {components.map((comp, idx) => (
                <div key={idx} className="glass rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all group">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{comp.label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-bold font-mono ${comp.color}`}>
                            {comp.value > 0 ? '+' : ''}{comp.value?.toFixed(1) ?? '0'}
                            {comp.suffix && <span className="text-xs ml-0.5">{comp.suffix}</span>}
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 italic group-hover:text-gray-400 transition-colors">{comp.sub}</p>
                </div>
            ))}
        </div>
    );
}
