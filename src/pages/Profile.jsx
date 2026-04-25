import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, orderBy, limit, onSnapshot } from '../firebase';
import { badges as badgeList } from '../data/mockData';
import AnimatedCounter from '../components/AnimatedCounter';
import { useLang } from '../context/LanguageContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const badgeTiers = [
  { name: "Eco Starter", min: 0, next: 200, icon: "🌿", color: "#a29bfe" },
  { name: "Eco Warrior", min: 200, next: 500, icon: "🛡️", color: "#00ff88" },
  { name: "Green Guardian", min: 500, next: 1000, icon: "🌱", color: "#7bed9f" },
  { name: "Circuit Sage", min: 1000, next: 2000, icon: "🧠", color: "#00d4ff" },
  { name: "Urban Miner", min: 2000, next: 4000, icon: "⛏️", color: "#FFD700" },
  { name: "Eco Legend", min: 4000, next: 100000, icon: "🏆", color: "#ff6b6b" }
];

export default function Profile() {
  const { t } = useLang();
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (currentUser?.displayName) {
      setNewName(currentUser.displayName);
    }
  }, [currentUser]);

  // Real-time listener for recent activity
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    if (!db) {
      // Mock submissions for demo environment
      if (currentUser.devicesRecycled > 0) {
        setSubmissions([{
          id: 'mock-sub-1',
          name: '45W Fast Charger',
          type: 'Charger',
          points: 125,
          co2Saved: 0.8,
          createdAt: new Date()
        }]);
      }
      return;
    }

    const q = query(
      collection(db, 'users', currentUser.uid, 'submissions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(docs);
    }, (err) => {
      console.warn("Submissions listener error:", err);
    });

    return unsubscribe;
  }, [currentUser?.uid, currentUser?.devicesRecycled]);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === currentUser.displayName) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile(newName.trim());
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update name");
    }
    setLoading(false);
  };

  const currentTier = badgeTiers.find(t => (currentUser?.totalPoints || 0) < t.next) || badgeTiers[badgeTiers.length - 1];
  const progress = Math.min((((currentUser?.totalPoints || 0) - currentTier.min) / (currentTier.next - currentTier.min)) * 100, 100) || 0;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          
          {/* Hero Section */}
          <motion.div variants={fadeUp} className="glass-card p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl">👤</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-neon-green/30 p-1 bg-gradient-to-tr from-neon-green to-electric-blue">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-full object-cover shadow-2xl" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-card-dark flex items-center justify-center text-4xl font-black text-white shadow-inner">
                      {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-neon-green text-deep-dark w-8 h-8 rounded-full shadow-lg border-4 border-card-dark flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                  ✏️
                </div>
              </div>

              <div className="text-center md:text-left flex-grow">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div key="edit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2">
                        <input 
                          autoFocus
                          value={newName} 
                          onChange={e => setNewName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateName()}
                          className="bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-2xl font-black text-white focus:outline-none focus:border-neon-green"
                        />
                        <button onClick={handleUpdateName} disabled={loading} className="text-neon-green text-xl">{loading ? '...' : '✅'}</button>
                      </motion.div>
                    ) : (
                      <motion.h1 key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl sm:text-3xl font-black text-white flex items-center gap-3">
                        {currentUser?.displayName || currentUser?.email?.split('@')[0]}
                        <button onClick={() => setIsEditing(true)} className="text-sm opacity-50 hover:opacity-100 transition-opacity">✏️</button>
                      </motion.h1>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-text-secondary text-sm mb-4 font-medium tracking-wide uppercase opacity-70">{currentUser?.email}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-neon-green/10 text-neon-green border border-neon-green/20 uppercase tracking-[0.2em]">
                    {currentUser?.role || 'User'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/5 text-text-secondary border border-white/10 uppercase tracking-[0.2em]">
                    via {currentUser?.loginProvider}
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                    {t('memberSince')} {formatDate(currentUser?.createdAt || new Date())}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Live Stats Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: t('totalPoints'), value: currentUser?.totalPoints || 0, icon: '⭐', color: 'text-neon-green' },
              { label: t('devicesRecycled'), value: currentUser?.devicesRecycled || 0, icon: '📱', color: 'text-electric-blue' },
              { label: t('co2Prevented'), value: (currentUser?.co2Saved || 0).toFixed(1), icon: '🌍', color: 'text-safe-green' },
              { label: 'Global Rank', value: currentUser?.globalRank ? `#${currentUser.globalRank}` : 'N/A', icon: '🏅', color: 'text-warning-orange' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 text-center group hover:border-white/20 transition-all border-white/5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-black ${stat.color} mb-1 tracking-tighter`}>
                  {typeof stat.value === 'number' || !isNaN(Number(stat.value)) ? (
                    <AnimatedCounter counterId={`profile-stat-${i}`} end={Number(stat.value)} />
                  ) : stat.value}
                </div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-text-secondary font-black opacity-60">{stat.label}</p>
                {i === 3 && currentUser?.globalRank && (
                   <p className="text-[9px] text-safe-green font-bold mt-1">▲ +3 positions this week</p>
                )}
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Badges & Achievements */}
            <motion.div variants={fadeUp} className="md:col-span-1 space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-xs text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">🎖️ Rank Progression</h3>
                <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
                   <div className="text-6xl mb-4 drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">{currentTier.icon}</div>
                   <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{currentUser?.badge || 'Eco Starter'}</h4>
                   <p className="text-xs font-bold text-neon-green">Points: {(currentUser?.totalPoints || 0).toLocaleString()}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-text-secondary">Progress to {badgeTiers.find(t => t.min === currentTier.next)?.name || 'Legend'}</span>
                    <span className="text-neon-green">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progress}%` }} 
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-neon-green via-electric-blue to-neon-green bg-[length:200%_100%] rounded-full" 
                    />
                  </div>
                  <p className="text-[10px] text-text-secondary text-center font-bold">
                    {currentTier.next !== 100000 ? `${(currentTier.next - (currentUser?.totalPoints || 0)).toLocaleString()} points to next level` : 'Ultimate Level reached!'}
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-xs text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">🔓 {t('unlockedBadges')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {badgeTiers.map((badge, i) => {
                    const isUnlocked = (currentUser?.totalPoints || 0) >= badge.min;
                    return (
                      <div key={i} className={`p-3 rounded-xl border text-center transition-all ${isUnlocked ? 'bg-white/5 border-white/10' : 'bg-white/[0.01] border-white/5 opacity-20 grayscale'}`}>
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <p className="text-[8px] font-black uppercase truncate leading-tight" style={{ color: isUnlocked ? badge.color : 'inherit' }}>{badge.name.split(' ')[1] || badge.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity Feed */}
            <motion.div variants={fadeUp} className="md:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-xs text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">📋 Live Intake Log</h3>
                <div className="space-y-4">
                  {submissions.length > 0 ? (
                    submissions.map((sub, i) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-card-dark border border-white/5 flex items-center justify-center text-2xl shadow-inner">
                             {sub.type === 'Smartphone' ? '📱' : sub.type === 'Laptop' ? '💻' : '🔌'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm tracking-tight">{sub.name}</h4>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{formatDate(sub.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-neon-green">+{sub.points} PTS</div>
                          <div className="text-[10px] font-bold text-electric-blue uppercase tracking-tighter">{sub.co2Saved} kg CO₂</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-6 opacity-10">🔬</div>
                      <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">Awaiting first scan...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card p-6 border-red-500/10 bg-red-500/[0.02]">
                <h3 className="font-display font-bold text-xs text-red-400 mb-6 flex items-center gap-2 uppercase tracking-widest">⚠️ {t('accountSettings')}</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setIsEditing(true)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    {t('editProfile')}
                  </button>
                  <button onClick={() => logout()} className="flex-1 py-4 rounded-2xl bg-danger-red/10 border border-danger-red/30 text-danger-red text-xs font-black uppercase tracking-widest hover:bg-danger-red/20 transition-all">
                    {t('signOut')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
