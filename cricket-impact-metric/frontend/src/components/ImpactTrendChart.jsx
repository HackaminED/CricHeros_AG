import React from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass rounded-xl p-3 text-sm border border-indigo-500/20">
                <p className="text-gray-400 text-xs mb-1">
                    {data.date || `Innings ${label}`}
                </p>
                <p className={`font-semibold ${payload[0].color === '#d946ef' ? 'text-fuchsia-300' : 'text-indigo-300'}`}>
                    IM: {data.impact_normalized_innings?.toFixed(1) ?? payload[0].value?.toFixed(1) ?? 'N/A'}
                </p>
                {data.runs !== undefined && (
                    <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                        <p>Runs: {data.runs} ({data.balls_faced}b) | Wkts: {data.wickets}</p>
                        <p>Perf: {data.performance_score} × Ctx: {data.context_weight} × Pres: {data.pressure_index}</p>
                    </div>
                )}
                {data.runs_scored !== undefined && !data.runs && (
                    <p className="text-gray-400 text-xs mt-1">
                        Runs: {data.runs_scored} | Wickets: {data.wickets_taken}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export default function ImpactTrendChart({ data = [], height = 300, use3Layer = false, theme = 'indigo' }) {
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
        <div className="w-full bg-gray-900/50 p-6 rounded-[2rem] border border-gray-800 backdrop-blur-md shadow-xl flex flex-col" style={{ height }}>
            {chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    No trend data available
                </div>
            ) : (
                <div className="flex-1 w-full h-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                        <defs>
                            <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme === 'fuchsia' ? '#d946ef' : '#6366f1'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme === 'fuchsia' ? '#d946ef' : '#6366f1'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                        <XAxis
                            dataKey="index"
                            stroke="#45475a"
                            fontSize={11}
                            tickLine={false}
                            label={{ value: 'Innings', position: 'insideBottom', offset: -5, fill: '#6c7086', fontSize: 11 }}
                        />
                        <YAxis
                            stroke="#45475a"
                            fontSize={11}
                            tickLine={false}
                            domain={yDomain}
                            label={{
                                value: use3Layer ? 'Impact (0-100)' : 'Impact',
                                angle: -90, position: 'insideLeft', fill: '#6c7086', fontSize: 11
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {use3Layer && (
                            <ReferenceLine
                                y={50}
                                stroke="#45475a"
                                strokeDasharray="3 3"
                                label={{ value: 'Neutral', fill: '#6c7086', fontSize: 10 }}
                            />
                        )}
                        {!use3Layer && (
                            <ReferenceLine
                                y={0}
                                stroke="#45475a"
                                strokeDasharray="3 3"
                                label={{ value: 'Zero', fill: '#6c7086', fontSize: 10 }}
                            />
                        )}
                        <ReferenceLine
                            y={avgImpact}
                            stroke="#34d399"
                            strokeDasharray="5 5"
                            label={{ value: 'Avg', fill: '#34d399', fontSize: 10 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="impact"
                            stroke={theme === 'fuchsia' ? '#d946ef' : '#6366f1'}
                            fill="url(#impactGradient)"
                            strokeWidth={2.5}
                            dot={{ fill: theme === 'fuchsia' ? '#f0abfc' : '#818cf8', strokeWidth: 0, r: 4 }}
                            activeDot={{ fill: theme === 'fuchsia' ? '#fdf4ff' : '#a5b4fc', strokeWidth: 0, r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
