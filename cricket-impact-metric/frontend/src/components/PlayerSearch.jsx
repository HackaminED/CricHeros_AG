import React, { useState, useEffect, useRef } from 'react';
import { getPlayers } from '../api/api';

export default function PlayerSearch({ onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await getPlayers(query, 8);
                setResults(data.players || []);
                setIsOpen(true);
                setSelectedIndex(-1);
            } catch (err) {
                console.error('Search failed:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer.current);
    }, [query]);

    const handleKeyDown = (e) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleSelect = (player) => {
        setQuery(player.player);
        setIsOpen(false);
        onSelect?.(player);
    };

    const getScoreColor = (score) => {
        if (score >= 75) return 'text-indigo-400';
        if (score >= 60) return 'text-emerald-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder="Search players..."
                    className="w-full pl-10 pr-4 py-3 bg-surface-800 border border-gray-700/50 rounded-xl
            text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50
            focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    id="player-search-input"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50">
                    {results.map((player, idx) => (
                        <button
                            key={player.player}
                            onClick={() => handleSelect(player)}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left
                hover:bg-indigo-500/10 transition-colors duration-150
                ${idx === selectedIndex ? 'bg-indigo-500/15' : ''}
                ${idx > 0 ? 'border-t border-gray-700/30' : ''}`}
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-200">{player.player}</p>
                                <p className="text-xs text-gray-500">{player.team}</p>
                            </div>
                            <span className={`font-mono font-semibold text-sm ${getScoreColor(player.impact_score)}`}>
                                {player.impact_score?.toFixed(1)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
