"use client";

import React, { useState, useEffect } from 'react';
import ImpactMeter from '@/components/ImpactMeter';
import ImpactTrendChart from '@/components/ImpactTrendChart';
import LoadingScreen from '@/components/LoadingScreen';
import { Activity, Info, Trophy, Target, TrendingUp } from 'lucide-react';

// Mock Data for the last 10 innings
const mockInningsData = [
  { inning: 'Match 1', impact: 45 },
  { inning: 'Match 2', impact: 60 },
  { inning: 'Match 3', impact: 82 },
  { inning: 'Match 4', impact: 35 },
  { inning: 'Match 5', impact: 50 },
  { inning: 'Match 6', impact: 75 },
  { inning: 'Match 7', impact: 90 },
  { inning: 'Match 8', impact: 55 },
  { inning: 'Match 9', impact: 68 },
  { inning: 'Match 10', impact: 88 }, // Latest match
];

export default function Home() {
  const latestImpact = mockInningsData[mockInningsData.length - 1].impact;
  const [activeTab, setActiveTab] = useState<'overview' | 'model'>('overview');
  const [showLoading, setShowLoading] = useState(true);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 selection:bg-emerald-500/30 overflow-x-hidden pb-32">
      
      {showLoading && (
        <LoadingScreen onComplete={() => setShowLoading(false)} />
      )}

      {/* Hero Background Elements - Simplified for a cleaner look */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-900/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
      <header className="px-6 py-10 md:py-16 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
              <Trophy className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Impact Metric
            </h1>
          </div>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl">Quantifying true match-winning influence under pressure.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-900 p-1.5 rounded-full border border-gray-800 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'overview' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('model')}
            className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'model' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            Mathematical Model
          </button>
        </div>
      </header>

      <div className="px-6 pt-12">
        {activeTab === 'overview' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Highlight impact meter */}
              <div className="lg:col-span-1">
                <ImpactMeter score={latestImpact} />
              </div>
              
              {/* Trend Chart */}
              <div className="lg:col-span-2">
                <ImpactTrendChart data={mockInningsData} />
              </div>
            </div>

            {/* Metric Breakdown Cards */}
            <h2 className="text-2xl font-bold mt-16 mb-8 flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Activity className="w-6 h-6 text-emerald-500" />
              Impact Components Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors">
                <Target className="w-8 h-8 text-emerald-500 mb-6" />
                <h3 className="text-xl font-bold text-white tracking-tight">Performance</h3>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">Raw output: 78 off 42 balls. High strike rate translates to a high base score.</p>
                <div className="mt-8 text-4xl font-black text-white tracking-tighter">82 <span className="text-base font-medium text-gray-500">/100</span></div>
              </div>

              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-teal-500/50 transition-colors">
                <Info className="w-8 h-8 text-teal-500 mb-6" />
                <h3 className="text-xl font-bold text-white tracking-tight">Match Context</h3>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">Team was 32/4 inside powerplay. Chasing 180+. Very high context multiplier.</p>
                <div className="mt-8 text-4xl font-black text-white tracking-tighter">1.4x <span className="text-base font-medium text-gray-500">Mult</span></div>
              </div>

              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-amber-500/50 transition-colors">
                <TrendingUp className="w-8 h-8 text-amber-500 mb-6" />
                <h3 className="text-xl font-bold text-white tracking-tight">Situation (Pressure)</h3>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">Knockout game. Player was out of form previously. Maximum pressure scenarios.</p>
                <div className="mt-8 text-4xl font-black text-white tracking-tighter">1.2x <span className="text-base font-medium text-gray-500">Mult</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 p-10 md:p-16 rounded-[2.5rem] animate-fade-in relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">Mathematical Formulation</h2>
            
            <div className="prose prose-invert prose-emerald max-w-none">
              <p className="text-lg text-gray-300">
                The Impact Metric (IM) goes beyond traditional averages by introducing dynamic multipliers based on the game's state.
              </p>
              
              <div className="bg-black/50 p-6 rounded-xl border border-gray-800 my-8 font-mono text-center text-lg shadow-inner">
                <span className="text-blue-400">IM</span> = ( 
                <span className="text-emerald-400">Base Performance</span> × 
                <span className="text-amber-400"> Context Multiplier</span> × 
                <span className="text-rose-400"> Pressure Multiplier</span> )
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h4 className="text-xl font-semibold mb-3">1. Base Performance (BP)</h4>
                  <ul className="list-disc pl-5 text-gray-400 space-y-2">
                    <li>Batting: <code className="text-emerald-300">Runs + (Strike Rate Factor)</code></li>
                    <li>Bowling: <code className="text-emerald-300">Wickets × (Economy Rate Factor)</code></li>
                    <li>Scaled between 0–100 initially.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold mb-3">2. Context Multiplier (CM)</h4>
                  <ul className="list-disc pl-5 text-gray-400 space-y-2">
                    <li>Calculated via Entry Wicket State (EWS).</li>
                    <li>Required Run Rate impact (RRR vs Current).</li>
                    <li>Range: <code className="text-amber-300">0.8x to 1.5x</code> (E.g. coming at 10/3 adds 1.5x, coming at 150/0 adds 0.8x).</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-800 pt-8">
                <h4 className="text-xl font-semibold mb-3">Normalization & Recency</h4>
                <p className="text-gray-400">
                  After calculating the raw IM, we apply a Sigmoid-like normalization to strictly bound the metric between 0 and 100, where 50 represents average expected performance. 
                  For the rolling 10-innings, earlier matches decay in weightage (e.g. 0.9^k where k is matches ago) to heavily emphasize recent form.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
