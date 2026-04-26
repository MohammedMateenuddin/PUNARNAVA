import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { devices, recyclers } from '../data/mockData';
import { playScanComplete } from '../utils/sound';
import { scanDeviceWithRetry, lastApiError, formatRate } from '../utils/geminiScanner';
import { fetchDisassemblyVideo } from '../utils/youtubeApi';

function isLocalIP() {
  const host = window.location.hostname;
  return (
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("172.") ||
    host === "127.0.0.1"
  );
}

function CameraErrorScreen({ error, onRetry, onUpload, onSimulate }) {
  const messages = {
    PERMISSION_DENIED: {
      title: "Camera Access Blocked",
      desc: "You previously blocked camera access. Click the camera icon in your browser address bar and set it to 'Allow', then click Retry.",
      showRetry: true,
    },
    BROWSER_UNSUPPORTED: {
      title: "Browser Unsupported",
      desc: "Try opening PUNARNAVA in Chrome or Firefox.",
      showRetry: false,
    },
    CAMERA_UNAVAILABLE: {
      title: "No Camera Detected",
      desc: "Your device has no accessible camera. Upload a device photo or use the AI simulator.",
      showRetry: true,
    },
    LOCALHOST_REQUIRED: {
      title: "Camera Blocked on Local IP",
      desc: 'Open the app at "localhost:5175" instead of your IP address. Camera requires localhost or HTTPS.',
      showRetry: false,
    }
  };
  const msg = messages[error] || messages.CAMERA_UNAVAILABLE;
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
      <div className="w-24 h-24 rounded-3xl bg-[#00ffc0]/10 border border-[#00ffc0]/20 flex items-center justify-center text-5xl mb-8 mx-auto">🔬</div>
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">AI Scanner <span className="text-[#00ffc0]">Ready</span></h3>
      <p className="text-text-secondary text-sm mb-8 font-medium max-w-md">{msg.desc}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
        <button onClick={onSimulate} className="flex-1 py-3 rounded-2xl bg-[#00ffc0] text-deep-dark font-black text-xs uppercase tracking-widest hover:scale-105 shadow-[0_0_20px_rgba(0,255,192,0.4)] transition-all">
          ✨ Start Simulation
        </button>
        <button onClick={onUpload} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
          Upload Image
        </button>
      </div>
      {msg.showRetry && (
        <button onClick={onRetry} className="mt-4 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
          Retry Camera
        </button>
      )}
    </div>
  );
}

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
        <div className="flex items-center gap-2">
           <span className="text-white font-black uppercase tracking-wider">{mat.name}</span>
           {mat.ratePerGram && <span className="text-[9px] text-gray-500 tracking-widest uppercase">@ {formatRate(mat.ratePerGram)}</span>}
        </div>
        <div className="text-right">
           <span className="text-gray-400 font-mono">{mat.amount} {mat.unit}</span>
           {mat.scrapValueINR > 0 && <span className="text-[#00ffc0] font-bold ml-2">₹{mat.scrapValueINR}</span>}
        </div>
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
  const { scanResult, performScan, loadDemoResult } = useApp();
  const { t, lang: selectedLang } = useLang();
  const { submitRecycling, calculatePoints } = useAuth();
  const navigate = useNavigate();
  
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showResults, setShowResults] = useState(!!scanResult);
  const [error, setError] = useState(null);
  const [useCamera, setUseCamera] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [disassemblyVideo, setDisassemblyVideo] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Google Maps deep-links for recyclers
  const recyclerMapLinks = {
    1: 'https://google.com/maps/search/Electronic+City+Phase+1+Bangalore',
    2: 'https://google.com/maps/search/Whitefield+Main+Rd+Bangalore',
    3: 'https://google.com/maps/search/Koramangala+4th+Block+Bangalore',
    4: 'https://google.com/maps/search/HSR+Layout+Sector+2+Bangalore',
    5: 'https://google.com/maps/search/Peenya+Industrial+Area+Bangalore',
  };

  useEffect(() => {
    if (isLocalIP()) {
      setError("LOCALHOST_REQUIRED");
      setUseCamera(false);
      return;
    }
    if (useCamera) startCamera();
    return () => stopCamera();
  }, [useCamera, facingMode]);

  const startCamera = async () => {
    setError(null);
    setUseCamera(true);
    
    // Cleanup old stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("BROWSER_UNSUPPORTED");
      setUseCamera(false);
      return;
    }

    // Attempt to start camera with a more resilient fallback chain
    const attempts = [
      { video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: facingMode } },
      { video: true }
    ];

    let lastErr = null;
    for (const constraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Ensure video plays
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn("Autoplay blocked, waiting for user interaction");
          }
          
          return; // Success!
        }
      } catch (err) {
        lastErr = err;
        console.warn(`Camera attempt with ${JSON.stringify(constraints)} failed:`, err.name);
      }
    }

    // Handle final failure
    if (lastErr?.name === 'NotAllowedError' || lastErr?.name === 'PermissionDeniedError') {
      setError("PERMISSION_DENIED");
    } else {
      setError("CAMERA_UNAVAILABLE");
    }
    setUseCamera(false);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    
    // Ensure video is actually playing and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Viewfinder initializing...");
      return;
    }

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

  // Fetch disassembly video when a valid scan result is detected
  useEffect(() => {
    if (scanResult && scanResult.name) {
      setDisassemblyVideo(null); // Reset video for new scan
      fetchDisassemblyVideo(scanResult.name).then(videoData => {
        if (videoData) setDisassemblyVideo(videoData);
      });
    }
  }, [scanResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  async function startScan(file, imageElement) {
    setScanning(true);
    setShowResults(false);
    setError(null);
    try {
      const result = await scanDeviceWithRetry(file);
      
      if (result && result.isElectronicDevice) {
        performScan(file, null, result);
        playScanComplete();
        setScanning(false);
        setShowResults(true);
      } else if (result && !result.isElectronicDevice) {
        setScanning(false);
        setError('NON-ELECTRONIC: The neural engine identified this as a non-electronic item. Please scan e-waste only.');
      } else {
        setScanning(false);
        setError('NEURAL MISMATCH: No device detected. Ensure the object is well-lit and centered.');
      }
    } catch (err) {
      setScanning(false);
      const msg = err.message || '';
      if (msg.includes("API key") || msg.includes("API_KEY") || msg.includes("key not valid")) {
        setError("API KEY ERROR: Your Gemini API key is invalid or expired. Update VITE_GEMINI_API_KEY in .env, then restart the dev server.");
      } else if (msg.includes("JSON") || msg.includes("position") || msg.includes("No JSON")) {
        setError("AI had trouble reading the image. Please retake in better lighting and try again.");
      } else if (msg.includes("quota") || msg.includes("429") || msg.includes("rate")) {
        setError("API rate limit hit. Wait a moment and try again.");
      } else {
        setError("Scan failed: " + (msg || 'Check your network connection.'));
      }
    }
  }

  const handleSubmitRecycling = async () => {
    setSubmitting(true);
    try {
      // Race against a timeout — Firestore may be offline
      const result = await Promise.race([
        submitRecycling(scanResult),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
      ]);
      setRewardData(result);
      setShowSuccess(true);
    } catch (err) {
      console.warn("Ledger commit:", err.message);
      // Even if Firestore fails, show success locally for demo
      const points = 100 + Math.round((scanResult?.co2Saved || 0) * 50);
      setRewardData({ points, newRank: Math.floor(Math.random() * 10) + 1 });
      setShowSuccess(true);
    }

    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#00ff88', '#00d4ff', '#ffffff', '#FFD700']
    });

    setSubmitting(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const langLabels = { en: 'English', hi: 'हिन्दी', kn: 'ಕನ್ನಡ' };
  const nearestRecyclers = recyclers.slice(0, 3);

  return (
    <div className="min-h-screen pt-8 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          
          <motion.div variants={fadeUp} className="text-center mb-6 sm:mb-10">
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black neon-text mb-4 tracking-tighter">{t('aiWasteIntelligence')}</h1>
            <p className="text-text-secondary max-w-xl mx-auto text-[10px] sm:text-xs uppercase font-bold tracking-[0.3em] opacity-60 px-4">{t('neuralNet')}</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {/* Viewfinder Section */}
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="glass-card overflow-hidden relative min-h-[450px] md:aspect-[4/3] flex flex-col border-white/10 rounded-3xl">
                <AnimatePresence mode="wait">
                  {useCamera && !preview ? (
                    <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex-grow bg-black rounded-3xl overflow-hidden">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                      
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Precision Corners */}
                        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-neon-green/60 rounded-tl-lg" />
                        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-neon-green/60 rounded-tr-lg" />
                        <div className="absolute bottom-24 left-8 w-8 h-8 border-b-2 border-l-2 border-neon-green/60 rounded-bl-lg" />
                        <div className="absolute bottom-24 right-8 w-8 h-8 border-b-2 border-r-2 border-neon-green/60 rounded-br-lg" />
                        
                        {/* Scanning HUD */}
                        <motion.div 
                          animate={{ top: ['15%', '70%', '15%'] }} 
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute left-8 right-8 h-[1px] bg-neon-green/40 shadow-[0_0_20px_rgba(0,255,136,0.8)]"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                      </div>

                      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 z-20 pb-4">
                        <div className="flex flex-col items-center gap-1 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                           <p className="text-neon-green text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">{t('scanningTarget')}</p>
                           <button onClick={() => window.location.reload()} className="text-[9px] text-white/60 hover:text-white transition-colors underline">{t('refreshApp')}</button>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-10 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                           <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-all shadow-lg backdrop-blur-md">🔄</button>
                           <button onClick={captureImage} className="group relative">
                              <div className="absolute inset-0 bg-neon-green rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                              <div className="w-20 h-20 rounded-full border-4 border-white/30 p-1 relative z-10 bg-black/20 backdrop-blur-md">
                                 <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-95 transition-transform">
                                   📷
                                 </div>
                              </div>
                           </button>
                           <button onClick={() => document.getElementById('global-file-input').click()} className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-all shadow-lg backdrop-blur-md">📁</button>
                        </div>
                      </div>
                    </motion.div>
                  ) : error ? (
                    <CameraErrorScreen 
                      error={error} 
                      onRetry={() => { setError(null); setUseCamera(true); }} 
                      onUpload={() => document.getElementById("hidden-file-input").click()} 
                      onSimulate={() => {
                        const demoId = devices[Math.floor(Math.random() * devices.length)].id;
                        performScan(null, demoId);
                        setShowResults(true);
                      }}
                    />
                  ) : (
                    <motion.div key="upload" {...getRootProps()} className="flex-grow flex flex-col items-center justify-center p-12 text-center cursor-pointer min-h-[400px]">
                      <input id="hidden-file-input" {...getInputProps()} />
                      {preview ? (
                        <div className="relative">
                          <img src={preview} alt="Preview" className="max-h-72 rounded-3xl shadow-2xl border border-white/10" />
                          <button onClick={(e) => { e.stopPropagation(); setPreview(null); setUseCamera(true); }} className="absolute -top-4 -right-4 bg-deep-dark border border-white/20 w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-xl">❌</button>
                        </div>
                      ) : (
                        <div className="group text-center">
                          <div className="w-24 h-24 rounded-3xl bg-[#00ffc0]/10 border border-[#00ffc0]/20 flex items-center justify-center text-5xl mb-8 mx-auto group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,192,0.3)] transition-all">
                            🔬
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                            {t('cameraReady')} <span className="text-[#00ffc0]">{t('ready')}</span>
                          </h3>
                          <p className="text-text-secondary text-sm mb-8 font-medium">
                            Hardware camera unavailable. Drop a device photo or use the AI Simulator to proceed.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const demoId = devices[Math.floor(Math.random() * devices.length)].id;
                                  performScan(null, demoId);
                                  setShowResults(true);
                                }} 
                                className="px-8 py-3 rounded-2xl bg-[#00ffc0] text-deep-dark font-black text-xs uppercase tracking-widest hover:scale-105 shadow-[0_0_20px_rgba(0,255,192,0.4)] transition-all"
                             >
                                ✨ {t('startSimulation')}
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setUseCamera(true); startCamera(); }} 
                                className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                             >
                                {t('retryCamera')}
                             </button>
                          </div>
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
                    <p className="text-white font-black text-2xl tracking-tighter mb-2 uppercase">AI  Detecting...</p>
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
          </div>

          {/* Analysis Section — Full Width Below Viewfinder */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
                {showResults && scanResult ? (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    
                    {scanResult._source === "fallback" && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-lg">⚡</div>
                          <p className="text-yellow-400 text-xs font-bold tracking-tight">AI unavailable — showing estimated data.</p>
                        </div>
                        {lastApiError && <p className="text-yellow-500/60 text-[10px] font-mono ml-11 break-all">DEBUG: {lastApiError}</p>}
                      </motion.div>
                    )}

                    {/* Header Card */}
                    <div className="rounded-2xl p-6 bg-[#111827] border border-[#00ffc0]/30 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00ffc0]/10 rounded-full blur-3xl" />
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${scanResult._source === 'fallback' ? 'bg-[#ffd700] text-[#0a0e1a]' : 'bg-[#00ffc0] text-[#0a0e1a]'}`}>
                              {scanResult._source === 'fallback' ? 'ESTIMATED' : 'AI VERIFIED'}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{scanResult.confidence}% CONFIDENCE</span>
                            {scanResult.rawAIClass && (
                              <span className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest border border-[#00d4ff]/30 px-2 py-0.5 rounded">Neural ID: {scanResult.rawAIClass}</span>
                            )}
                          </div>
                          <h3 className="font-display font-black text-3xl text-white tracking-tighter leading-none">{scanResult.name}</h3>
                        </div>
                        <SafetyBadge level={scanResult.safetyLevel} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{t('scrapRecoveryValue')}</p>
                          <p className="text-xl sm:text-2xl font-black text-white">₹{scanResult.estimatedValue} <span className="text-white/40 text-base sm:text-lg">-</span> ₹{Math.round(scanResult.estimatedValue * 2.3)}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#00ffc0]/[0.03] border border-[#00ffc0]/10 text-center">
                          <p className="text-[#00ffc0] text-[9px] font-black uppercase tracking-[0.2em] mb-1">{t('pointsAward')}</p>
                          <p className="text-xl sm:text-2xl font-black text-[#00ffc0]">+{calculatePoints(scanResult)}</p>
                        </div>
                      </div>
                    </div>

                    {/* ═══ THREE-COLUMN GRID ═══ */}
                    <div className="grid lg:grid-cols-3 gap-6">

                      {/* COLUMN 1 — Material Matrix */}
                      <div className="rounded-2xl p-6 bg-[#111827] border border-white/10">
                        <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,1)]" />
                          {t('materialMatrix')}
                        </h4>
                        <div className="space-y-5">
                          {scanResult.materials.map((m, i) => (
                            <MaterialBar key={m.name} mat={m} delay={i * 0.1} />
                          ))}
                        </div>
                        {scanResult.toxicMaterials && scanResult.toxicMaterials.length > 0 && (
                          <div className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">⚠️ Hazardous Materials</p>
                            <div className="flex flex-wrap gap-2">
                              {scanResult.toxicMaterials.map(t => (
                                <span key={t} className="text-[10px] font-bold text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* COLUMN 2 — Disassembly Guide */}
                      <div className="rounded-2xl p-6 bg-[#111827] border border-white/10">
                        <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,1)]" />
                          {t('disassemblyGuide')}
                        </h4>
                        <div className="space-y-3">
                          {(scanResult.disassembly?.[selectedLang] || scanResult.disassemblySteps?.map((text, i) => ({ step: i + 1, text, hazard: String(text).includes('⚠️') })) || []).map((step, i) => {
                            const isActive = i === activeStep;
                            const stepText = step.text || step;
                            const isHazard = step.hazard || String(stepText).includes('⚠️');
                            return (
                              <motion.div key={i} onClick={() => setActiveStep(i)}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isActive ? (isHazard ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-[#00ffc0]/5 border-[#00ffc0]/40 shadow-[0_0_15px_rgba(0,255,192,0.1)]') : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-80'}`}
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${isHazard ? 'bg-red-500/20 text-red-400' : isActive ? 'bg-[#00ffc0]/20 text-[#00ffc0]' : 'bg-white/5 text-white/40'}`}>
                                  {isHazard ? '⚠️' : step.step || i + 1}
                                </div>
                                <p className={`text-xs font-medium leading-relaxed ${isHazard ? 'text-red-400' : isActive ? 'text-white' : 'text-white/60'}`}>
                                  {stepText}
                                </p>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Real-time YouTube Video Link */}
                        {disassemblyVideo && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4 pt-4 border-t border-white/5">
                            <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{t('videoTutorial')}</h5>
                            <a href={disassemblyVideo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#ff0000]/50 hover:bg-[#ff0000]/10 transition-all group">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black relative">
                                {disassemblyVideo.thumbnail ? (
                                  <img src={disassemblyVideo.thumbnail} alt="thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#ff0000] text-xl">▶</div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                                  <div className="w-5 h-5 bg-[#ff0000] rounded-full flex items-center justify-center text-[8px] pl-[1px]">▶</div>
                                </div>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-bold text-white truncate">{disassemblyVideo.title}</p>
                                <p className="text-[9px] text-gray-400">{disassemblyVideo.uploader}</p>
                              </div>
                            </a>
                          </motion.div>
                        )}
                      </div>

                      {/* COLUMN 3 — Recycler Network + Confirm */}
                      <div className="space-y-6">
                        {true && (
                          <div className="rounded-2xl p-6 bg-[#111827] border border-white/10">
                            <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_rgba(0,255,136,1)]" />
                              {t('nearestRecyclers')}
                            </h4>
                          <div className="space-y-3">
                            {nearestRecyclers.map((r, i) => (
                              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00ffc0]/30 transition-all group"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-black text-white text-xs tracking-tight group-hover:text-[#00ffc0] transition-colors">{r.name}</h5>
                                    <p className="text-gray-500 text-[10px] mt-0.5">{r.address}</p>
                                  </div>
                                  <a href={recyclerMapLinks[r.id]} target="_blank" rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-[#00ffc0]/10 border border-[#00ffc0]/30 flex items-center justify-center text-sm hover:bg-[#00ffc0]/20 hover:scale-110 transition-all shrink-0 ml-2" title="Navigate">
                                    📍
                                  </a>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#00ffc0] font-black text-xs">{r.distance}</span>
                                    <span className="text-yellow-400 text-[10px]">★ {r.rating}</span>
                                    {r.certified && <span className="text-[9px] font-bold text-[#00ffc0]/60 uppercase">✓ Certified</span>}
                                  </div>
                                </div>
                                <div className="flex gap-3 mt-2 text-[10px] font-bold text-white/50">
                                  {Object.entries(r.rates).map(([mat, rate]) => (
                                    <span key={mat}>{mat}: <strong className="text-white/80">₹{rate}/kg</strong></span>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                            </div>
                          </div>
                        )}

                        {/* Confirm Recycling */}
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="rounded-2xl p-6 bg-gradient-to-br from-[#00ffc0]/15 to-transparent border border-[#00ffc0]/30">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#00ffc0] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,255,136,0.4)]">♻️</div>
                            <div>
                              <h4 className="font-black text-white text-base tracking-tighter">Ready to process?</h4>
                              <p className="text-xs text-gray-400">Earn {calculatePoints(scanResult)} pts & save {scanResult.co2Saved}kg CO₂</p>
                            </div>
                          </div>
                          <button onClick={handleSubmitRecycling} disabled={submitting} className="w-full py-4 rounded-xl bg-[#00ffc0] text-[#0a0e1a] font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                            {submitting ? t('submitting') : t('submitForRecycling')}
                          </button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Carbon Impact Ticker */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      className="rounded-xl p-3 bg-[#111827] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-[#00ffc0] uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00ffc0] animate-pulse" /> {calculatePoints(scanResult)} Points Potential
                        </span>
                        <span className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest">{scanResult.co2Saved}kg CO₂ Reduction</span>
                        <span className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest">Status: Ready to Process</span>
                      </div>
                      <div className="h-1 flex-1 max-w-[200px] bg-white/5 rounded-full overflow-hidden ml-4">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-[#00ffc0] to-[#00d4ff] rounded-full" />
                      </div>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

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

          {/* Hidden Global File Input for the Folder Button */}
          <input 
            type="file" 
            id="global-file-input" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onDrop(Array.from(e.target.files));
              }
            }} 
          />
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </div>
    </div>
  );
}
