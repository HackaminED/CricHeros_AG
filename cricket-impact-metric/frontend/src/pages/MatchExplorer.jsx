import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, getMatch } from '../api/api';

function ImpactBadge({ value }) {
    const color = value > 0 ? 'bg-emerald-500/20 text-emerald-400' : value < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400';
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${color}`}>
            {value > 0 ? '+' : ''}{value?.toFixed(3)}
        </span>
    );
}

export default function MatchExplorer() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (matchId) {
            loadMatch(matchId);
        } else {
            loadMatches();
        }
    }, [matchId]);

    const loadMatches = async () => {
        setLoading(true);
        try {
            const data = await getMatches(100);
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
                    <h1 className="text-3xl font-bold gradient-text">Match Explorer</h1>
                    <p className="text-gray-500 mt-1">Browse matches and see player impact breakdowns</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {matches.map((m) => (
                            <button
                                key={m.match_id}
                                onClick={() => navigate(`/matches/${m.match_id}`)}
                                className="glass rounded-xl p-4 flex items-center justify-between
                  hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 text-left"
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
                                    <p className="text-sm font-mono text-indigo-400">{m.match_id}</p>
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
                                <h3 className="text-lg font-semibold text-indigo-300">{team}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left">Player</th>
                                            <th className="px-4 py-3 text-center">Batting</th>
                                            <th className="px-4 py-3 text-center">Bowling</th>
                                            <th className="px-4 py-3 text-center">Total Impact</th>
                                            <th className="px-4 py-3 text-center">Runs</th>
                                            <th className="px-4 py-3 text-center">Wickets</th>
                                            <th className="px-4 py-3 text-center">IM Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.sort((a, b) => (b.match_impact || 0) - (a.match_impact || 0)).map((p, idx) => (
                                            <tr
                                                key={p.player}
                                                className={`border-t border-gray-800/50 hover:bg-indigo-500/5 transition-colors cursor-pointer`}
                                                onClick={() => navigate(`/player?player=${encodeURIComponent(p.player)}`)}
                                            >
                                                <td className="px-6 py-3 font-medium text-gray-200">{p.player}</td>
                                                <td className="px-4 py-3 text-center"><ImpactBadge value={p.batting_impact} /></td>
                                                <td className="px-4 py-3 text-center"><ImpactBadge value={p.bowling_impact} /></td>
                                                <td className="px-4 py-3 text-center"><ImpactBadge value={p.match_impact} /></td>
                                                <td className="px-4 py-3 text-center text-amber-400 font-mono">{p.runs_scored}</td>
                                                <td className="px-4 py-3 text-center text-emerald-400 font-mono">{p.wickets_taken}</td>
                                                <td className="px-4 py-3 text-center font-mono text-indigo-400">{p.impact_score?.toFixed(1)}</td>
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
