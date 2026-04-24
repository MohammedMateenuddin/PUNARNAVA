import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { devices, recyclers } from '../data/mockData';
import { playScanComplete } from '../utils/sound';
import { loadAIModel, detectDeviceFromImage } from '../utils/aiMatcher';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function SafetyBadge({ level }) {
  const cls = level === 'Safe' ? 'badge-safe' : level === 'Moderate' ? 'badge-moderate' : 'badge-hazardous';
  const icon = level === 'Safe' ? '✅' : level === 'Moderate' ? '⚠️' : '☢️';
  return <span className={cls}>{icon} {level}</span>;
}

function MaterialBar({ mat, delay }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.5 }} className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-primary font-bold uppercase tracking-wider">{mat.name}</span>
        <span className="text-text-secondary font-mono">{mat.amount} {mat.unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${mat.pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          style={{ background: mat.color }}
        />
      </div>
    </motion.div>
  );
}

export default function Scanner() {
  const { mode, demoMode, scanResult, performScan, loadDemoResult, language, setLanguage } = useApp();
  const { submitRecycling, calculatePoints } = useAuth();
  const navigate = useNavigate();
  
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showResults, setShowResults] = useState(!!scanResult);
  const [error, setError] = useState(null);
  const [useCamera, setUseCamera] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadAIModel();
    if (useCamera) startCamera();
    return () => stopCamera();
  }, [useCamera, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(false);
      if (streamRef.current) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setCameraError(true);
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setPreview(URL.createObjectURL(file));
      await startScan(file, canvas);
    }, 'image/jpeg');
  };

  const onDrop = useCallback((files) => {
    if (files[0]) {
      setPreview(URL.createObjectURL(files[0]));
      const img = new Image();
      img.src = URL.createObjectURL(files[0]);
      img.onload = () => startScan(files[0], img);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  async function startScan(file, imageElement) {
    setScanning(true);
    setShowResults(false);
    setError(null);
    try {
      const detectedDevice = await detectDeviceFromImage(imageElement);
      setTimeout(() => {
        if (detectedDevice) {
          performScan(file, detectedDevice.id);
          playScanComplete();
          setScanning(false);
          setShowResults(true);
        } else {
          setScanning(false);
          setError('No electronic waste detected. Point camera closer or check lighting.');
        }
      }, 1500);
    } catch (err) {
      setScanning(false);
      setError('Analysis failed. Check your network.');
    }
  }

  const handleSubmitRecycling = async () => {
    setSubmitting(true);
    try {
      const result = await submitRecycling(scanResult);
      setRewardData(result);
      setShowSuccess(true);
      
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.7 },
        colors: ['#00ff88', '#00d4ff', '#ffffff', '#FFD700']
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      alert("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  const langLabels = { en: 'English', hi: 'हिन्दी', kn: 'ಕನ್ನಡ' };
  const nearestRecyclers = recyclers.slice(0, 3);

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h1 className="font-display text-4xl sm:text-5xl font-black neon-text mb-4 tracking-tighter">AI WASTE INTELLIGENCE</h1>
            <p className="text-text-secondary max-w-xl mx-auto text-xs uppercase font-bold tracking-[0.3em] opacity-60">Neural-Net Powered Material Identification</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Viewfinder Section */}
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="glass-card overflow-hidden relative aspect-[4/3] flex flex-col border-white/10">
                <AnimatePresence mode="wait">
                  {useCamera && !preview ? (
                    <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex-grow bg-black">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                      
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Precision Corners */}
                        <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-neon-green/60 rounded-tl-lg" />
                        <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-neon-green/60 rounded-tr-lg" />
                        <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-neon-green/60 rounded-bl-lg" />
                        <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-neon-green/60 rounded-br-lg" />
                        
                        {/* Scanning HUD */}
                        <motion.div 
                          animate={{ top: ['15%', '85%', '15%'] }} 
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute left-8 right-8 h-[1px] bg-neon-green/40 shadow-[0_0_20px_rgba(0,255,136,0.8)]"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                      </div>

                      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6">
                        <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                           <p className="text-neon-green text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Scanning for target...</p>
                        </div>
                        <div className="flex items-center gap-10">
                           <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all">🔄</button>
                           <button onClick={captureImage} className="group relative">
                              <div className="absolute inset-0 bg-neon-green rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                              <div className="w-20 h-20 rounded-full border-4 border-white/20 p-1 relative z-10">
                                 <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                   📷
                                 </div>
                              </div>
                           </button>
                           <button onClick={() => setUseCamera(false)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all">📁</button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="upload" {...getRootProps()} className="flex-grow flex flex-col items-center justify-center p-12 text-center cursor-pointer min-h-[400px]">
                      <input {...getInputProps()} />
                      {preview ? (
                        <div className="relative">
                          <img src={preview} alt="Preview" className="max-h-72 rounded-3xl shadow-2xl border border-white/10" />
                          <button onClick={(e) => { e.stopPropagation(); setPreview(null); setUseCamera(true); }} className="absolute -top-4 -right-4 bg-deep-dark border border-white/20 w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-xl">❌</button>
                        </div>
                      ) : (
                        <div className="group">
                          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl mb-8 group-hover:scale-110 transition-transform">📂</div>
                          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Manual Intake</h3>
                          <p className="text-text-secondary text-sm mb-8 font-medium">Drop architectural device diagrams or clear photos</p>
                          <button onClick={(e) => { e.stopPropagation(); setUseCamera(true); }} className="px-8 py-3 rounded-2xl bg-white text-deep-dark font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Switch to Live Feed</button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {scanning && (
                  <div className="absolute inset-0 bg-deep-dark/90 backdrop-blur-xl flex flex-col items-center justify-center z-50">
                    <div className="relative w-32 h-32 mb-8">
                       <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-b-2 border-neon-green" />
                       <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border-l-2 border-r-2 border-electric-blue" />
                       <div className="absolute inset-0 flex items-center justify-center text-5xl">🧠</div>
                    </div>
                    <p className="text-white font-black text-2xl tracking-tighter mb-2">NEURAL MATCHING...</p>
                    <p className="text-neon-green text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Querying Material Database</p>
                  </div>
                )}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-danger-red/10 border border-danger-red/30 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-danger-red/20 flex items-center justify-center text-xl">⚠️</div>
                   <p className="text-danger-red text-sm font-black tracking-tight">{error}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Analysis Section */}
            <motion.div variants={fadeUp}>
              <AnimatePresence mode="wait">
                {showResults && scanResult ? (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="glass-card p-8 border-neon-green/30 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-green/10 rounded-full blur-3xl" />
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-[10px] font-black bg-neon-green text-deep-dark px-2 py-0.5 rounded uppercase tracking-tighter">AI VERIFIED</span>
                             <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{scanResult.confidence}% CONFIDENCE</span>
                          </div>
                          <h3 className="font-display font-black text-3xl text-white tracking-tighter leading-none">{scanResult.name}</h3>
                        </div>
                        <SafetyBadge level={scanResult.safetyLevel} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 text-center">
                          <p className="text-text-secondary text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Material Value</p>
                          <p className="text-3xl font-black text-white">₹{scanResult.estimatedValue}</p>
                        </div>
                        <div className="p-5 rounded-3xl bg-neon-green/[0.03] border border-neon-green/10 text-center">
                          <p className="text-neon-green text-[9px] font-black uppercase tracking-[0.2em] mb-2">Points Award</p>
                          <p className="text-3xl font-black text-neon-green">+{calculatePoints(scanResult)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-8">
                      <h4 className="font-display font-black text-[10px] text-text-secondary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-blue shadow-[0_0_8px_rgba(0,212,255,1)]" />
                        Chemical & Material Matrix
                      </h4>
                      <div className="space-y-6">
                        {scanResult.materials.map((m, i) => (
                          <MaterialBar key={m.name} mat={m} delay={i * 0.1} />
                        ))}
                      </div>
                    </div>

                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-8 bg-gradient-to-br from-neon-green/20 to-transparent border-neon-green/40">
                      <div className="flex items-center gap-6 mb-8">
                         <div className="w-16 h-16 rounded-3xl bg-neon-green flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,136,0.4)]">♻️</div>
                         <div>
                            <h4 className="font-black text-white text-xl tracking-tighter">Ready to process?</h4>
                            <p className="text-sm text-text-secondary font-medium">Earn {calculatePoints(scanResult)} points and save {scanResult.co2Saved}kg of CO₂ emissions.</p>
                         </div>
                      </div>
                      <button onClick={handleSubmitRecycling} disabled={submitting} className="w-full py-5 rounded-2xl bg-neon-green text-deep-dark font-black text-lg uppercase tracking-widest shadow-[0_0_40px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                        {submitting ? 'COMMITTING TO LEDGER...' : 'CONFIRM RECYCLING'}
                      </button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 flex flex-col items-center justify-center h-full text-center border-dashed border-white/5 opacity-40">
                    <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center text-6xl mb-8">🔭</div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Awaiting Input</h3>
                    <p className="text-text-secondary text-sm max-w-xs font-medium">Position your hardware or upload documentation to trigger neural analysis.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Success Overlay Modal */}
          <AnimatePresence>
            {showSuccess && rewardData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deep-dark/90 backdrop-blur-xl">
                 <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card p-10 max-w-md w-full text-center border-neon-green/40 shadow-[0_0_100px_rgba(0,255,136,0.2)]">
                    <div className="text-7xl mb-8">🌟</div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">INTAKE COMPLETE!</h2>
                    <p className="text-neon-green font-black text-lg uppercase tracking-widest mb-10">+{rewardData.points} ECO POINTS EARNED</p>
                    
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-8">
                       <p className="text-text-secondary text-xs uppercase font-black tracking-widest mb-1">New Global Standing</p>
                       <p className="text-3xl font-black text-white tracking-tighter">RANK #{rewardData.newRank}</p>
                    </div>

                    <p className="text-text-secondary text-sm font-medium mb-2">Redirecting to impact matrix...</p>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} className="h-full bg-neon-green" />
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </div>
    </div>
  );
}
