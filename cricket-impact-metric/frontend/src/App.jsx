import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GenderProvider } from './context/GenderContext';
import { ThemeProvider } from './context/ThemeContext';
import PlayerDashboard from './pages/PlayerDashboard';
import MatchExplorer from './pages/MatchExplorer';
import Leaderboard from './pages/Leaderboard';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function AppContent() {
  const navigate = useNavigate();
  const handlePlayerSelect = (player) => {
    if (player?.player) navigate(`/player?player=${encodeURIComponent(player.player)}`);
  };
  return (
    <>
      <Topbar onPlayerSelect={handlePlayerSelect} />
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8" style={{ '--grid-gap': '24px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/leaderboard" replace />} />
            <Route path="/player" element={<PlayerDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/matches" element={<MatchExplorer />} />
            <Route path="/matches/:matchId" element={<MatchExplorer />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appLoaded, setAppLoaded] = useState(false);

  return (
    <ThemeProvider>
    <GenderProvider>
      {!appLoaded && <LoadingScreen onComplete={() => setAppLoaded(true)} />}
      <Router>
        <div
          className={`flex min-h-screen transition-opacity duration-500 ${appLoaded ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}
          style={{ background: 'var(--bg)' }}
        >
          <Sidebar open={sidebarOpen} onCollapse={() => setSidebarOpen(!sidebarOpen)} />

          <div className="flex-1 flex flex-col min-w-0">
            <AppContent />
          </div>
        </div>
      </Router>
    </GenderProvider>
    </ThemeProvider>
  );
}
