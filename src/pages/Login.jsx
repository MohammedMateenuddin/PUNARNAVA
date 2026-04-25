import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, resetPassword, isDemo } = useAuth();
  
  const [role, setRole] = useState('user');
  const [loginMethod, setLoginMethod] = useState('social'); // 'social', 'email'
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

  const inputClass = "w-full bg-[#0a1628]/50 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-colors";
  const btnClass = "w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="w-full max-w-[420px] relative z-10 mx-4">
      <div className="fixed inset-0 bg-[#0a1628] -z-10" />

      {isDemo && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="absolute -top-16 left-0 right-0 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 text-xs font-bold text-center py-2 px-4 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.2)] z-20"
        >
          ⚠️ Running in Demo Mode (Login with demo@punarnava.com / demo1234)
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 sm:p-10 rounded-[2rem] bg-[#0a1628]/60 backdrop-blur-[20px] border border-white/10 hover:border-[#00e5a0]/30 hover:shadow-[0_0_50px_rgba(0,229,160,0.1)] transition-all duration-700 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00e5a0]/50 to-transparent" />

        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="text-[4rem] mb-2 inline-block drop-shadow-[0_0_15px_rgba(0,229,160,0.4)]"
          >
            ♻️
          </motion.div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-[#00e5a0] to-[#1db954] drop-shadow-[0_0_15px_rgba(0,229,160,0.5)] mb-2 uppercase">
            PUNARNAVA
          </h1>
          <p className="text-[#00e5a0]/70 text-xs tracking-[0.2em] uppercase font-semibold">Recycle. Renew. Restore.</p>
        </div>

        {/* Role Selector Pill Toggle */}
        <div className="mb-8">
          <div className="flex bg-[#050b14]/80 rounded-full p-1.5 border border-white/5 relative shadow-inner">
            <button 
              onClick={() => { setRole('user'); clearErrors(); }} 
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all duration-300 z-10 ${role === 'user' ? 'text-[#0a1628]' : 'text-[#00e5a0]/50 hover:text-white'}`}
            >
              👤 User
            </button>
            <button 
              onClick={() => { setRole('recycler'); clearErrors(); }} 
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all duration-300 z-10 ${role === 'recycler' ? 'text-[#0a1628]' : 'text-[#00e5a0]/50 hover:text-white'}`}
            >
              🏭 Recycler
            </button>
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[#00e5a0] to-[#1db954] rounded-full shadow-[0_0_20px_rgba(0,229,160,0.4)]"
              style={{ left: role === 'user' ? '6px' : 'calc(50%)' }}
            />
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center font-medium animate-pulse">{error}</div>}
        {successMsg && <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm text-center font-medium">{successMsg}</div>}

        {/* Method Switcher */}
        <div className="flex justify-center gap-6 mb-8 border-b border-white/10 pb-4">
          <button 
            onClick={() => {setLoginMethod('social'); clearErrors();}} 
            className={`text-sm font-bold transition-all duration-300 relative pb-2 ${loginMethod === 'social' ? 'text-[#00e5a0]' : 'text-white/40 hover:text-white/80'}`}
          >
            Google
            {loginMethod === 'social' && <motion.div layoutId="tab-indicator" className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#00e5a0] shadow-[0_0_12px_rgba(0,229,160,1)] rounded-t-full" />}
          </button>
          <button 
            onClick={() => {setLoginMethod('email'); clearErrors();}} 
            className={`text-sm font-bold transition-all duration-300 relative pb-2 ${loginMethod === 'email' ? 'text-[#00e5a0]' : 'text-white/40 hover:text-white/80'}`}
          >
            Email
            {loginMethod === 'email' && <motion.div layoutId="tab-indicator" className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#00e5a0] shadow-[0_0_12px_rgba(0,229,160,1)] rounded-t-full" />}
          </button>
        </div>

        <div className="min-h-[220px] relative">
          <AnimatePresence mode="wait">
            {loginMethod === 'social' && (
              <motion.div key="social" initial={{opacity:0, filter:"blur(10px)"}} animate={{opacity:1, filter:"blur(0px)"}} exit={{opacity:0, filter:"blur(10px)"}} transition={{ duration: 0.3 }} className="pt-4">
                <button 
                  disabled={loading} 
                  onClick={() => handleAuth(() => loginWithGoogle(role))} 
                  className={`${btnClass} bg-[#0a1628]/80 text-white/90 border border-white/10 hover:border-[#00e5a0]/50 hover:bg-[#10233b] group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00e5a0]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-[#00e5a0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-md"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  )}
                  <span className="group-hover:text-[#00e5a0] transition-colors duration-300">{loading ? 'Connecting...' : 'Continue with Google'}</span>
                </button>
              </motion.div>
            )}

            {loginMethod === 'email' && (
              <motion.div key="email" initial={{opacity:0, filter:"blur(10px)"}} animate={{opacity:1, filter:"blur(0px)"}} exit={{opacity:0, filter:"blur(10px)"}} transition={{ duration: 0.3 }}>
                <form onSubmit={onEmailSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={e => { setName(e.target.value); clearErrors(); }} 
                        className={`${inputClass} ${nameError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#00e5a0]/50 placeholder-[#00e5a0]/30'}`} 
                      />
                      {nameError && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{nameError}</p>}
                    </div>
                  )}

                  <div>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={email} 
                      onChange={e => { setEmail(e.target.value); clearErrors(); }} 
                      className={`${inputClass} ${emailError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#00e5a0]/50 placeholder-[#00e5a0]/30'}`} 
                    />
                    {emailError && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{emailError}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => { setPassword(e.target.value); clearErrors(); }} 
                        className={`${inputClass} ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#00e5a0]/50 placeholder-[#00e5a0]/30'}`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? (
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {passwordError && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{passwordError}</p>}
                    
                    {!isSignUp && (
                      <div className="flex justify-end mt-1">
                        <button type="button" onClick={handleForgotPassword} className="text-[#00e5a0]/70 hover:text-[#00e5a0] text-xs font-medium transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className={`${btnClass} bg-gradient-to-r from-[#00e5a0] to-[#1db954] text-[#0a1628] hover:shadow-[0_0_25px_rgba(0,229,160,0.5)] hover:scale-[1.03] border-none mt-2 group`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    {loading ? (
                       <svg className="animate-spin h-5 w-5 text-[#0a1628]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>
                </form>
                
                <p className="text-center text-xs text-[#00e5a0]/60 mt-6 font-medium">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button onClick={() => { setIsSignUp(!isSignUp); clearErrors(); }} className="text-[#00e5a0] hover:text-white transition-colors underline decoration-dashed underline-offset-4 font-bold ml-1">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
