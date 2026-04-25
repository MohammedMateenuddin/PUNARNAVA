import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'For individual scrap dealers',
    price: '₹499',
    period: '/month',
    durationDays: 30,
    features: [
      'Access to Local Consumer Network',
      'Real-time Intake Notifications',
      'Standard AI Material Breakdown',
      'Basic Impact Analytics',
      'Email Support'
    ],
    cta: 'Start Free — 30 days'
  },
  {
    id: 'pro',
    name: 'Professional',
    subtitle: 'For growing recycling businesses',
    price: '₹1,999',
    period: '/month',
    durationDays: 30,
    popular: true,
    features: [
      'Everything in Starter',
      'Priority AI Material Validation',
      'Global Arena Analytics',
      'Verified Recycler Badge',
      'API Access for ERP Integration',
      'Dedicated Account Manager'
    ],
    cta: 'Start Free — 30 days'
  },
  {
    id: 'yearly',
    name: 'Enterprise',
    subtitle: 'For formal recyclers & corporates',
    price: '₹9,999',
    period: '/month',
    durationDays: 365,
    features: [
      'Everything in Professional',
      'Zero Transaction Fees on Scrap',
      'B2B Corporate E-Waste Contracts',
      'Predictive Yield Analytics',
      'Custom White-Label Portal'
    ],
    cta: 'Contact Sales'
  }
];

export default function Subscriptions() {
  const { currentUser } = useAuth();
  
  const [activePlan, setActivePlan] = useState(currentUser?.subscription?.plan || 'Free Trial — 30 Days');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const mockSubExpiry = new Date();
  mockSubExpiry.setDate(mockSubExpiry.getDate() + 14);

  const handleSubscribe = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setActivePlan(selectedPlan.name);
        setSuccess(false);
        setSelectedPlan(null);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-8 sm:mb-16">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00cfff] to-[#0088ff] mb-4 tracking-tighter">SUBSCRIPTION PLANS</h1>
            <p className="text-text-secondary max-w-xl mx-auto text-sm px-4">Scale your electronic waste procurement with AI-validated, verified consumer intake feeds.</p>
          </motion.div>

          {/* Active Subscription Status */}
          <motion.div variants={fadeUp} className="mb-12 p-6 rounded-2xl glass-card flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderColor: 'rgba(0,207,255,0.2)', background: 'rgba(0,207,255,0.03)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00cfff]/20 flex items-center justify-center text-2xl">💎</div>
              <div>
                <p className="text-[10px] font-black text-[#00cfff] uppercase tracking-widest mb-1">Active License</p>
                <h3 className="text-xl font-bold text-white">{activePlan}</h3>
              </div>
            </div>
            <div className="text-right">
               <p className="text-xs text-text-secondary mb-1">Expires in</p>
               <p className="text-xl font-black text-white tabular-nums">14 Days <span className="text-sm font-normal text-gray-400">({mockSubExpiry.toLocaleDateString()})</span></p>
            </div>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan) => (
              <motion.div 
                key={plan.id}
                variants={fadeUp}
                className={`relative p-6 sm:p-8 rounded-2xl transition-all duration-300 border ${plan.popular ? 'bg-card-dark border-[#00cfff]/50 shadow-[0_0_30px_rgba(0,207,255,0.1)] md:scale-105 z-10' : 'bg-card-dark/50 border-white/10 hover:border-white/30'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00cfff] text-[#0a0f0a] text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,207,255,0.4)]">
                    Most Selected
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                {plan.subtitle && <p className="text-xs text-text-secondary mb-2">{plan.subtitle}</p>}
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.popular ? 'text-[#00cfff]' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-text-secondary text-sm">{plan.period}</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[#00cfff] mt-0.5">✓</span>
                      <span className="text-sm text-gray-300 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${plan.popular ? 'bg-[#00cfff] text-[#0a0f0a] hover:shadow-[0_0_20px_rgba(0,207,255,0.4)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fake Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e17]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#111827] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative"
            >
              {success ? (
                <div className="p-12 text-center flex flex-col items-center justify-center h-[400px]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-[#00e5a0]/20 rounded-full flex items-center justify-center text-4xl mb-6">
                    ✅
                  </motion.div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Payment Successful</h3>
                  <p className="text-[#00e5a0] text-sm font-bold">Welcome to {selectedPlan?.name}!</p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">Secure Checkout</h3>
                    <button onClick={() => !processing && setSelectedPlan(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                  </div>
                  
                  <div className="bg-[#0a0e17] rounded-2xl p-6 border border-white/5 mb-8">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Selected Plan</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-2xl font-black text-[#00cfff]">{selectedPlan?.name}</h4>
                      <p className="text-xl font-bold text-white">{selectedPlan?.price}<span className="text-xs text-gray-500 font-normal">{selectedPlan?.period}</span></p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Card Number</label>
                      <input type="text" value="•••• •••• •••• 4242" readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Expiry</label>
                        <input type="text" value="12/28" readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">CVC</label>
                        <input type="password" value="123" readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubscribe} 
                    disabled={processing}
                    className="w-full py-4 rounded-xl bg-[#00cfff] text-[#0a0f0a] font-black uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(0,207,255,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#0a0f0a]/30 border-t-[#0a0f0a] rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${selectedPlan?.price}`
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-widest font-bold">🔒 Secured by Stripe Demo</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
