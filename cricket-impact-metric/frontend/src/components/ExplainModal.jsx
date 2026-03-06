import React from 'react';

export default function ExplainModal({ isOpen, onClose, explain, lastNInnings = [] }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative glass rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold gradient-text">How Impact Score is Calculated</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Formula */}
                <div className="glass rounded-xl p-4 mb-5 border border-indigo-500/10">
                    <p className="text-indigo-300 font-mono font-semibold text-sm mb-2">
                        Impact = Performance × Context × Pressure
                    </p>
                    <p className="text-gray-400 text-xs">{explain?.summary}</p>
                </div>

                {/* Plain English Explanations */}
                {explain?.plain_english && (
                    <div className="space-y-3 mb-6">
                        {explain.plain_english.map((text, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-gray-300">{text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Formulas Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <div className="glass rounded-xl p-4">
                        <h4 className="text-xs uppercase tracking-wider text-emerald-400 mb-2 font-semibold">Batting Formula</h4>
                        <p className="text-xs font-mono text-gray-400">{explain?.batting_formula}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <h4 className="text-xs uppercase tracking-wider text-blue-400 mb-2 font-semibold">Bowling Formula</h4>
                        <p className="text-xs font-mono text-gray-400">{explain?.bowling_formula}</p>
                    </div>
                </div>

                {/* Context Phases */}
                {explain?.context_phases && (
                    <div className="glass rounded-xl p-4 mb-5">
                        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 font-semibold">Context Multipliers</h4>
                        <div className="flex gap-3">
                            {Object.entries(explain.context_phases).map(([phase, mult]) => (
                                <div key={phase} className="flex-1 text-center glass rounded-lg p-2">
                                    <p className="text-lg font-bold font-mono text-amber-400">{mult}×</p>
                                    <p className="text-[10px] text-gray-500 mt-1 capitalize">{phase}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories Legend */}
                {explain?.categories && (
                    <div className="glass rounded-xl p-4 mb-5">
                        <h4 className="text-xs uppercase tracking-wider text-purple-400 mb-3 font-semibold">Score Categories</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {Object.entries(explain.categories).map(([range, label]) => (
                                <div key={range} className="text-center">
                                    <p className="text-xs font-mono text-gray-300">{range}</p>
                                    <p className="text-[10px] text-gray-500">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Last N Innings Table */}
                {lastNInnings.length > 0 && (
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">
                            Last {lastNInnings.length} Innings Breakdown
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-700/30">
                                        <th className="px-2 py-2 text-left">Date</th>
                                        <th className="px-2 py-2 text-center">Runs</th>
                                        <th className="px-2 py-2 text-center">Wkts</th>
                                        <th className="px-2 py-2 text-center">Perf</th>
                                        <th className="px-2 py-2 text-center">Ctx</th>
                                        <th className="px-2 py-2 text-center">Pres</th>
                                        <th className="px-2 py-2 text-center">Raw</th>
                                        <th className="px-2 py-2 text-center">IM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lastNInnings.map((inn, idx) => (
                                        <tr key={idx} className="border-t border-gray-800/50 hover:bg-indigo-500/5">
                                            <td className="px-2 py-1.5 text-gray-400">{inn.date || '—'}</td>
                                            <td className="px-2 py-1.5 text-center text-amber-400 font-mono">{inn.runs}</td>
                                            <td className="px-2 py-1.5 text-center text-emerald-400 font-mono">{inn.wickets}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-300 font-mono">{inn.performance_score}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-300 font-mono">{inn.context_weight}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-300 font-mono">{inn.pressure_index}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-300 font-mono">{inn.raw_impact}</td>
                                            <td className="px-2 py-1.5 text-center text-indigo-400 font-mono font-bold">
                                                {inn.impact_normalized_innings?.toFixed(1) ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Example */}
                <div className="mt-5 glass rounded-xl p-4 border border-indigo-500/10">
                    <h4 className="text-xs uppercase tracking-wider text-indigo-400 mb-2 font-semibold">💡 Example</h4>
                    <p className="text-xs text-gray-400">
                        Scored 40 chasing 12 RPO with 5 wickets down → high performance (40 runs, decent SR)
                        × death overs context (1.4×) × extreme pressure (2.0×) = significantly higher impact
                        than 100 runs in a dead rubber with no pressure.
                    </p>
                </div>
            </div>
        </div>
    );
}
