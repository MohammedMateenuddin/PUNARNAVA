import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, db, googleProvider, githubProvider,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
  doc, setDoc, getDoc, onSnapshot, serverTimestamp, increment, collection, getDocs, query, where, orderBy, limit
} from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'user' | 'recycler' — immutable after login
  const [loading, setLoading] = useState(true);

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  const saveUserRole = async (user, selectedRole, provider, providedName = '') => {
    if (!db) return;

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    const baseData = {
      uid: user.uid,
      displayName: providedName || user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: selectedRole,
      loginProvider: provider,
      lastSeen: serverTimestamp(),
    };

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        ...baseData,
        totalPoints: 0,
        devicesRecycled: 0,
        co2Saved: 0,
        totalValue: 0,
        rank: null,
        badge: "Eco Starter",
        createdAt: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, {
        displayName: baseData.displayName,
        photoURL: baseData.photoURL,
        lastSeen: baseData.lastSeen,
        loginProvider: baseData.loginProvider,
        role: selectedRole, // Always update role on login
      }, { merge: true });
    }
  };

  const updateUserProfile = async (newName) => {
    if (!auth?.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      if (db) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: newName
        }, { merge: true });
      }
      setCurrentUser(prev => ({ ...prev, displayName: newName }));
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  };

  const getBadgeTier = (points) => {
    if (points >= 4000) return "Eco Legend";
    if (points >= 2000) return "Urban Miner";
    if (points >= 1000) return "Circuit Sage";
    if (points >= 500) return "Green Guardian";
    if (points >= 200) return "Eco Warrior";
    return "Eco Starter";
  };

  const calculatePoints = (scanResult) => {
    let points = 100;
    points += Math.round((scanResult.co2Saved || 0) * 50);
    if (scanResult.estimatedValue > 500) points += 200;
    
    let lastScan = new Date(0);
    if (currentUser?.lastScanDate) {
      if (typeof currentUser.lastScanDate.toDate === 'function') {
        lastScan = currentUser.lastScanDate.toDate();
      } else {
        lastScan = new Date(currentUser.lastScanDate);
      }
    }
    
    const today = new Date();
    if (lastScan.toDateString() !== today.toDateString()) {
      points += 150;
    }
    
    return points;
  };

  const submitRecycling = async (scanResult) => {
    const points = calculatePoints(scanResult);
    
    // Optimistic UI update
    const updatedUser = {
      ...currentUser,
      totalPoints: (currentUser?.totalPoints || 0) + points,
      devicesRecycled: (currentUser?.devicesRecycled || 0) + 1,
      co2Saved: (currentUser?.co2Saved || 0) + (scanResult.co2Saved || 0),
      totalValue: (currentUser?.totalValue || 0) + (scanResult.estimatedValue || 0),
      lastScanDate: new Date(),
      globalRank: Math.floor(Math.random() * 10) + 1,
      badge: getBadgeTier((currentUser?.totalPoints || 0) + points)
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('punarnava_session', JSON.stringify(updatedUser));
    
    if (!auth?.currentUser || !db) {
      return { points, newRank: updatedUser.globalRank };
    }
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    try {
      const subRef = doc(collection(userRef, 'submissions'));
      await setDoc(subRef, {
        ...scanResult,
        points,
        createdAt: serverTimestamp()
      });

      await setDoc(userRef, {
        totalPoints: increment(points),
        devicesRecycled: increment(1),
        co2Saved: increment(scanResult.co2Saved || 0),
        totalValue: increment(scanResult.estimatedValue || 0),
        lastScanDate: serverTimestamp()
      }, { merge: true });

      const q = query(collection(db, 'users'), where('totalPoints', '>', updatedUser.totalPoints));
      const morePointsSnap = await getDocs(q);
      const newRank = morePointsSnap.size + 1;

      await setDoc(userRef, {
        globalRank: newRank,
        badge: getBadgeTier(updatedUser.totalPoints)
      }, { merge: true });

      setCurrentUser(prev => ({ ...prev, globalRank: newRank }));

      return { points, newRank };
    } catch (err) {
      console.error("Submission error:", err);
      throw err;
    }
  };

  // ══════════════════════════════════════════════
  // MOCK FALLBACK
  // ══════════════════════════════════════════════

  const mockLogin = (selectedRole) => {
    const mockUser = {
      uid: 'demo-user-123',
      displayName: selectedRole === 'recycler' ? 'GreenTech Recyclers' : 'Demo User',
      email: selectedRole === 'recycler' ? 'info@greentech.com' : 'demo@punarnava.com',
      role: selectedRole,
      loginProvider: 'demo',
      totalPoints: selectedRole === 'user' ? 1250 : 0,
      devicesRecycled: selectedRole === 'user' ? 14 : 87,
      co2Saved: selectedRole === 'user' ? 32.5 : 245,
      totalValue: selectedRole === 'user' ? 8450 : 125000,
      badge: selectedRole === 'user' ? getBadgeTier(1250) : 'N/A',
      globalRank: selectedRole === 'user' ? 7 : null,
      createdAt: new Date().toISOString(),
      subscription: selectedRole === 'recycler' ? { plan: 'Enterprise Matrix', expiresAt: new Date(Date.now() + 14 * 86400000).toISOString() } : null,
    };
    setCurrentUser(mockUser);
    setRole(selectedRole);
    localStorage.setItem('punarnava_role', selectedRole);
    localStorage.setItem('punarnava_session', JSON.stringify(mockUser));
    return Promise.resolve();
  };

  // ══════════════════════════════════════════════
  // LOGIN METHODS — role is permanently set here
  // ══════════════════════════════════════════════
  
  const isMobile = () => /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const loginWithGoogle = async (selectedRole) => {
    if (!auth) return mockLogin(selectedRole);
    localStorage.setItem('punarnava_role', selectedRole);
    
    try {
      if (isMobile()) {
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        saveUserRole(result.user, selectedRole, 'google').catch(err => console.error("BG Sync Error:", err));
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      throw err;
    }
  };

  const loginWithGithub = async (selectedRole) => {
    if (!auth) return mockLogin(selectedRole);
    localStorage.setItem('punarnava_role', selectedRole);
    
    try {
      if (isMobile()) {
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, githubProvider);
      } else {
        const result = await signInWithPopup(auth, githubProvider);
        saveUserRole(result.user, selectedRole, 'github').catch(err => console.error("BG Sync Error:", err));
      }
    } catch (err) {
      console.error("Github Auth Error:", err);
      throw err;
    }
  };

  const loginWithEmail = async (email, password, selectedRole, isSignUp = false, name = '') => {
    if (!auth) {
      if (email === 'demo@punarnava.com' && password === 'demo1234') {
        return mockLogin(selectedRole);
      } else {
        throw new Error('auth/invalid-credential');
      }
    }
    let result;
    if (isSignUp) {
      result = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      result = await signInWithEmailAndPassword(auth, email, password);
    }
    localStorage.setItem('punarnava_role', selectedRole);
    await saveUserRole(result.user, selectedRole, 'email', name);
  };

  const resetPassword = async (email) => {
    if (!auth) return Promise.resolve();
    const { sendPasswordResetEmail } = await import('firebase/auth');
    return sendPasswordResetEmail(auth, email);
  };

  // ══════════════════════════════════════════════
  // LOGOUT — clears role completely
  // ══════════════════════════════════════════════

  const logout = async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem('punarnava_role');
    localStorage.removeItem('punarnava_session');
    localStorage.removeItem('mockSession');
    setCurrentUser(null);
    setRole(null);
  };

  // ══════════════════════════════════════════════
  // AUTH STATE LISTENER
  // ══════════════════════════════════════════════

  useEffect(() => {
    if (!auth) {
      // Demo / mock mode
      const savedSession = localStorage.getItem('punarnava_session');
      const savedRole = localStorage.getItem('punarnava_role');
      if (savedSession && savedRole) {
        setCurrentUser(JSON.parse(savedSession));
        setRole(savedRole);
      }
      setLoading(false);
      return;
    }

    // Handle Redirect Results (for mobile)
    const handleRedirect = async () => {
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const selectedRole = localStorage.getItem('punarnava_role') || 'user';
          await saveUserRole(result.user, selectedRole, 'google');
        }
      } catch (err) {
        console.error("Redirect Result Error:", err);
      }
    };
    handleRedirect();

    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // INSTANT: Set user and fallback role immediately
        const fallbackRole = localStorage.getItem('punarnava_role') || 'user';
        setRole(fallbackRole);
        setCurrentUser(prev => prev?.uid === user.uid ? prev : { ...user, role: fallbackRole });
        setLoading(false); // Resolve loading IMMEDIATELY

        // BACKGROUND: Read role from Firestore to ensure sync
        getDoc(doc(db, 'users', user.uid)).then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            const resolvedRole = data.role || fallbackRole;
            setRole(resolvedRole);
            setCurrentUser(prev => ({ ...prev, ...data, role: resolvedRole }));
          }
        }).catch(err => console.warn("Role fetch error:", err.message));

        // Background: live sync profile
        try {
          unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
              setCurrentUser(prev => ({ ...prev, ...snap.data() }));
            }
          }, (err) => {
            console.warn("Profile sync skipped:", err.message);
          });
        } catch (e) {
          console.warn("Firestore listener failed:", e.message);
        }

        setLoading(false);
      } else {
        unsubscribeProfile();
        setCurrentUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const value = {
    currentUser,
    role,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    logout,
    resetPassword,
    updateUserProfile,
    calculatePoints,
    submitRecycling,
    getBadgeTier,
    isDemo: !auth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
