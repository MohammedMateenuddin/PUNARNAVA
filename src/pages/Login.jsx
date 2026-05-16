import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Factory, Recycle } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, resetPassword, isDemo } = useAuth();
  
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const clearErrors = () => {
    setError('');
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setSuccessMsg('');
  };

  const getFriendlyErrorMessage = (err) => {
    const code = err.code || err.message;
    if (code.includes('invalid-credential')) return "Incorrect email or password";
    if (code.includes('user-not-found')) return "No account found with this email";
    if (code.includes('wrong-password')) return "Incorrect password";
    if (code.includes('invalid-email')) return "Please enter a valid email address";
    if (code.includes('too-many-requests')) return "Too many attempts. Try again later";
    if (code.includes('network-request-failed')) return "Network error. Check your connection";
    if (code.includes('email-already-in-use')) return "An account already exists with this email";
    return `Authentication failed: ${code.split('/').pop().replace(/-/g, ' ')}`;
  };

  const validateInputs = () => {
    let isValid = true;
    
    if (isSignUp && !name.trim()) {
      setNameError("Full name is required");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleAuth = async (action) => {
    setLoading(true);
    clearErrors();
    try {
      await action();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
    setLoading(false);
  };

  const onEmailSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    handleAuth(async () => {
      await loginWithEmail(email, password, role, isSignUp, name);
      if (isSignUp) {
        setSuccessMsg("Account created! A verification email has been sent.");
      }
    });
  };

  const handleForgotPassword = async () => {
    clearErrors();
    if (!email) {
      setEmailError("Please enter your email first to reset password");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-[#111827] border rounded-xl px-12 py-4 text-white focus:outline-none transition-all placeholder-gray-500 font-medium";
  const btnClass = "w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-black transition-all relative overflow-hidden uppercase tracking-widest text-sm";

  return (
    <div className="w-full max-w-[480px] mx-4">
      <div className="fixed inset-0 bg-[#050b14] -z-10" />

      {/* Header Logo Section */}
      <div className="text-center mb-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4 inline-block"
        >
          <div className="w-20 h-20 bg-[#00ff88]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/20 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
            <Recycle className="w-12 h-12 text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00d4ff] uppercase">
            PUNARNAVA
          </h1>
          <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase font-black mt-2">
            SCAN IT &middot; KNOW IT &middot; RECYCLE IT
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0e17] rounded-[2.5rem] border border-white/5 p-8 sm:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Sign In / Create Account Tabs */}
        <div className="flex bg-[#111827] rounded-2xl p-1 mb-8 border border-white/5">
          <button 
            onClick={() => { setIsSignUp(false); clearErrors(); }}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${!isSignUp ? 'bg-[#00ff88] text-[#050b14] shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'text-gray-500 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsSignUp(true); clearErrors(); }}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${isSignUp ? 'bg-[#00ff88] text-[#050b14] shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'text-gray-500 hover:text-white'}`}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector Section */}
        <div className="mb-8">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">I AM A...</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setRole('user'); clearErrors(); }}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${role === 'user' ? 'border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_30px_rgba(0,255,136,0.1)]' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
            >
              <Recycle className={`w-10 h-10 transition-all ${role === 'user' ? 'text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]' : 'text-gray-600 group-hover:text-gray-400'}`} />
              <div className="text-center">
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${role === 'user' ? 'text-[#00ff88]' : 'text-gray-500'}`}>Individual</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Scan & recycle</p>
              </div>
            </button>
            <button 
              onClick={() => { setRole('recycler'); clearErrors(); }}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${role === 'recycler' ? 'border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_30px_rgba(0,255,136,0.1)]' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
            >
              <Factory className={`w-10 h-10 transition-all ${role === 'recycler' ? 'text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]' : 'text-gray-600 group-hover:text-gray-400'}`} />
              <div className="text-center">
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${role === 'recycler' ? 'text-[#00ff88]' : 'text-gray-500'}`}>Recycler</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Manage pickups</p>
              </div>
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center uppercase tracking-wider animate-shake">{error}</div>}
        {successMsg && <div className="mb-6 p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-2xl text-[#00ff88] text-xs font-bold text-center uppercase tracking-wider">{successMsg}</div>}

        <form onSubmit={onEmailSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
                <Recycle className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => { setName(e.target.value); clearErrors(); }} 
                className={`${inputClass} ${nameError ? 'border-red-500' : 'border-white/5 focus:border-[#00ff88]/50'}`} 
              />
            </div>
          )}

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={e => { setEmail(e.target.value); clearErrors(); }} 
              className={`${inputClass} ${emailError ? 'border-red-500' : 'border-white/5 focus:border-[#00ff88]/50'}`} 
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ff88] transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={e => { setPassword(e.target.value); clearErrors(); }} 
              className={`${inputClass} ${passwordError ? 'border-red-500' : 'border-white/5 focus:border-[#00ff88]/50'}`} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`${btnClass} bg-[#00ff88] text-[#050b14] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] hover:scale-[1.02] mt-4`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#050b14]/30 border-t-[#050b14] rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
          <button 
            onClick={() => handleAuth(() => loginWithGoogle(role))}
            disabled={loading}
            className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-white hover:bg-white/[0.08] transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
            Secure &middot; AI Verified &middot; ESG Compliant
          </p>
        </div>
      </motion.div>
    </div>
  );
}
