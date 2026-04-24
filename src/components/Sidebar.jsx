import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const userLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/scanner', label: 'AI Scanner', icon: '🔬' },
  { to: '/dashboard', label: 'My Impact', icon: '📊' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

const recyclerLinks = [
  { to: '/', label: 'Market Overview', icon: '📈' },
  { to: '/scanner', label: 'AI Intake System', icon: '🔬' },
  { to: '/dashboard', label: 'Global Analytics', icon: '🌍' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { mode, setMode, demoMode, setDemoMode } = useApp();
  const { logout, currentUser } = useAuth();

  const getProviderName = () => {
    if (!currentUser) return 'Unknown';
    if (currentUser.loginProvider === 'google') return 'Google';
    if (currentUser.loginProvider === 'email') return 'Email';
    if (currentUser.loginProvider === 'github') return 'GitHub';
    return currentUser.loginProvider || 'Email';
  };

  return (
    <>
      {/* Floating Hamburger Button (visible when sidebar is collapsed) */}
      <AnimatePresence>
        {collapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setCollapsed(false)}
            className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-card-dark/80 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors shadow-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.nav
        initial={false}
        animate={{ 
          width: collapsed ? 0 : 260,
          opacity: collapsed ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bottom-0 z-40 bg-card-dark/95 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden"
      >
        <div className="p-6 flex flex-col h-full min-w-[260px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">♻️</span>
              <span className="font-display font-bold text-lg neon-text tracking-wider">
                PUNARNAVA
              </span>
            </Link>
            <button 
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-text-secondary transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2 flex-grow">
            {(mode === 'user' ? userLinks : recyclerLinks).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                  location.pathname === link.to
                    ? 'text-neon-green bg-neon-green/10 border border-neon-green/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom Controls */}
          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
            {currentUser && (
              <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-green to-electric-blue flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-text-secondary capitalize truncate">
                    via {getProviderName()}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border border-danger-red/30 bg-danger-red/10 text-danger-red hover:bg-danger-red/20"
            >
              🚪 Logout
            </button>


          </div>
        </div>
      </motion.nav>
    </>
  );
}
