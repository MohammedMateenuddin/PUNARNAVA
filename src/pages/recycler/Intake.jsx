import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// Mock pending submissions from users — scrap values based on actual material recovery at market rates
const initialSubmissions = [
  { id: 'sub1', device: 'iPhone 14 Pro Max', user: 'Rahul Verma', distance: '1.2 km', confidence: 97, materials: 'Gold (0.03g), Copper (15g), Cobalt (8g)', value: 198, preference: 'Home Pickup', status: 'pending' },
  { id: 'sub2', device: 'Samsung Galaxy S22', user: 'Priya Sharma', distance: '2.8 km', confidence: 95, materials: 'Gold (0.02g), Palladium (0.01g), Lithium (12g)', value: 148, preference: 'Drop-off', status: 'pending' },
  { id: 'sub3', device: 'HP Pavilion 15 Laptop', user: 'Anita Patel', distance: '4.1 km', confidence: 93, materials: 'Aluminium (350g), Copper (45g), Gold (0.05g)', value: 327, preference: 'Home Pickup', status: 'pending' },
  { id: 'sub4', device: 'Dell UltraSharp Monitor', user: 'Vikram Singh', distance: '5.5 km', confidence: 91, materials: 'Copper (120g), Aluminium (280g), Lead (15g)', value: 88, preference: 'Drop-off', status: 'pending' },
  { id: 'sub5', device: 'MacBook Air M2', user: 'Neha Gupta', distance: '3.0 km', confidence: 98, materials: 'Aluminium (450g), Gold (0.08g), Lithium (22g)', value: 497, preference: 'Home Pickup', status: 'pending' },
  { id: 'sub6', device: 'OnePlus 11', user: 'Arjun Das', distance: '6.3 km', confidence: 94, materials: 'Copper (12g), Gold (0.02g), Cobalt (6g)', value: 128, preference: 'Drop-off', status: 'pending' },
];

export default function Intake() {
  const { t } = useLang();
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const handleAction = (id, action) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const claimed = submissions.filter(s => s.status === 'claimed');
  const rejected = submissions.filter(s => s.status === 'rejected');

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00cfff] to-[#0088ff] mb-4 tracking-tighter uppercase">{t('intakeTitle')}</h1>
            <p className="text-text-secondary max-w-xl mx-auto text-sm px-4">{t('intakeSubtitle')}</p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/5 text-center">
              <p className="text-2xl font-black text-yellow-400">{pending.length}</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{t('pending')}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0e17] border border-[#00cfff]/10 text-center">
              <p className="text-2xl font-black text-[#00cfff]">{claimed.length}</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{t('claimed')}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/5 text-center">
              <p className="text-2xl font-black text-red-400">{rejected.length}</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{t('rejected')}</p>
            </div>
          </motion.div>

          {/* Submissions */}
          <div className="space-y-4">
            <AnimatePresence>
              {submissions.map((sub) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 rounded-2xl border transition-all ${
                    sub.status === 'claimed' ? 'bg-[#00cfff]/5 border-[#00cfff]/20' :
                    sub.status === 'rejected' ? 'bg-red-500/5 border-red-500/10 opacity-50' :
                    'bg-[#0a0e17] border-white/5 hover:border-[#00cfff]/20'
                  }`}
                >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-[#00cfff]/10 border border-[#00cfff]/15 flex items-center justify-center text-2xl shrink-0">
                        {sub.device.toLowerCase().includes('phone') || sub.device.toLowerCase().includes('galaxy') || sub.device.toLowerCase().includes('iphone') || sub.device.toLowerCase().includes('oneplus') ? '📱' : sub.device.toLowerCase().includes('laptop') || sub.device.toLowerCase().includes('macbook') || sub.device.toLowerCase().includes('pavilion') ? '💻' : '🖥️'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-base mb-1">{sub.device}</h4>
                        <p className="text-[10px] text-gray-500 mb-2">{sub.materials}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-400">👤 {sub.user}</span>
                          <span className="text-[10px] font-bold text-[#00cfff]">📍 {sub.distance}</span>
                          <span className="text-[10px] font-bold text-[#00e5a0]">AI Confidence: {sub.confidence}%</span>
                          <span className="text-[10px] font-bold text-yellow-400">🚚 {sub.preference}</span>
                        </div>
                      </div>
                    </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                      <div className="text-right">
                        <p className="text-xl font-black text-[#00cfff]">₹{sub.value.toLocaleString()}</p>
                        <p className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">{t('scrapValue')}</p>
                      </div>
                      {sub.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(sub.id, 'claimed')} className="px-4 py-2 rounded-xl bg-[#00cfff] text-[#0a0e17] text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,207,255,0.4)] hover:scale-105 active:scale-95 transition-all">
                            {t('claimDevice')}
                          </button>
                          <button onClick={() => handleAction(sub.id, 'rejected')} className="px-4 py-2 rounded-xl bg-white/5 text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-wider hover:bg-red-500/10 transition-all">
                            {t('reject')}
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${sub.status === 'claimed' ? 'bg-[#00cfff]/10 text-[#00cfff] border border-[#00cfff]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {sub.status === 'claimed' ? '✓ Claimed' : '✕ Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
