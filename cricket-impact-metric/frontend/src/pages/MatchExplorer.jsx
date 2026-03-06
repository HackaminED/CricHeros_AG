import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, getMatch } from '../api/api';
import { useGender } from '../context/GenderContext';

function ImpactBadge({ value, label }) {
    const color = value > 0 ? 'bg-emerald-500/20 text-emerald-400' : value < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400';
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${color}`}>
            {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(3) : value}
        </span>
    );
}

function CategoryBadge({ category }) {
    const colors = {
        'Match Winner': 'bg-indigo-500/20 text-indigo-300',
        'High Impact': 'bg-emerald-500/20 text-emerald-300',
        'Neutral': 'bg-amber-500/20 text-amber-300',
        'Low Impact': 'bg-orange-500/20 text-orange-300',
        'Poor Impact': 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[category] || 'bg-gray-500/20 text-gray-300'}`}>
            {category || '—'}
        </span>
    );
}

export default function MatchExplorer() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const { gender } = useGender();
    const [matches, setMatches] = useState([]);
    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (matchId) {
            loadMatch(matchId);
        } else {
            loadMatches(gender);
        }
    }, [matchId, gender]);

    const loadMatches = async (currentGender) => {
        setLoading(true);
        try {
            const data = await getMatches(100, null, currentGender);
            setMatches(data.matches || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMatch = async (id) => {
        setLoading(true);
        try {
            const data = await getMatch(id);
            setMatchData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Match list view
    if (!matchId) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">{gender}'s Match Explorer</h1>
                    <p className="text-gray-500 mt-1">Browse recent {gender.toLowerCase()}'s matches and see impact breakdowns</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {matches.length === 0 && (
                            <div className="glass rounded-xl p-8 text-center text-gray-500">
                                No matches found
                            </div>
                        )}
                        {matches.map((m) => (
                            <button
                                key={m.match_id}
                                onClick={() => navigate(`/matches/${m.match_id}`)}
                                className={`glass rounded-xl p-4 flex items-center justify-between transition-all duration-200 text-left
                                    ${gender === 'Women' ? 'hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5' : 'hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                                id={`match-${m.match_id}`}
                            >
                                <div>
                                    <p className="font-semibold text-gray-200">
                                        {m.teams?.join(' vs ') || `Match ${m.match_id}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{m.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Match ID</p>
                                    <p className={`text-sm font-mono ${gender === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400'}`}>{m.match_id}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Match detail view
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/matches')}
                    className="glass rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white
            hover:border-indigo-500/30 transition-all"
                >
                    ← Back
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Match {matchId}</h1>
                    {matchData && <p className="text-sm text-gray-500">{matchData.date}</p>}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : matchData ? (
                <div className="space-y-6">
                    {Object.entries(matchData.teams || {}).map(([team, players]) => (
                        <div key={team} className="glass rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700/30">
                                <h3 className={`text-lg font-semibold ${gender === 'Women' ? 'text-fuchsia-300' : 'text-indigo-300'}`}>{team}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left">Player</th>
                                            <th className="px-3 py-3 text-center">Runs</th>
                                            <th className="px-3 py-3 text-center">Wkts</th>
                                            <th className="px-3 py-3 text-center">Bat Perf</th>
                                            <th className="px-3 py-3 text-center">Bowl Perf</th>
                                            <th className="px-3 py-3 text-center">Context</th>
                                            <th className="px-3 py-3 text-center">Pressure</th>
                                            <th className="px-3 py-3 text-center">Raw IM</th>
                                            <th className="px-3 py-3 text-center">IM Score</th>
                                            <th className="px-3 py-3 text-center">Category</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.sort((a, b) => (b.raw_impact || 0) - (a.raw_impact || 0)).map((p) => (
                                            <tr
                                                key={p.player}
                                                className={`border-t border-gray-800/50 transition-colors cursor-pointer 
                                                    ${gender === 'Women' ? 'hover:bg-fuchsia-500/5' : 'hover:bg-indigo-500/5'}`}
                                                onClick={() => navigate(`/player?player=${encodeURIComponent(p.player)}`)}
                                            >
                                                <td className="px-6 py-3 font-medium text-gray-200">
                                                    {p.player} <span className="opacity-50 text-xs ml-1">{gender === 'Women' ? '♀' : '♂'}</span>
                                                </td>
                                                <td className="px-3 py-3 text-center text-amber-400 font-mono">{p.runs_scored}</td>
                                                <td className="px-3 py-3 text-center text-emerald-400 font-mono">{p.wickets_taken}</td>
                                                <td className="px-3 py-3 text-center font-mono text-gray-300">{p.batting_performance}</td>
                                                <td className="px-3 py-3 text-center font-mono text-gray-300">{p.bowling_performance}</td>
                                                <td className="px-3 py-3 text-center font-mono text-amber-400">{p.context_weight}×</td>
                                                <td className="px-3 py-3 text-center font-mono text-red-400">{p.pressure_index}×</td>
                                                <td className="px-3 py-3 text-center font-mono text-gray-300">{p.raw_impact}</td>
                                                <td className={`px-3 py-3 text-center font-mono font-bold ${gender === 'Women' ? 'text-fuchsia-400' : 'text-indigo-400'}`}>
                                                    {p.impact_normalized?.toFixed(1)}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <CategoryBadge category={p.category} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass rounded-xl p-8 text-center text-gray-500">
                    Match not found
                </div>
            )}
        </div>
    );
}
