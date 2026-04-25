import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/AnimatedCounter';
import { useLang } from '../../context/LanguageContext';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const materialPrices = [
  { name: 'Gold (24K)', price: '₹5,280', unit: '/gram', change: -0.8, trend: '▼', color: '#FFD700', daily: '₹5,322 → ₹5,280' },
  { name: 'Copper (Cu)', price: '₹452', unit: '/kg', change: 2.3, trend: '▲', color: '#B87333', daily: '₹442 → ₹452' },
  { name: 'Aluminium (Al)', price: '₹122', unit: '/kg', change: 1.5, trend: '▲', color: '#C0C0C0', daily: '₹120 → ₹122' },
  { name: 'Lithium (Li)', price: '₹890', unit: '/kg', change: 4.7, trend: '▲', color: '#00d4ff', daily: '₹850 → ₹890' },
  { name: 'Cobalt (Co)', price: '₹2,840', unit: '/kg', change: -0.3, trend: '▼', color: '#6366f1', daily: '₹2,848 → ₹2,840' },
  { name: 'Palladium (Pd)', price: '₹3,150', unit: '/gram', change: 3.1, trend: '▲', color: '#a78bfa', daily: '₹3,055 → ₹3,150' },
  { name: 'Silver (Ag)', price: '₹72', unit: '/gram', change: 0.4, trend: '▲', color: '#e5e7eb', daily: '₹71.7 → ₹72' },
  { name: 'Steel Scrap', price: '₹28', unit: '/kg', change: -1.2, trend: '▼', color: '#9ca3af', daily: '₹28.3 → ₹28' },
];

const marketInsights = [
  { label: 'Total Scrap Processed', value: '2.4T', unit: 'today', icon: '⚖️', color: '#00cfff' },
  { label: 'Active Recyclers Online', value: '34', unit: 'India', icon: '🏭', color: '#00e5a0' },
  { label: 'Avg Scrap Yield / Device', value: '₹1,437', unit: 'this month', icon: '💎', color: '#FFD700' },
  { label: 'Top Material Demand', value: 'Copper', unit: '+2.3%', icon: '🔥', color: '#B87333' },
];

export default function Market() {
  const { t } = useLang();
  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-8 sm:mb-12">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00cfff] to-[#0088ff] mb-4 tracking-tighter uppercase">{t('marketOverview')}</h1>
            <p className="text-text-secondary max-w-xl mx-auto text-sm px-4">Live scrap material rates and market intelligence for your operations.</p>
          </motion.div>

          {/* Market Insights */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {marketInsights.map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0a0e17] border border-white/5 text-center hover:border-[#00cfff]/20 transition-all">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{s.label}</p>
                <p className="text-[8px] text-gray-600 mt-0.5">{s.unit}</p>
              </div>
            ))}
          </motion.div>

          {/* Material Price Cards — Full Width Grid */}
          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00cfff] animate-pulse" />
              {t('liveScrapRates')}
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-auto">Updated 5 min ago</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {materialPrices.map((m, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-2xl bg-[#0a0e17] border border-white/5 hover:border-[#00cfff]/30 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3.5 h-3.5 rounded-full shadow-lg" style={{ backgroundColor: m.color, boxShadow: `0 0 10px ${m.color}40` }} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{m.name}</span>
                  </div>
                  <p className="text-2xl font-black text-white mb-1">
                    {m.price}
                    <span className="text-[10px] text-gray-500 font-normal ml-1">{m.unit}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs font-bold ${m.change >= 0 ? 'text-[#00e5a0]' : 'text-red-400'}`}>
                      {m.trend} {Math.abs(m.change)}%
                    </p>
                    <p className="text-[8px] text-gray-600 font-mono">{m.daily}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Summary */}
          <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-[#0a0e17] border border-[#00cfff]/10">
            <h3 className="font-bold text-xs text-[#00cfff]/60 uppercase tracking-widest mb-4">{t('marketSummary')}</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
              <div>
                <p className="text-white font-bold mb-1">🔺 {t('trendingUp')}</p>
                <p>Lithium (+4.7%), Palladium (+3.1%), and Copper (+2.3%) are seeing strong demand from EV battery and electronics manufacturers.</p>
              </div>
              <div>
                <p className="text-white font-bold mb-1">🔻 {t('underPressure')}</p>
                <p>Steel scrap (-1.2%) and Gold (-0.8%) show minor corrections. Expect stabilization by end-of-week.</p>
              </div>
              <div>
                <p className="text-white font-bold mb-1">📊 {t('outlook')}</p>
                <p>E-waste procurement volumes are up 18% QoQ. Copper and Lithium remain the highest-yield materials for recyclers.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
