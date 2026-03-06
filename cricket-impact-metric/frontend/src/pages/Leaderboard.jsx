import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getStats } from '../api/api';

export default function Leaderboard() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [stats, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [sortKey, setSortKey] = useState('impact_score');
    const [sortAsc, setSortAsc] = useState(false);

    useEffect(() => {
        loadData();
    }, [role]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [lb, st] = await Promise.all([
                getLeaderboard(50, role),
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

    const sorted = [...data].sort((a, b) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        return sortAsc ? av - bv : bv - av;
    });

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(false);
        }
    };

    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <span className="text-gray-600 ml-1">↕</span>;
        return <span className="text-indigo-400 ml-1">{sortAsc ? '↑' : '↓'}</span>;
    };

    const getScoreBg = (score) => {
        if (score >= 75) return 'from-indigo-500/20 to-transparent';
        if (score >= 60) return 'from-emerald-500/15 to-transparent';
        if (score >= 40) return 'from-amber-500/10 to-transparent';
        return 'from-red-500/10 to-transparent';
    };

    const getScoreColor = (score) => {
        if (score >= 75) return 'text-indigo-400';
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
                    <p className="text-gray-500 mt-1">Top players ranked by Impact Metric</p>
                </div>
                {/* Role filter */}
                <div className="flex gap-2">
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
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                    : 'glass text-gray-400 hover:text-white hover:border-indigo-500/30'}`}
                            id={`filter-${r.key || 'all'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Global stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold font-mono text-indigo-400">{stats.total_players}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Players</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold font-mono text-emerald-400">{stats.total_matches}</p>
                        <p className="text-xs text-gray-500 mt-1">Matches Analyzed</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold font-mono text-amber-400">{stats.average_impact?.toFixed(1)}</p>
                        <p className="text-xs text-gray-500 mt-1">Average Impact</p>
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
                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-gray-300"
                                        onClick={() => handleSort('impact_score')}>
                                        IM Score <SortIcon col="impact_score" />
                                    </th>
                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-gray-300"
                                        onClick={() => handleSort('batting_impact')}>
                                        Batting <SortIcon col="batting_impact" />
                                    </th>
                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-gray-300"
                                        onClick={() => handleSort('bowling_impact')}>
                                        Bowling <SortIcon col="bowling_impact" />
                                    </th>
                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-gray-300"
                                        onClick={() => handleSort('runs_scored')}>
                                        Runs <SortIcon col="runs_scored" />
                                    </th>
                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-gray-300"
                                        onClick={() => handleSort('wickets_taken')}>
                                        Wickets <SortIcon col="wickets_taken" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((p, idx) => (
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
                                            {p.player}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {p.team}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-mono font-bold text-base ${getScoreColor(p.impact_score)}`}>
                                                {p.impact_score?.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-gray-300">
                                            {p.batting_impact?.toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-gray-300">
                                            {p.bowling_impact?.toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-amber-400">
                                            {p.runs_scored}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-emerald-400">
                                            {p.wickets_taken}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
