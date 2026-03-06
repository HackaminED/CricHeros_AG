"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ImpactTrendChart({ data }: { data: { inning: string, impact: number }[] }) {
  return (
    <div className="w-full h-80 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-md shadow-xl flex flex-col">
      <h3 className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-4">Last 10 Innings Trend</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="inning" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Baseline (50)', fill: '#f59e0b', fontSize: 12 }} />
            <Area type="monotone" dataKey="impact" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
