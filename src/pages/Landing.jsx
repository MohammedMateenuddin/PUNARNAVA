import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AnimatedCounter from '../components/AnimatedCounter';
import ParticleBackground from '../components/ParticleBackground';

const features = [
  { icon: '🔬', title: 'AI Device Scanner', desc: 'Upload any e-waste image and get instant material analysis powered by AI', to: '/scanner' },
  { icon: '📊', title: 'Carbon Dashboard', desc: 'Track your environmental impact with real-time CO₂ savings metrics', to: '/dashboard' },
  { icon: '🗺️', title: 'Recycler Map', desc: 'Find certified e-waste recyclers near you with live scrap rates', to: '/scanner' },
  { icon: '🏆', title: 'Gamification', desc: 'Earn badges, climb leaderboards, and compete as an eco warrior', to: '/leaderboard' },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };

export default function Landing() {
  const { globalStats } = useApp();
  const { currentUser, role } = useAuth();
  
  const dashboardPath = role === 'recycler' ? '/market' : '/scanner/my-impact';
  const scannerPath = role === 'recycler' ? '/market/intake' : '/scanner';

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      <ParticleBackground />
      
      {/* Dynamic Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-7xl mx-auto px-4 pt-20 sm:pt-32 text-center relative z-10"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
            </span>
            Neural-Network Driven Material Recovery
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-display text-6xl sm:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.85]"
        >
          <span className="text-white">PUNAR</span><span className="neon-text">NAVA</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-lg sm:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
          The next evolution of <span className="text-white underline decoration-neon-green/50 underline-offset-4">E-Waste Intelligence</span>. 
          Identify materials, track carbon impact, and unlock circular value in real-time.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mb-24">
          <Link to={currentUser ? scannerPath : "/login"} className="group relative px-10 py-5 bg-neon-green text-deep-dark font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(0,255,136,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
            <span className="relative flex items-center gap-3">
              🔬 {currentUser ? (role === 'recycler' ? 'Enter Intake Terminal' : 'Launch AI Scanner') : 'Initialize Platform'}
            </span>
          </Link>
          <Link to={currentUser ? dashboardPath : "/login"} className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all">
            📊 {currentUser ? 'View Impact Matrix' : 'Explore ecosystem'}
          </Link>
        </motion.div>

        {/* User-Specific Quick Look */}
        {currentUser && (
           <motion.div variants={fadeUp} className="max-w-4xl mx-auto mb-24 p-1 rounded-[2.5rem] bg-gradient-to-br from-neon-green/30 via-electric-blue/30 to-purple-500/30">
              <div className="bg-card-dark/90 backdrop-blur-2xl rounded-[2.3rem] p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="text-left">
                    <p className="text-neon-green text-xs font-black uppercase tracking-[0.3em] mb-2">Welcome back, {role}</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4">
                      {currentUser.displayName || 'Eco Hero'}
                    </h2>
                    <div className="flex items-center gap-4">
                       <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black uppercase text-text-secondary tracking-widest">
                         {currentUser.badge || 'Eco Starter'}
                       </span>
                       <span className="text-neon-green font-black text-sm">
                         {currentUser.totalPoints || 0} PTS
                       </span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                       <p className="text-[2rem] font-black text-white leading-none mb-1">
                          <AnimatedCounter end={currentUser.devicesRecycled || 0} />
                       </p>
                       <p className="text-[9px] font-black uppercase text-text-secondary tracking-widest">Recycled</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                       <p className="text-[2rem] font-black text-neon-green leading-none mb-1">
                          <AnimatedCounter end={Math.round(currentUser.co2Saved || 0)} suffix="kg" />
                       </p>
                       <p className="text-[9px] font-black uppercase text-text-secondary tracking-widest">CO2 Offset</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}
      </motion.section>

      {/* Global Impact Dashboard */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4 mb-32"
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-[10px] font-black text-neon-green uppercase tracking-[0.5em] mb-4">Real-Time Global Statistics</h2>
          <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">The Collective Impact</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Devices Processed', value: globalStats.totalDevices, icon: '📱', color: 'neon-green' },
            { label: 'CO2 Savings Tracked', value: globalStats.totalCO2, icon: '☁️', color: 'electric-blue', suffix: ' kg' },
            { label: 'Material Value Unlocked', value: globalStats.totalValue, icon: '💎', color: 'neon-green', prefix: '₹' },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
              <div className="relative glass-card p-10 border-white/10 rounded-3xl text-center hover:border-white/20 transition-all">
                <div className="text-4xl mb-6">{stat.icon}</div>
                <div className={`text-5xl font-black mb-2 tracking-tighter text-${stat.color}`}>
                  <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-text-secondary text-xs font-black uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Modern Feature Grid */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} className="h-full">
              <Link to={f.to} className="group relative block h-full p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden transition-all hover:bg-white/[0.05] hover:border-white/10">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.07] transition-all rotate-12">{f.icon}</div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-white tracking-tight mb-3 uppercase">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-32 text-center px-4"
      >
         <p className="text-text-secondary/40 text-[10px] font-black uppercase tracking-[0.5em] mb-2">PUNARNAVA PLATFORM — RECYCLE. RENEW. RESTORE.</p>
         <p className="text-white/20 text-xs font-mono italic">"पुनर्नवा — That which renews itself, eternally."</p>
      </motion.div>
    </div>
  );
}
