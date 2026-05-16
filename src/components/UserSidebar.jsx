import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function UserSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const { t, lang, setLang } = useLang();

  const navLinks = [
    { to: '/', label: t('aiScanner'), icon: '🔬' },
    { to: '/my-impact', label: t('myImpact'), icon: '📊' },
    { to: '/profile', label: t('profile'), icon: '👤' },
    { to: '/leaderboard', label: t('leaderboard'), icon: '🏆' },
  ];

  const getProviderName = () => {
    if (!currentUser) return 'Unknown';
    const p = currentUser.loginProvider;
    if (p === 'google') return 'Google';
    if (p === 'email') return 'Email';
    if (p === 'github') return 'GitHub';
    if (p === 'demo') return 'Demo';
    return p || 'Email';
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card-dark/95 backdrop-blur-xl border-b border-white/10 flex justify-between items-center h-14 px-4 md:hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">♻️</span>
          <span className="font-display font-bold text-sm neon-text tracking-wider">PUNARNAVA</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
            {['en', 'hi', 'kn'].map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  lang === code ? 'bg-neon-green/20 text-neon-green' : 'text-gray-500'
                }`}
              >
                {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'ಕ'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => logout()}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card-dark/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center h-16 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === link.to ? 'text-neon-green' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Hamburger */}
      <AnimatePresence>
        {collapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setCollapsed(false)}
            className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-card-dark/80 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors shadow-lg hidden md:flex"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.nav
        initial={false}
        animate={{ width: collapsed ? 0 : 260, opacity: collapsed ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bottom-0 z-40 bg-card-dark/95 backdrop-blur-xl border-r border-white/5 flex-col overflow-hidden hidden md:flex"
      >
        <div className="p-4 flex flex-col h-full min-w-[260px] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">♻️</span>
              <span className="font-display font-bold text-lg neon-text tracking-wider">PUNARNAVA</span>
            </Link>
            <button onClick={() => setCollapsed(true)} className="p-1 rounded-lg hover:bg-white/10 text-text-secondary transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 flex-grow">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
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

          {/* Language Switcher */}
          <div className="mb-2 flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
            {['en', 'hi', 'kn'].map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  lang === code ? 'bg-neon-green/20 text-neon-green' : 'text-gray-500 hover:text-white'
                }`}
              >
                {code === 'en' ? 'EN' : code === 'hi' ? 'हि' : 'ಕ'}
              </button>
            ))}
          </div>

          {/* User Info + Logout */}
          <div className="pt-3 border-t border-white/5 flex flex-col gap-2 shrink-0 mt-auto">
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
                    Via {getProviderName()}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border border-danger-red/30 bg-danger-red/10 text-danger-red hover:bg-danger-red/20"
            >
              🚪 {t('logout')}
            </button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
