import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, collection, query, orderBy, limit, onSnapshot } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { badges as badgeList } from '../data/mockData';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function rankClass(rank) {
  if (rank === 1) return 'rank-gold border-neon-green/40 shadow-[0_0_30px_rgba(0,255,136,0.1)]';
  if (rank === 2) return 'rank-silver border-electric-blue/40';
  if (rank === 3) return 'rank-bronze border-warning-orange/40';
  return 'border-white/5';
}

function rankIcon(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

const PodiumItem = ({ user, rank, delay }) => {
  const isWinner = rank === 1;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      className={`flex flex-col items-center ${isWinner ? 'order-2 -mt-8' : rank === 2 ? 'order-1 mt-4' : 'order-3 mt-8'}`}
    >
      <div className={`relative mb-4 ${isWinner ? 'w-24 h-24' : 'w-20 h-20'}`}>
        <div className={`w-full h-full rounded-full border-4 ${rank === 1 ? 'border-neon-green p-1' : rank === 2 ? 'border-electric-blue p-1' : 'border-warning-orange p-1'}`}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-card-dark flex items-center justify-center text-2xl font-bold text-white">
              {(user.displayName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-card-dark border-2 border-white/10 flex items-center justify-center text-xl shadow-lg">
          {rankIcon(rank)}
        </div>
      </div>
      <h3 className={`font-bold text-center truncate w-32 ${isWinner ? 'text-lg text-white' : 'text-sm text-text-primary'}`}>
        {user.displayName || 'User'}
      </h3>
      <p className="text-neon-green font-mono font-bold text-sm">{(user.totalPoints || 0).toLocaleString()} pts</p>
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-text-secondary border border-white/10 mt-1 uppercase">
        {user.badge || 'Eco Starter'}
      </span>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'users'),
      orderBy('totalPoints', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc, i) => ({
        id: doc.id,
        rank: i + 1,
        ...doc.data()
      }));
      setTopUsers(users);
      setTotalCount(snapshot.size); // This is just the size of top 50, but we'll show it as a baseline
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const podiumUsers = topUsers.slice(0, 3);
  const remainingUsers = topUsers.slice(3);
  const userInTop50 = topUsers.find(u => u.id === currentUser?.uid);

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h1 className="font-display text-4xl sm:text-5xl font-black neon-text mb-4 tracking-tighter">GLOBAL RECYCLING ARENA</h1>
            <p className="text-text-secondary max-w-xl mx-auto">Competition fuels sustainability. Track the world's most dedicated eco-warriors.</p>
            {currentUser?.globalRank && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 inline-block px-6 py-2 rounded-full bg-neon-green/10 border border-neon-green/20">
                 <p className="text-sm font-bold text-white">Your Rank: <span className="text-neon-green">#{currentUser.globalRank}</span> out of thousands</p>
              </motion.div>
            )}
          </motion.div>

          {/* Podium */}
          {!loading && podiumUsers.length > 0 && (
            <div className="flex flex-wrap justify-center items-end gap-8 md:gap-16 mb-20 px-4">
              {podiumUsers.map((user, i) => (
                <PodiumItem key={user.id} user={user} rank={user.rank} delay={i * 0.2} />
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Leaderboard Table */}
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <div className="space-y-3">
                {remainingUsers.map((user, i) => {
                  const isCurrentUser = user.id === currentUser?.uid;
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-card p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-all group ${rankClass(user.rank)} ${isCurrentUser ? 'border-l-4 border-l-neon-green bg-neon-green/5' : ''}`}
                    >
                      <div className="flex-shrink-0 w-10 text-center font-display font-black text-sm text-text-secondary">
                        {rankIcon(user.rank)}
                      </div>
                      
                      <div className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded-full bg-card-dark border border-white/10 flex items-center justify-center font-bold text-xs">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (user.displayName || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        {isCurrentUser && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-card-dark" />
                        )}
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-text-primary truncate text-sm">
                            {user.displayName || 'Anonymous'}
                          </h3>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded bg-neon-green text-deep-dark text-[8px] font-black uppercase tracking-tighter">YOU</span>
                          )}
                        </div>
                        <div className="flex gap-4 text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                          <span className="flex items-center gap-1">📱 {user.devicesRecycled || 0}</span>
                          <span className="flex items-center gap-1">🌍 {user.co2Saved || 0}kg</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="font-display font-black text-base text-neon-green">{(user.totalPoints || 0).toLocaleString()}</div>
                        <div className="text-[9px] text-text-secondary uppercase font-bold tracking-tighter">points</div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Append Current User if not in Top 50 */}
                {!loading && currentUser && !userInTop50 && (
                  <>
                    <div className="flex justify-center py-4">
                       <span className="text-text-secondary">•••</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-neon-green bg-neon-green/5 rank-user shadow-[0_0_20px_rgba(0,255,136,0.1)]"
                    >
                      <div className="flex-shrink-0 w-10 text-center font-display font-black text-sm text-text-secondary">
                        #{currentUser.globalRank || '?'}
                      </div>
                      <div className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded-full bg-card-dark border border-white/10 flex items-center justify-center font-bold text-xs">
                          {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (currentUser.displayName || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-card-dark" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-text-primary truncate text-sm">{currentUser.displayName}</h3>
                          <span className="px-1.5 py-0.5 rounded bg-neon-green text-deep-dark text-[8px] font-black uppercase tracking-tighter">YOU</span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                          <span>📱 {currentUser.devicesRecycled || 0}</span>
                          <span>🌍 {currentUser.co2Saved || 0}kg</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-display font-black text-base text-neon-green">{(currentUser.totalPoints || 0).toLocaleString()}</div>
                        <div className="text-[9px] text-text-secondary uppercase font-bold tracking-tighter">points</div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Sidebar Column */}
            <motion.div variants={fadeUp} className="space-y-8">
              {/* Achievement Badges Guide */}
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
                  <span>🎖️</span> Achievement Tiers
                </h3>
                <div className="space-y-4">
                   {[
                     { name: 'Eco Legend', points: '4000+', icon: '🏆', color: '#ff6b6b' },
                     { name: 'Urban Miner', points: '2000+', icon: '⛏️', color: '#FFD700' },
                     { name: 'Circuit Sage', points: '1000+', icon: '🧠', color: '#00d4ff' },
                     { name: 'Green Guardian', points: '500+', icon: '🌱', color: '#7bed9f' },
                     { name: 'Eco Warrior', points: '200+', icon: '🛡️', color: '#00ff88' },
                     { name: 'Eco Starter', points: '0+', icon: '🌿', color: '#a29bfe' },
                   ].map((badge, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-3">
                           <span className="text-xl">{badge.icon}</span>
                           <div>
                              <p className="text-xs font-bold text-white">{badge.name}</p>
                              <p className="text-[10px] text-text-secondary">{badge.points} points</p>
                           </div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
                     </div>
                   ))}
                </div>
              </div>

              {/* Weekly Highlights */}
              <div className="glass-card p-6 bg-gradient-to-br from-electric-blue/10 to-transparent">
                 <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                   <span>⚡</span> Week's Top Saver
                 </h3>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-electric-blue flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                      💎
                    </div>
                    <div>
                       <h4 className="font-bold text-white text-sm">Rahul Verma</h4>
                       <p className="text-[10px] text-electric-blue font-bold uppercase tracking-widest">Saved 42kg CO₂ this week</p>
                    </div>
                 </div>
                 <p className="text-xs text-text-secondary leading-relaxed">Rahul has recycled 5 large appliances this week, offsetting the same amount of carbon as 2 fully grown trees.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
