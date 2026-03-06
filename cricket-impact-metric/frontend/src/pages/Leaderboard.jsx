import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getStats } from '../api/api';
import { useGender } from '../context/GenderContext';
import PlayerSearch from '../components/PlayerSearch';

export default function Leaderboard() {
    const navigate = useNavigate();
    const { gender } = useGender();
    const [data, setData] = useState([]);
    const [stats, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [minInnings, setMinInnings] = useState(10);

    useEffect(() => {
        loadData();
    }, [role, minInnings, gender]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [lb, st] = await Promise.all([
                getLeaderboard(50, minInnings, role, null, gender),
                getStats(),
            ]);
            setData(lb.leaderboard || []);
            setStatsData(st);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'from-indigo-500/20 to-transparent';
        if (score >= 60) return 'from-emerald-500/15 to-transparent';
        if (score >= 40) return 'from-amber-500/10 to-transparent';
        return 'from-red-500/10 to-transparent';
    };

    const getScoreColor = (score) => {
        const baseClass = gender === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400';
        if (score >= 80) return baseClass;
        if (score >= 60) return 'text-emerald-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    const getRankBadge = (idx) => {
        if (idx === 0) return '🥇';
        if (idx === 1) return '🥈';
        if (idx === 2) return '🥉';
        return `#${idx + 1}`;
    };

    const getCategoryBadge = (cat) => {
        const colors = {
            'Match Winner': gender === 'Women' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-indigo-500/20 text-indigo-300',
            'High Impact': 'bg-emerald-500/20 text-emerald-300',
            'Neutral': 'bg-amber-500/20 text-amber-300',
            'Low Impact': 'bg-orange-500/20 text-orange-300',
            'Poor Impact': 'bg-red-500/20 text-red-300',
        };
        return colors[cat] || 'bg-gray-500/20 text-gray-300';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">{gender}'s Leaderboard</h1>
                    <p className="text-gray-500 mt-1">Top players ranked by Three-Layer Impact Metric</p>
                </div>
                {/* Embedded global PlayerSearch bounded by context */}
                <div className="w-full md:w-auto">
                     <PlayerSearch onSelect={(p) => navigate(`/player?player=${encodeURIComponent(p.player)}`)} />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Role filter */}
                    {[
                        { key: null, label: 'All' },
                        { key: 'batter', label: 'Batters' },
                        { key: 'bowler', label: 'Bowlers' },
                    ].map((r) => (
                        <button
                            key={r.key || 'all'}
                            onClick={() => setRole(r.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${role === r.key
                                    ? (gender === 'Women' ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25')
                                    : 'glass text-gray-400 hover:text-white hover:border-indigo-500/30'}`}
                            id={`filter-${r.key || 'all'}`}
                        >
                            {r.label}
                        </button>
                    ))}

                    {/* Min innings */}
                    <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-gray-500">Min Innings:</span>
                        <select
                            value={minInnings}
                            onChange={(e) => setMinInnings(Number(e.target.value))}
                            className="glass rounded-lg px-3 py-2 text-sm text-gray-300 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            id="min-innings-select"
                        >
                            {[5, 10, 15, 20, 30].map(n => (
                                <option key={n} value={n} className="bg-gray-900">{n}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Global stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold font-mono text-indigo-400">{stats.total_players}</p>
                        <p className="text-xs text-gray-500 mt-1">Players (Major Nations)</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold font-mono text-emerald-400">{stats.total_matches}</p>
                        <p className="text-xs text-gray-500 mt-1">Matches Analyzed</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold font-mono text-amber-400">{stats.average_impact?.toFixed(1)}</p>
                        <p className="text-xs text-gray-500 mt-1">Avg Impact Score</p>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-700/30">
                                    <th className="px-4 py-4 text-center w-16">Rank</th>
                                    <th className="px-6 py-4 text-left">Player</th>
                                    <th className="px-4 py-4 text-left">Team</th>
                                    <th className="px-4 py-4 text-center">IM Score</th>
                                    <th className="px-4 py-4 text-center">Category</th>
                                    <th className="px-4 py-4 text-center">Innings</th>
                                    <th className="px-4 py-4 text-center">Runs</th>
                                    <th className="px-4 py-4 text-center">Wickets</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((p, idx) => (
                                    <tr
                                        key={p.player}
                                        className={`border-t border-gray-800/50 hover:bg-indigo-500/5
                      transition-colors cursor-pointer bg-gradient-to-r ${getScoreBg(p.impact_score)}`}
                                        onClick={() => navigate(`/player?player=${encodeURIComponent(p.player)}`)}
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                    >
                                        <td className="px-4 py-3 text-center text-lg">
                                            {getRankBadge(idx)}
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-gray-200">
                                            {p.player} <span className="opacity-50 text-xs ml-1">{gender === 'Women' ? '♀' : '♂'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {p.team}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-mono font-bold text-base ${getScoreColor(p.impact_score)}`}>
                                                {p.impact_score?.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryBadge(p.category)}`}>
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-gray-300">
                                            {p.total_innings}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-amber-400">
                                            {p.total_runs}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-emerald-400">
                                            {p.total_wickets}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {data.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No players found with the current filters
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
