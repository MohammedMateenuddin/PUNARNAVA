import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AnimatedCounter from '../../components/AnimatedCounter';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const badgeTiers = [
  { name: 'Eco Starter', min: 0, next: 200, icon: '🌿', color: '#a29bfe' },
  { name: 'Eco Warrior', min: 200, next: 500, icon: '🛡️', color: '#00ff88' },
  { name: 'Green Guardian', min: 500, next: 1000, icon: '🌱', color: '#7bed9f' },
  { name: 'Circuit Sage', min: 1000, next: 2000, icon: '🧠', color: '#00d4ff' },
  { name: 'Urban Miner', min: 2000, next: 4000, icon: '⛏️', color: '#FFD700' },
  { name: 'Eco Legend', min: 4000, next: 100000, icon: '🏆', color: '#ff6b6b' },
];

export default function RecyclerProfile() {
  const { currentUser, logout } = useAuth();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (typeof date?.toDate === 'function') return date.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const stats = [
    { label: 'Devices Claimed', value: currentUser?.devicesRecycled || 87, icon: '📱', color: 'text-[#00cfff]' },
    { label: 'Value Recovered', value: `₹${(currentUser?.totalValue || 21750).toLocaleString()}`, icon: '💰', color: 'text-[#00e5a0]' },
    { label: 'CO₂ Diverted (kg)', value: (currentUser?.co2Saved || 245).toFixed(1), icon: '🌍', color: 'text-[#7bed9f]' },
    { label: 'Active Since', value: formatDate(currentUser?.createdAt || new Date()), icon: '📅', color: 'text-[#a29bfe]' },
  ];

  const planName = currentUser?.subscription?.plan || 'Trial Enterprise';
  const planExpiry = currentUser?.subscription?.expiresAt ? formatDate(currentUser.subscription.expiresAt) : formatDate(new Date(Date.now() + 14 * 86400000));

  const transactions = [
    { id: 't1', device: 'iPhone 13 Pro', value: 185, date: '22 Apr 2026', status: 'completed' },
    { id: 't2', device: 'HP Pavilion Laptop', value: 327, date: '21 Apr 2026', status: 'completed' },
    { id: 't3', device: 'Samsung Galaxy S21', value: 148, date: '20 Apr 2026', status: 'processing' },
    { id: 't4', device: 'Dell Monitor 24"', value: 88, date: '19 Apr 2026', status: 'completed' },
    { id: 't5', device: 'MacBook Air M1', value: 497, date: '18 Apr 2026', status: 'completed' },
  ];

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Hero */}
          <motion.div variants={fadeUp} className="glass-card p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden group" style={{ borderColor: 'rgba(0,207,255,0.15)' }}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl">🏭</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#00cfff] to-[#0088ff] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,207,255,0.3)]">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  (currentUser?.displayName || 'R').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-1">{currentUser?.displayName || 'Recycler'}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#00cfff]/10 text-[#00cfff] border border-[#00cfff]/20 uppercase tracking-wider">
                    🏭 Verified Recycler
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                    Active since {formatDate(currentUser?.createdAt || new Date())}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-5 text-center group hover:border-[#00cfff]/20 transition-all border-white/5">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-black ${stat.color} mb-1 tracking-tighter`}>{stat.value}</div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-text-secondary font-black opacity-60">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Subscription Info */}
            <motion.div variants={fadeUp} className="md:col-span-1">
              <div className="glass-card p-6" style={{ borderColor: 'rgba(0,207,255,0.1)' }}>
                <h3 className="font-display font-bold text-xs text-[#00cfff]/60 uppercase tracking-widest mb-6 flex items-center gap-2">💎 Current Plan</h3>
                <div className="text-center p-6 rounded-2xl bg-[#00cfff]/5 border border-[#00cfff]/10 mb-4">
                  <div className="text-5xl mb-3">💎</div>
                  <h4 className="text-xl font-black text-white mb-1">{planName}</h4>
                  <p className="text-xs text-[#00cfff]">Expires {planExpiry}</p>
                </div>
                <a href="/subscriptions" className="block w-full py-2.5 text-center rounded-xl bg-[#00cfff]/10 border border-[#00cfff]/20 text-[#00cfff] text-xs font-bold hover:bg-[#00cfff]/20 transition-all">
                  Manage Plan →
                </a>
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div variants={fadeUp} className="md:col-span-2">
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-xs text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">📋 Transaction History</h3>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#00cfff]/10 border border-[#00cfff]/10 flex items-center justify-center text-lg">
                          {tx.device.includes('Phone') || tx.device.includes('Galaxy') || tx.device.includes('iPhone') ? '📱' : tx.device.includes('Laptop') || tx.device.includes('MacBook') ? '💻' : '🖥️'}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{tx.device}</h4>
                          <p className="text-[10px] text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${tx.status === 'completed' ? 'bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                          {tx.status}
                        </span>
                        <span className="text-sm font-black text-[#00cfff]">₹{tx.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
