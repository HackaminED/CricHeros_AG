import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImpactMeter from '../components/ImpactMeter';
import ImpactTrendChart from '../components/ImpactTrendChart';
import PlayerSearch from '../components/PlayerSearch';
import { getPlayerImpact, getPlayerTrend } from '../api/api';

function StatCard({ label, value, sub, color = 'text-gray-200' }) {
    return (
        <div className="glass rounded-xl p-4 animate-fade-in">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function PlayerDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [playerData, setPlayerData] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const playerName = searchParams.get('player');

    useEffect(() => {
        if (!playerName) return;
        loadPlayer(playerName);
    }, [playerName]);

    const loadPlayer = async (name) => {
        setLoading(true);
        setError(null);
        try {
            const [impact, trend] = await Promise.all([
                getPlayerImpact(name),
                getPlayerTrend(name),
            ]);
            setPlayerData(impact);
            setTrendData(trend.trend || []);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load player data');
            setPlayerData(null);
            setTrendData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (player) => {
        setSearchParams({ player: player.player });
    };

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
                    {/* Player header */}
                    <div className="glass rounded-2xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Impact Meter */}
                            <ImpactMeter score={playerData.impact_score} size={180} />

                            {/* Player Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                    {playerData.player}
                                </h2>
                                <p className="text-indigo-400 font-medium mb-4">{playerData.team}</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <StatCard
                                        label="Batting Impact"
                                        value={playerData.latest_match?.batting_impact?.toFixed(3) || '0'}
                                        sub="Latest match"
                                        color={playerData.latest_match?.batting_impact > 0 ? 'text-emerald-400' : 'text-red-400'}
                                    />
                                    <StatCard
                                        label="Bowling Impact"
                                        value={playerData.latest_match?.bowling_impact?.toFixed(3) || '0'}
                                        sub="Latest match"
                                        color={playerData.latest_match?.bowling_impact > 0 ? 'text-emerald-400' : 'text-red-400'}
                                    />
                                    <StatCard
                                        label="Latest Runs"
                                        value={playerData.latest_match?.runs_scored || 0}
                                        color="text-amber-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-4">
                            Impact Trend — Last {trendData.length} Innings
                        </h3>
                        <ImpactTrendChart data={trendData} height={320} />
                    </div>

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
        </div>
    );
}
