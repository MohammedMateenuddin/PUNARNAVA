import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AnimatedCounter from '../components/AnimatedCounter';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const chartData = [
  { day: 'MON', count: 2 },
  { day: 'TUE', count: 5 },
  { day: 'WED', count: 3 },
  { day: 'THU', count: 8 },
  { day: 'FRI', count: 6 },
  { day: 'SAT', count: 12 },
  { day: 'SUN', count: 9 },
];

export default function Dashboard() {
  const { globalStats, mode } = useApp();
  const { currentUser } = useAuth();
  
  const statsToDisplay = mode === 'user' ? {
    totalDevices: currentUser?.devicesRecycled || 0,
    totalCO2: currentUser?.co2Saved || 0,
    totalValue: currentUser?.totalValue || 0,
  } : globalStats;

  const treeEquivalent = Math.round((statsToDisplay.totalCO2 || 0) / 22);

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-black neon-text mb-4 tracking-tighter">
              {mode === 'user' ? `ECO IMPACT MATRIX` : 'GLOBAL CARBON ENGINE'}
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto uppercase tracking-[0.4em] text-[9px] font-black opacity-60">
              {mode === 'user' 
                ? 'Tracking your personal contribution to planetary recovery' 
                : 'Enterprise material logistics & real-time recovery analytics'}
            </p>
          </motion.div>

          {/* Big Stats Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-10 text-center group hover:border-neon-green/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10 group-hover:scale-110 transition-transform text-2xl">📱</div>
              <div className="text-6xl font-black text-neon-green mb-3 drop-shadow-[0_0_20px_rgba(0,255,136,0.4)] tracking-tighter">
                <AnimatedCounter counterId="dash-devices" end={statsToDisplay.totalDevices} />
              </div>
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em]">Hardware Recovered</p>
              <div className="mt-6 h-1.5 rounded-full bg-white/5 overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '85%' }} 
                  transition={{ delay: 1, duration: 1.5, ease: "circOut" }} 
                  className="h-full rounded-full bg-gradient-to-r from-neon-green to-electric-blue shadow-[0_0_15px_rgba(0,255,136,0.6)]" 
                />
              </div>
            </div>
            
            <div className="glass-card p-10 text-center group hover:border-electric-blue/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10 group-hover:scale-110 transition-transform text-2xl">🌍</div>
              <div className="text-6xl font-black text-electric-blue mb-3 drop-shadow-[0_0_20px_rgba(0,212,255,0.4)] tracking-tighter">
                <AnimatedCounter counterId="dash-co2" end={parseFloat(statsToDisplay.totalCO2)} suffix=" kg" decimals={1} />
              </div>
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em]">Carbon Displacement</p>
              
              <div className="mt-6 flex items-center justify-center gap-4">
                 <div className="relative w-10 h-10">
                    <motion.svg viewBox="0 0 100 100" className="w-full h-full text-safe-green fill-current">
                       <motion.path 
                         initial={{ scale: 0, opacity: 0 }} 
                         animate={{ scale: 1, opacity: 1 }} 
                         transition={{ type: 'spring', delay: 1.5, stiffness: 100 }}
                         d="M50 10 L25 50 L40 50 L20 85 L80 85 L60 50 L75 50 Z" 
                       />
                       <rect x="45" y="85" width="10" height="10" />
                    </motion.svg>
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-black text-safe-green uppercase tracking-widest leading-none mb-1">Afforestation Power</p>
                    <p className="text-[9px] text-text-secondary font-bold uppercase tracking-tighter">Equivalent to {treeEquivalent} matured trees</p>
                 </div>
              </div>
            </div>

            <div className="glass-card p-10 text-center group hover:border-neon-green/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10 group-hover:scale-110 transition-transform text-2xl">💰</div>
              <div className="text-6xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-tighter">
                <AnimatedCounter counterId="dash-value" end={statsToDisplay.totalValue} prefix="₹" />
              </div>
              <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em]">Unlocked Capital</p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="text-neon-green text-[9px] font-black tracking-[0.2em] bg-neon-green/10 px-3 py-1 rounded-full border border-neon-green/20 uppercase">▲ 12.4% EFFICIENCY GAIN</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div variants={fadeUp} className="glass-card p-8 min-h-[450px] flex flex-col border-white/10">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="font-display font-black text-[11px] text-white uppercase tracking-[0.4em]">
                     Weekly Recyclability Flux
                   </h3>
                   <div className="flex gap-3">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-neon-green" />
                         <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Successful Scans</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-white/10" />
                         <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Baseline</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex-grow w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00ff88" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#666', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }} 
                        dy={15}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card-dark border border-white/20 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                                <p className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] mb-1">{payload[0].value} INTAKES</p>
                                <p className="text-[9px] text-text-secondary font-bold uppercase">System Verified</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 5 ? 'url(#barGradient)' : 'rgba(255, 255, 255, 0.05)'} 
                            stroke={index === 5 ? '#00ff88' : 'transparent'}
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { label: 'Hydration Saved', value: '12.4k L', icon: '💧', color: 'text-electric-blue' },
                    { label: 'Grid Energy', value: '8.2k kWh', icon: '⚡', color: 'text-warning-orange' },
                    { label: 'Landfill Shift', value: '2.4T', icon: '🏭', color: 'text-safe-green' },
                    { label: 'Biohazard Neutral', value: '145 kg', icon: '☣️', color: 'text-danger-red' },
                  ].map((s, i) => (
                    <div key={i} className="glass-card p-5 text-center hover:bg-white/[0.05] transition-all border-white/5">
                       <div className="text-2xl mb-2 grayscale opacity-40">{s.icon}</div>
                       <div className={`text-base font-black ${s.color} tracking-tighter`}>{s.value}</div>
                       <div className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] mt-2 opacity-60">{s.label}</div>
                    </div>
                  ))}
              </motion.div>
            </div>

            {/* Side Card */}
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="glass-card p-8 bg-gradient-to-br from-electric-blue/10 to-transparent border-electric-blue/20 relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-electric-blue/5 rounded-full blur-3xl group-hover:bg-electric-blue/10 transition-all" />
                
                <h3 className="font-display font-black text-[11px] text-white uppercase tracking-[0.4em] mb-8 relative z-10">Neural Intelligence</h3>
                <div className="space-y-8 relative z-10">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-electric-blue/20 flex items-center justify-center text-3xl border border-electric-blue/30 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                        💎
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-electric-blue uppercase tracking-[0.2em] mb-1">Urban Mine Capacity</p>
                         <p className="text-xs text-text-secondary font-medium leading-relaxed">You've successfully extracted <span className="text-white font-black">1.2 kg of Gold/Copper</span> matrix.</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-neon-green/20 flex items-center justify-center text-3xl border border-neon-green/30 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                        🏆
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] mb-1">Eco-Dominance</p>
                         <p className="text-xs text-text-secondary font-medium leading-relaxed">Currently performing at <span className="text-white font-black">94th percentile</span> of urban recyclers.</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5">
                      <div className="flex justify-between items-end mb-4">
                         <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Progression to Elite</p>
                         <p className="text-[9px] font-black text-neon-green tracking-[0.2em]">LVL 4 ACTIVE</p>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 2, ease: "circOut" }} className="h-full bg-gradient-to-r from-neon-green to-electric-blue rounded-full shadow-[0_0_15px_rgba(0,255,136,0.8)]" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="glass-card p-8 border-warning-orange/20 bg-warning-orange/[0.02]">
                 <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">🔥</span>
                    <p className="text-warning-orange text-[10px] font-black uppercase tracking-[0.3em]">Operational Streak</p>
                 </div>
                 <p className="text-sm text-text-secondary font-medium leading-relaxed">Maintain your <span className="text-white font-black">5-day cycle</span> to qualify for the <span className="text-warning-orange font-black">₹500 material bonus</span> on your next major intake!</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
