import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Shared components
import ParticleBackground from './components/ParticleBackground';
import ScrapTicker from './components/ScrapTicker';

// Sidebars
import UserSidebar from './components/UserSidebar';
import RecyclerSidebar from './components/RecyclerSidebar';

// Login
import Login from './pages/Login';

// User pages
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// Recycler pages
import Market from './pages/recycler/Market';
import Intake from './pages/recycler/Intake';
import Subscriptions from './pages/recycler/Subscriptions';
import RecyclerProfile from './pages/recycler/RecyclerProfile';
import Analytics from './pages/recycler/Analytics';

import NotFound from './pages/NotFound';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// ═══════════════════════════════════════════════════
// USER APP — green eco theme
// ═══════════════════════════════════════════════════
function UserApp() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen mesh-gradient flex">
      <ParticleBackground />
      <UserSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 0 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-grow min-w-0 flex flex-col relative z-10 pb-20 md:pb-0 pt-14 md:pt-0 max-md:!ml-0"
      >
        <ScrapTicker />
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageTransition} className="flex-grow">
            <Routes location={location}>
              <Route path="/" element={<Scanner />} />
              <Route path="/scanner" element={<Navigate to="/" />} />
              <Route path="/my-impact" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/my-impact" />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// RECYCLER APP — cyan industrial theme
// ═══════════════════════════════════════════════════
function RecyclerApp() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen mesh-gradient flex">
      <ParticleBackground />
      <RecyclerSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 0 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-grow min-w-0 flex flex-col relative z-10 pb-20 md:pb-0 pt-14 md:pt-0 max-md:!ml-0"
      >
        <ScrapTicker />
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageTransition} className="flex-grow">
            <Routes location={location}>
              <Route path="/" element={<Market />} />
              <Route path="/market" element={<Navigate to="/" />} />
              <Route path="/intake" element={<Intake />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/recycler-profile" element={<RecyclerProfile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP — hard split based on role
// ═══════════════════════════════════════════════════
export default function App() {
  const { currentUser, role } = useAuth();

  // Not logged in → show login
  if (!currentUser || !role) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center relative">
        <ParticleBackground />
        <Login />
      </div>
    );
  }

  // Hard split — no toggle possible
  if (role === 'recycler') return <RecyclerApp />;
  return <UserApp />;
}
