import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ScrapTicker from './components/ScrapTicker';
import ParticleBackground from './components/ParticleBackground';
import Landing from './pages/Landing';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    // If email user hasn't set a name yet, nudge them to profile
    if (currentUser && 
        currentUser.loginProvider === 'email' && 
        (!currentUser.displayName || currentUser.displayName === currentUser.email?.split('@')[0]) && 
        location.pathname !== '/profile' &&
        !localStorage.getItem('profileNudgeSkipped')) {
      navigate('/profile');
    }
  }, [currentUser, location.pathname, navigate]);

  if (!currentUser) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center relative">
        <ParticleBackground />
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient flex">
      <ParticleBackground />
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <motion.div 
        animate={{ marginLeft: sidebarCollapsed ? 0 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-grow min-w-0 flex flex-col relative z-10"
      >
        <ScrapTicker />
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageTransition} className="flex-grow">
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
