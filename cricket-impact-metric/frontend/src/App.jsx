import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import PlayerDashboard from './pages/PlayerDashboard';
import MatchExplorer from './pages/MatchExplorer';
import Leaderboard from './pages/Leaderboard';

function NavItem({ to, children, icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
                    ? 'bg-indigo-500/15 text-indigo-400 shadow-lg shadow-indigo-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`
            }
        >
            <span className="text-lg">{icon}</span>
            <span className="hidden md:inline">{children}</span>
        </NavLink>
    );
}

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <Router>
            <div className="flex min-h-screen bg-surface-950">
                {/* Sidebar */}
                <aside className={`fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col
          bg-surface-900/95 backdrop-blur-xl border-r border-gray-800/50
          transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>

                    {/* Logo */}
                    <div className="px-5 py-6 border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500
                flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                                IM
                            </div>
                            {sidebarOpen && (
                                <div className="hidden md:block">
                                    <p className="font-bold text-white text-sm">Cricket Impact</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Metric</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        <NavItem to="/player" icon="👤">Player Dashboard</NavItem>
                        <NavItem to="/leaderboard" icon="🏆">Leaderboard</NavItem>
                        <NavItem to="/matches" icon="🏏">Match Explorer</NavItem>
                    </nav>

                    {/* Toggle */}
                    <div className="px-3 py-4 border-t border-gray-800/50">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full flex items-center justify-center py-2 rounded-lg
                text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                        >
                            {sidebarOpen ? '←' : '→'}
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className={`flex-1 min-h-screen transition-all duration-300
          ${sidebarOpen ? 'md:ml-0' : 'md:ml-0'}`}>
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                        <Routes>
                            <Route path="/" element={<Navigate to="/leaderboard" replace />} />
                            <Route path="/player" element={<PlayerDashboard />} />
                            <Route path="/leaderboard" element={<Leaderboard />} />
                            <Route path="/matches" element={<MatchExplorer />} />
                            <Route path="/matches/:matchId" element={<MatchExplorer />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}
