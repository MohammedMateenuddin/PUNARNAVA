import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AnimatedCounter from '../components/AnimatedCounter';

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

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-5xl mx-auto text-center mb-20"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/20 mb-6">
            🌍 AI-Powered E-Waste Intelligence
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
        >
          <span className="neon-text-glow">PUNARNAVA</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-4 leading-relaxed">
          Transforming electronic waste into economic opportunity.
          <br />
          <span className="text-text-primary font-medium">Scan. Extract. Recycle. Earn.</span>
        </motion.p>

        <motion.p variants={fadeUp} className="text-sm text-text-secondary/60 font-mono mb-10">
          पुनर्नवा — "That which renews itself"
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
          <Link to="/scanner" className="btn-primary text-base">
            🔬 Start Scanning
          </Link>
          <Link to="/dashboard" className="btn-secondary text-base">
            📊 View Dashboard
          </Link>
        </motion.div>
      </motion.section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="max-w-4xl mx-auto mb-20"
      >
        <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl text-neon-green">
              <AnimatedCounter end={globalStats.totalDevices} />
            </div>
            <p className="text-text-secondary text-sm mt-1">Devices Processed</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl text-electric-blue">
              <AnimatedCounter end={globalStats.totalCO2} suffix=" kg" />
            </div>
            <p className="text-text-secondary text-sm mt-1">CO₂ Saved</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl text-neon-green">
              <AnimatedCounter end={globalStats.totalValue} prefix="₹" />
            </div>
            <p className="text-text-secondary text-sm mt-1">Value Unlocked</p>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="max-w-6xl mx-auto"
      >
        <motion.h2 variants={fadeUp} className="text-center font-display text-2xl sm:text-3xl font-bold mb-12 neon-text">
          Platform Features
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Link to={f.to} className="block glass-card-hover p-6 h-full">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2 text-text-primary">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
