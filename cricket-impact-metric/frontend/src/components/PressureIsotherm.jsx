import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PressureIsotherm({ data, theme = 'indigo' }) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-sm text-gray-500 italic">
                Insufficient data to map pressure isotherms.
            </div>
        );
    }

    // data format: { rrr, wickets, impact, count }
    const chartData = data.map(d => ({
        x: d.rrr,
        y: d.wickets,
        z: Math.abs(d.impact) * 10, // Scale for bubble size
        impact: d.impact,
        count: d.count
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-gray-900 border border-gray-700 p-2 rounded shadow-xl text-xs">
                    <p className="font-bold text-white mb-1">Pressure State</p>
                    <p><span className="text-gray-400">RRR:</span> <span className="text-white">{d.x}</span></p>
                    <p><span className="text-gray-400">Wickets Down:</span> <span className="text-white">{d.y}</span></p>
                    <p><span className="text-gray-400">CIS Δ:</span> <span className={d.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}>{d.impact > 0 ? '+' : ''}{d.impact.toFixed(1)}</span></p>
                    <p><span className="text-gray-400">Samples:</span> <span className="text-white">{d.count}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="RRR" 
                        stroke="#4b5563" 
                        tick={{fontSize: 10}} 
                        label={{ value: 'Req Run Rate', position: 'bottom', fill: '#6b7280', fontSize: 10 }}
                    />
                    <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Wickets" 
                        stroke="#4b5563" 
                        tick={{fontSize: 10}} 
                        domain={[0, 10]}
                        label={{ value: 'Wkts Down', angle: -90, position: 'left', fill: '#6b7280', fontSize: 10 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Pressure Performance" data={chartData}>
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.impact > 0 ? '#10b981' : '#ef4444'} 
                                fillOpacity={0.6}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
