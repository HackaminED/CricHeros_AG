import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GenderProvider } from './context/GenderContext';
import { ThemeProvider } from './context/ThemeContext';
import PlayerDashboard from './pages/PlayerDashboard';
import MatchExplorer from './pages/MatchExplorer';
import Leaderboard from './pages/Leaderboard';
import LandingPage from './pages/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';

function AppContent() {
  return (
    <>
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 md:py-10">
          <Routes>
            <Route path="/player" element={<PlayerDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/matches" element={<MatchExplorer />} />
            <Route path="/matches/:matchId" element={<MatchExplorer />} />
            <Route path="*" element={<Navigate to="/leaderboard" replace />} />
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
        <Routes>
          {/* Landing page lives completely outside the dashboard wrapper */}
          <Route path="/" element={<LandingPage />} />
          
          {/* All dashboard routes: sidebar + main with premium canvas */}
          <Route path="/*" element={
            <div
              className={`dashboard-canvas flex min-h-screen transition-opacity duration-500 ${appLoaded ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}
              style={{ background: 'var(--bg)' }}
            >
              <Sidebar open={sidebarOpen} onCollapse={() => setSidebarOpen(!sidebarOpen)} />
              <div className="flex-1 flex flex-col min-w-0 relative z-10" style={{ marginLeft: '280px' }}>
                <AppContent />
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </GenderProvider>
    </ThemeProvider>
  );
}
