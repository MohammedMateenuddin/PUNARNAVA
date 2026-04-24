import { createContext, useContext, useState, useCallback } from 'react';
import { devices, globalStats as initStats } from '../data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const mode = currentUser?.role || 'user'; // 'user' | 'recycler'
  const setMode = () => {}; // dummy

  const [demoMode, setDemoMode] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [globalStats, setGlobalStats] = useState(initStats);
  const [language, setLanguage] = useState('en');

  const getRandomDevice = useCallback(() => {
    const d = devices[Math.floor(Math.random() * devices.length)];
    const valueRange = d.value.max - d.value.min;
    const estimatedValue = Math.round(d.value.min + Math.random() * valueRange);
    const co2 = +(d.co2Saved * (0.9 + Math.random() * 0.2)).toFixed(1);
    const conf = Math.min(99, Math.max(80, d.confidence + Math.floor(Math.random() * 8 - 4)));
    return { ...d, estimatedValue, co2Saved: co2, confidence: conf, scannedAt: new Date().toISOString() };
  }, []);

  const performScan = useCallback((imageFile, specificDeviceId = null) => {
    let result;
    if (specificDeviceId) {
      const d = devices.find(x => x.id === specificDeviceId) || devices[0];
      const valueRange = d.value.max - d.value.min;
      const estimatedValue = Math.round(d.value.min + Math.random() * valueRange);
      const co2 = +(d.co2Saved * (0.9 + Math.random() * 0.2)).toFixed(1);
      const conf = Math.min(99, Math.max(80, d.confidence + Math.floor(Math.random() * 8 - 4)));
      result = { ...d, estimatedValue, co2Saved: co2, confidence: conf, scannedAt: new Date().toISOString() };
    } else {
      result = getRandomDevice();
    }

    setScanResult(result);
    setScanHistory(prev => [result, ...prev].slice(0, 20));
    setGlobalStats(prev => ({
      totalDevices: prev.totalDevices + 1,
      totalCO2: +(prev.totalCO2 + result.co2Saved).toFixed(1),
      totalValue: prev.totalValue + result.estimatedValue,
    }));
    return result;
  }, [getRandomDevice]);

  const loadDemoResult = useCallback((deviceId) => {
    const d = devices.find(x => x.id === deviceId) || devices[0];
    const estimatedValue = Math.round((d.value.min + d.value.max) / 2);
    const result = { ...d, estimatedValue, scannedAt: new Date().toISOString() };
    setScanResult(result);
    return result;
  }, []);

  return (
    <AppContext.Provider value={{
      mode, setMode, demoMode, setDemoMode,
      scanResult, setScanResult, scanHistory,
      globalStats, language, setLanguage,
      performScan, loadDemoResult, getRandomDevice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
