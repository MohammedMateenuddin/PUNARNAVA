import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative"
      >
        <div className="text-[150px] font-black leading-none opacity-10 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-7xl">🛰️</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md"
      >
        <h1 className="text-4xl font-black neon-text mb-4 tracking-tighter uppercase">Signal Lost in Orbit</h1>
        <p className="text-text-secondary font-medium mb-8">
          The intelligence coordinate you are looking for does not exist in our neural network. 
          Maybe it was recycled into something better?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-2xl bg-white text-deep-dark font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            Return to Core
          </button>
        </div>
      </motion.div>

      {/* Decorative Neural Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-1/4 left-1/4 w-px h-64 bg-gradient-to-b from-transparent via-neon-green/20 to-transparent rotate-45" />
        <div className="absolute bottom-1/4 right-1/4 w-px h-64 bg-gradient-to-b from-transparent via-electric-blue/20 to-transparent -rotate-45" />
      </div>
    </div>
  );
}
