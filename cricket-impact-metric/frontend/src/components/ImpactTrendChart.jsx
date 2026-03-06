import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass rounded-xl p-3 text-sm">
                <p className="text-gray-400 text-xs mb-1">
                    {data.start_date || `Innings ${label + 1}`}
                </p>
                <p className="font-semibold text-indigo-300">
                    Impact: {payload[0].value?.toFixed(3) || 'N/A'}
                </p>
                {data.runs_scored !== undefined && (
                    <p className="text-gray-400 text-xs mt-1">
                        Runs: {data.runs_scored} | Wickets: {data.wickets_taken}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export default function ImpactTrendChart({ data = [], height = 300 }) {
    const chartData = data.map((d, i) => ({
        ...d,
        index: i + 1,
        impact: d.match_impact || 0,
    }));

    const avgImpact = chartData.length > 0
        ? chartData.reduce((sum, d) => sum + d.impact, 0) / chartData.length
        : 0;

    return (
        <div className="w-full" style={{ height }}>
            {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    No trend data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                        <defs>
                            <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                            label={{ value: 'Impact', angle: -90, position: 'insideLeft', fill: '#6c7086', fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={0}
                            stroke="#45475a"
                            strokeDasharray="3 3"
                            label={{ value: 'Zero', fill: '#6c7086', fontSize: 10 }}
                        />
                        <ReferenceLine
                            y={avgImpact}
                            stroke="#34d399"
                            strokeDasharray="5 5"
                            label={{ value: 'Avg', fill: '#34d399', fontSize: 10 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="impact"
                            stroke="#6366f1"
                            fill="url(#impactGradient)"
                            strokeWidth={2.5}
                            dot={{ fill: '#818cf8', strokeWidth: 0, r: 4 }}
                            activeDot={{ fill: '#a5b4fc', strokeWidth: 0, r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
