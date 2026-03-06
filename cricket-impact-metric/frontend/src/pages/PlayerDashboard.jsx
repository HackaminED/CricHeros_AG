import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImpactMeter from '../components/ImpactMeter';
import ImpactTrendChart from '../components/ImpactTrendChart';
import PlayerSearch from '../components/PlayerSearch';
import ExplainModal from '../components/ExplainModal';
import { getPlayerImpact, getPlayerTrend } from '../api/api';
import { useGender } from '../context/GenderContext';

function StatCard({ label, value, sub, color = 'text-gray-200', info }) {
    return (
        <div className="glass rounded-xl p-4 animate-fade-in relative group">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold font-mono ${color}`}>
                {value ?? '—'}
            </p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
            {info && (
                <span className="absolute top-2 right-2 text-gray-600 text-xs cursor-help opacity-0 group-hover:opacity-100 transition-opacity" title={info}>
                    ℹ
                </span>
            )}
        </div>
    );
}

export default function PlayerDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [playerData, setPlayerData] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [trend3Layer, setTrend3Layer] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastN, setLastN] = useState(10);
    const [showExplain, setShowExplain] = useState(false);
    const { gender, toggleGender } = useGender();

    const playerName = searchParams.get('player');

    useEffect(() => {
        if (!playerName) return;
        loadPlayer(playerName, gender);
    }, [playerName, lastN, gender]);

    const loadPlayer = async (name, currentGender) => {
        setLoading(true);
        setError(null);
        try {
            const [impact, trend] = await Promise.all([
                getPlayerImpact(name, lastN, currentGender),
                getPlayerTrend(name, 10, lastN, currentGender),
            ]);
            
            // Auto-correct global gender state if we loaded a player via link
            // who doesn't belong to the active toggle
            if (impact.gender && impact.gender !== currentGender) {
                toggleGender(impact.gender);
                // Return here so next effect tick reloads correctly
                return;
            }

            setPlayerData(impact);
            setTrendData(trend.trend || []);
            setTrend3Layer(trend.trend_3layer || impact.last_n_innings || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load player data');
            setPlayerData(null);
            setTrendData([]);
            setTrend3Layer([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (player) => {
        setSearchParams({ player: player.player });
    };

    const stats = playerData?.last_n_stats;
    const career = playerData?.career;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Player Dashboard</h1>
                    <p className="text-gray-500 mt-1">Search and analyze player impact metrics</p>
                </div>
                <PlayerSearch onSelect={handleSelect} />
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass rounded-xl p-6 border border-red-500/30 text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* No player selected */}
            {!playerName && !loading && (
                <div className="glass rounded-2xl p-16 text-center">
                    <div className="text-6xl mb-4">🏏</div>
                    <h2 className="text-xl font-semibold text-gray-300 mb-2">Search for a Player</h2>
                    <p className="text-gray-500">Use the search bar above to find a player and view their impact analysis</p>
                </div>
            )}

            {/* Player data */}
            {playerData && !loading && (
                <>
                    {/* Player header + Impact Ring */}
                    <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
                        {/* Soft background glow based on gender */}
                        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none 
                            ${gender === 'Women' ? 'bg-fuchsia-500' : 'bg-indigo-500'}`}></div>

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <ImpactMeter
                                score={playerData.impact_score || 0}
                                size={180}
                                onInfoClick={() => setShowExplain(true)}
                                theme={gender === 'Women' ? 'fuchsia' : 'indigo'}
                            />

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-3">
                                    {playerData.player}
                                    <span className={`text-xl opacity-80 ${gender === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400'}`}>
                                        {gender === 'Women' ? '♀' : '♂'}
                                    </span>
                                </h2>
                                <p className="text-gray-400 font-medium mb-1 flex items-center justify-center md:justify-start gap-2">
                                    {playerData.team}
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-wider">
                                        {gender}
                                    </span>
                                </p>
                                {playerData.category && (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 mt-2
                                        ${gender === 'Women' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                        {playerData.category}
                                    </span>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <StatCard
                                        label="Batting Component"
                                        value={playerData.batting_impact_component?.toFixed(1) || '0'}
                                        sub="Avg performance"
                                        color={playerData.batting_impact_component > 0 ? 'text-emerald-400' : 'text-red-400'}
                                        info="Average batting performance score across last N innings"
                                    />
                                    <StatCard
                                        label="Bowling Component"
                                        value={playerData.bowling_impact_component?.toFixed(1) || '0'}
                                        sub="Avg performance"
                                        color={playerData.bowling_impact_component > 0 ? 'text-emerald-400' : 'text-gray-400'}
                                        info="Average bowling performance score across last N innings"
                                    />
                                    <StatCard
                                        label="Total Innings"
                                        value={playerData.total_innings || 0}
                                        sub={`Showing last ${playerData.last_n_count || 0}`}
                                        color="text-gray-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Last N Games Control + Stats */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-200">
                                Stats for Last {lastN} {lastN === 1 ? 'Game' : 'Games'}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">Last N:</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={lastN}
                                    onChange={(e) => setLastN(Number(e.target.value))}
                                    className={`w-28 ${gender === 'Women' ? 'accent-fuchsia-500' : 'accent-indigo-500'}`}
                                    id="last-n-slider"
                                />
                                <span className={`text-sm font-mono font-bold w-6 text-center ${gender === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400'}`}>
                                    {lastN}
                                </span>
                            </div>
                        </div>

                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                <StatCard label="Innings" value={stats.innings} color="text-white" />
                                <StatCard label="Runs" value={stats.runs} color="text-amber-400" info="Total runs scored in last N innings" />
                                <StatCard label="Strike Rate" value={stats.strike_rate} color="text-emerald-400" info="(Runs / Balls) × 100" />
                                <StatCard label="Bat Average" value={stats.batting_average} color="text-blue-400" info="Runs / Dismissals" />
                                <StatCard label="Wickets" value={stats.wickets} color="text-purple-400" />
                                <StatCard label="Economy" value={stats.economy} color="text-orange-400" info="Runs conceded per over bowled" />
                            </div>
                        )}

                        {/* Impact Component Averages */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <div className="glass rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-500 mb-1">Avg Context Weight</p>
                                <p className="text-lg font-bold font-mono text-amber-400">{playerData.context_weight_avg}×</p>
                            </div>
                            <div className="glass rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-500 mb-1">Avg Pressure Index</p>
                                <p className="text-lg font-bold font-mono text-red-400">{playerData.pressure_index_avg}×</p>
                            </div>
                            <div className="glass rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-500 mb-1">Weighted Impact</p>
                                <p className="text-lg font-bold font-mono text-indigo-400">{playerData.impact_weighted}</p>
                            </div>
                            <div className="glass rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-500 mb-1">Bowling SR</p>
                                <p className="text-lg font-bold font-mono text-emerald-400">{stats?.bowling_strike_rate ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3-Layer Impact Trend Chart */}
                    <div>
                        {trend3Layer.length > 0 ? (
                            <ImpactTrendChart data={trend3Layer} height={380} use3Layer={true} />
                        ) : (
                            <ImpactTrendChart data={trendData} height={380} />
                        )}
                    </div>

                    {/* Per-Innings Breakdown Table */}
                    {playerData.last_n_innings && playerData.last_n_innings.length > 0 && (
                        <div className="glass rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700/30">
                                <h3 className="text-lg font-semibold text-gray-200">
                                    Innings Breakdown (Last {playerData.last_n_innings.length})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-700/30">
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-3 py-3 text-center">Runs</th>
                                            <th className="px-3 py-3 text-center">Balls</th>
                                            <th className="px-3 py-3 text-center">Wkts</th>
                                            <th className="px-3 py-3 text-center">Bat Perf</th>
                                            <th className="px-3 py-3 text-center">Bowl Perf</th>
                                            <th className="px-3 py-3 text-center">Context</th>
                                            <th className="px-3 py-3 text-center">Pressure</th>
                                            <th className="px-3 py-3 text-center">Raw</th>
                                            <th className="px-3 py-3 text-center">IM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {playerData.last_n_innings.map((inn, idx) => (
                                            <tr key={idx} className="border-t border-gray-800/50 hover:bg-indigo-500/5 transition-colors">
                                                <td className="px-4 py-2.5 text-gray-400 text-xs">{inn.date || '—'}</td>
                                                <td className="px-3 py-2.5 text-center text-amber-400 font-mono">{inn.runs}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-300 font-mono">{inn.balls_faced}</td>
                                                <td className="px-3 py-2.5 text-center text-emerald-400 font-mono">{inn.wickets}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-300 font-mono">{inn.batting_performance}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-300 font-mono">{inn.bowling_performance}</td>
                                                <td className="px-3 py-2.5 text-center text-amber-400 font-mono">{inn.context_weight}×</td>
                                                <td className="px-3 py-2.5 text-center text-red-400 font-mono">{inn.pressure_index}×</td>
                                                <td className="px-3 py-2.5 text-center text-gray-300 font-mono">{inn.raw_impact}</td>
                                                <td className={`px-3 py-2.5 text-center font-mono font-bold ${gender === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400'}`}>
                                                    {inn.impact_normalized_innings?.toFixed(1) ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Career Stats */}
                    {career && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Career Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                <StatCard label="Matches" value={career.total_matches || 0} color="text-white" />
                                <StatCard label="Total Runs" value={career.total_runs || 0} color="text-amber-400" />
                                <StatCard label="Balls Faced" value={career.total_balls_faced || 0} color="text-gray-300" />
                                <StatCard label="Wickets" value={career.total_wickets || 0} color="text-emerald-400" />
                                <StatCard
                                    label="Avg Bat Impact"
                                    value={career.avg_batting_impact?.toFixed(3) || '0'}
                                    color={career.avg_batting_impact > 0 ? 'text-emerald-400' : 'text-red-400'}
                                />
                                <StatCard
                                    label="Avg Bowl Impact"
                                    value={career.avg_bowling_impact?.toFixed(3) || '0'}
                                    color={career.avg_bowling_impact > 0 ? 'text-emerald-400' : 'text-red-400'}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Explain Modal */}
            <ExplainModal
                isOpen={showExplain}
                onClose={() => setShowExplain(false)}
                explain={playerData?.explain}
                lastNInnings={playerData?.last_n_innings || []}
            />
        </div>
    );
}
