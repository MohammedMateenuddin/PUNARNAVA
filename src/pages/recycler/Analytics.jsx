import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const monthlyIntake = [
  { month: 'Nov', devices: 42 },
  { month: 'Dec', devices: 58 },
  { month: 'Jan', devices: 73 },
  { month: 'Feb', devices: 65 },
  { month: 'Mar', devices: 91 },
  { month: 'Apr', devices: 87 },
];

const materialBreakdown = [
  { name: 'Copper', value: 35, color: '#B87333' },
  { name: 'Aluminium', value: 25, color: '#C0C0C0' },
  { name: 'Gold', value: 15, color: '#FFD700' },
  { name: 'Lithium', value: 12, color: '#00d4ff' },
  { name: 'Cobalt', value: 8, color: '#6366f1' },
  { name: 'Other', value: 5, color: '#374151' },
];

const revenueTrend = [
  { month: 'Nov', revenue: 45000 },
  { month: 'Dec', revenue: 62000 },
  { month: 'Jan', revenue: 78000 },
  { month: 'Feb', revenue: 71000 },
  { month: 'Mar', revenue: 105000 },
  { month: 'Apr', revenue: 125000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0e17] border border-[#00cfff]/20 rounded-xl p-3 shadow-lg">
        <p className="text-[10px] font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-black text-[#00cfff]">{payload[0].name === 'revenue' ? `₹${payload[0].value.toLocaleString()}` : payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-8 sm:mb-12">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00cfff] to-[#0088ff] mb-4 tracking-tighter">ANALYTICS ENGINE</h1>
            <p className="text-text-secondary max-w-xl mx-auto text-sm px-4">Business intelligence for your recycling operations.</p>
          </motion.div>

          {/* Top Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[
              { label: 'This Month Intake', value: '87', icon: '📦', color: '#00cfff' },
              { label: 'Revenue (Apr)', value: '₹1,25,000', icon: '💰', color: '#00e5a0' },
              { label: 'Top Category', value: 'Smartphones', icon: '📱', color: '#FFD700' },
              { label: 'Avg. Yield', value: '₹1,437', icon: '📊', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0a0e17] border border-white/5 text-center hover:border-[#00cfff]/20 transition-all">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Monthly Intake Bar Chart */}
            <motion.div variants={fadeUp} className="glass-card p-6">
              <h3 className="font-bold text-xs text-[#00cfff]/60 uppercase tracking-widest mb-6">Monthly Intake Volume</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyIntake}>
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="devices" fill="#00cfff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Material Breakdown Donut */}
            <motion.div variants={fadeUp} className="glass-card p-6">
              <h3 className="font-bold text-xs text-[#00cfff]/60 uppercase tracking-widest mb-6">Material Breakdown</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={materialBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {materialBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {materialBreakdown.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-[10px] text-gray-400 font-bold">{m.name}</span>
                      <span className="text-[10px] text-white font-black ml-auto">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Revenue Trend */}
          <motion.div variants={fadeUp} className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xs text-[#00cfff]/60 uppercase tracking-widest">Revenue Trend</h3>
              <button className="px-4 py-2 rounded-xl bg-[#00cfff]/10 border border-[#00cfff]/20 text-[#00cfff] text-[10px] font-black uppercase tracking-wider hover:bg-[#00cfff]/20 transition-all">
                📄 Export ESG Report
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#00cfff" strokeWidth={3} dot={{ fill: '#00cfff', r: 5 }} activeDot={{ r: 8, fill: '#00cfff', stroke: '#0a0e17', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
