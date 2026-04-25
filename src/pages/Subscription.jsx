import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

// Pricing realistic for Enterprise E-Waste Recyclers
const plans = [
  {
    id: 'starter',
    name: 'Core Network',
    price: '₹4,999',
    period: '/month',
    durationDays: 30,
    features: [
      'Access to Local Consumer Network',
      'Real-time Intake Notifications',
      'Standard AI Material Breakdown',
      'Basic Impact Analytics',
      'Email Support'
    ]
  },
  {
    id: 'pro',
    name: 'Enterprise Matrix',
    price: '₹14,999',
    period: '/month',
    durationDays: 30,
    popular: true,
    features: [
      'Everything in Core Network',
      'Priority AI Material Validation',
      'Global Arena Analytics',
      'Verified Recycler Badge',
      'API Access for ERP Integration',
      'Dedicated Account Manager'
    ]
  },
  {
    id: 'yearly',
    name: 'Global Syndicate',
    price: '₹1,20,000',
    period: '/year',
    durationDays: 365,
    features: [
      'Everything in Enterprise Matrix',
      'Zero Transaction Fees on Scrap',
      'B2B Corporate E-Waste Contracts',
      'Predictive Yield Analytics',
      'Custom White-Label Portal'
    ]
  }
];

export default function Subscription() {
  const { currentUser } = useAuth();

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Mock checking subscription duration
  const mockSubExpiry = new Date();
  mockSubExpiry.setDate(mockSubExpiry.getDate() + 14);

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h1 className="font-display text-4xl sm:text-5xl font-black neon-text mb-4 tracking-tighter">RECYCLER NETWORKS</h1>
            <p className="text-text-secondary max-w-xl mx-auto">Scale your electronic waste procurement with AI-validated, verified consumer intake feeds.</p>
          </motion.div>

          {/* Active Subscription Status */}
          <motion.div variants={fadeUp} className="mb-12 p-6 rounded-2xl glass-card border-neon-green/30 bg-neon-green/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center text-2xl">💎</div>
              <div>
                <p className="text-[10px] font-black text-neon-green uppercase tracking-widest mb-1">Active License</p>
                <h3 className="text-xl font-bold text-white">Trial Enterprise</h3>
              </div>
            </div>
            <div className="text-right">
               <p className="text-xs text-text-secondary mb-1">Expires in</p>
               <p className="text-xl font-black text-white tabular-nums">14 Days <span className="text-sm font-normal text-gray-400">({mockSubExpiry.toLocaleDateString()})</span></p>
            </div>
          </motion.div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <motion.div 
                key={plan.id}
                variants={fadeUp}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${plan.popular ? 'bg-card-dark border-neon-green/50 shadow-[0_0_30px_rgba(0,255,136,0.1)] scale-105 z-10' : 'bg-card-dark/50 border-white/10 hover:border-white/30'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-neon-green text-[#0a0f0a] text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                    Most Selected
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.popular ? 'text-neon-green' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-text-secondary text-sm">{plan.period}</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-neon-green mt-0.5">✓</span>
                      <span className="text-sm text-gray-300 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${plan.popular ? 'bg-neon-green text-[#0a0f0a] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  {plan.id === 'starter' ? 'Downgrade to Core' : 'Upgrade License'}
                </button>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
