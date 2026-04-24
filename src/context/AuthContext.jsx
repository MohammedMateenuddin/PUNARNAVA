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
  const [loading, setLoading] = useState(true);

  // Helper to store/update user profile in Firestore
  const saveUserRole = async (user, role, provider, providedName = '') => {
    if (!db) return;

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    const baseData = {
      uid: user.uid,
      displayName: providedName || user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: role || 'user',
      loginProvider: provider,
      lastSeen: serverTimestamp(),
    };

    if (!docSnap.exists()) {
      // First time login - set default stats
      await setDoc(userRef, {
        ...baseData,
        totalPoints: 0,
        devicesRecycled: 0,
        co2Saved: 0,
        rank: null,
        badge: "Eco Starter",
        joinedAt: serverTimestamp(),
      });
    } else {
      // Subsequent login - only update volatile fields
      await setDoc(userRef, {
        displayName: baseData.displayName,
        photoURL: baseData.photoURL,
        lastSeen: baseData.lastSeen,
        loginProvider: baseData.loginProvider
      }, { merge: true });
    }
  };

  const updateUserProfile = async (newName) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      if (db) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: newName
        }, { merge: true });
      }
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
    let points = 100; // Base points
    points += Math.round((scanResult.co2Saved || 0) * 50); // 50 per kg CO2
    if (scanResult.estimatedValue > 500) points += 200; // Value bonus
    
    // Daily streak bonus logic
    const lastScan = currentUser?.lastScanDate?.toDate() || new Date(0);
    const today = new Date();
    if (lastScan.toDateString() !== today.toDateString()) {
      points += 150;
    }
    
    return points;
  };

  const submitRecycling = async (scanResult) => {
    if (!auth.currentUser || !db) return;
    
    const points = calculatePoints(scanResult);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    try {
      // 1. Add to submissions subcollection
      const subRef = doc(collection(userRef, 'submissions'));
      await setDoc(subRef, {
        ...scanResult,
        points,
        createdAt: serverTimestamp()
      });

      // 2. Update user stats
      await setDoc(userRef, {
        totalPoints: increment(points),
        devicesRecycled: increment(1),
        co2Saved: increment(scanResult.co2Saved || 0),
        totalValue: increment(scanResult.estimatedValue || 0),
        lastScanDate: serverTimestamp()
      }, { merge: true });

      // 3. Recalculate rank (count users with more points)
      const q = query(collection(db, 'users'), where('totalPoints', '>', (currentUser?.totalPoints || 0) + points));
      const morePointsSnap = await getDocs(q);
      const newRank = morePointsSnap.size + 1;

      // 4. Update rank and badge
      await setDoc(userRef, {
        globalRank: newRank,
        badge: getBadgeTier((currentUser?.totalPoints || 0) + points)
      }, { merge: true });

      return { points, newRank };
    } catch (err) {
      console.error("Submission error:", err);
      throw err;
    }
  };

  // Helper to fetch user role
  const getUserData = async (user) => {
    if (db) {
      try {
        const docRef = doc(db, 'users', user.uid);
        // Fast timeout to ensure we don't hang on login
        const docSnap = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        if (docSnap.exists()) return docSnap.data();
      } catch (err) {
        console.warn("Firestore read error/timeout:", err.message);
      }
    }
    const localRole = localStorage.getItem(`userRole_${user.uid}`) || 'user';
    return {
      uid: user.uid,
      name: user.displayName || user.phoneNumber || 'User',
      email: user.email || '',
      role: localRole,
      loginProvider: 'unknown'
    };
  };

  // Mock Fallback
  const mockLogin = (role) => {
    const mockUser = { uid: 'mock-uid-123', name: 'Mock User', email: 'mock@demo.com', role, loginProvider: 'mock' };
    setCurrentUser(mockUser);
    localStorage.setItem('mockSession', JSON.stringify(mockUser));
    return Promise.resolve();
  };

  // Login Methods
  const loginWithGoogle = async (role) => {
    if (!auth) return mockLogin(role);
    const result = await signInWithPopup(auth, googleProvider);
    const userData = await saveUserRole(result.user, role, 'google');
    setCurrentUser(userData);
  };

  const loginWithGithub = async (role) => {
    if (!auth) return mockLogin(role);
    const result = await signInWithPopup(auth, githubProvider);
    const userData = await saveUserRole(result.user, role, 'github');
    setCurrentUser(userData);
  };

  const loginWithEmail = async (email, password, role, isSignUp = false, name = '') => {
    if (!auth) {
      if (email === 'demo@punarnava.com' && password === 'demo1234') {
        return mockLogin(role);
      } else {
        throw new Error('auth/invalid-credential');
      }
    }
    let result;
    if (isSignUp) {
      result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
    } else {
      result = await signInWithEmailAndPassword(auth, email, password);
    }
    const userData = await saveUserRole(result.user, role, 'email', name);
    setCurrentUser(userData);
  };

  const resetPassword = async (email) => {
    if (!auth) return Promise.resolve();
    return sendPasswordResetEmail(auth, email);
  };

  const setupRecaptcha = (buttonId) => {
    if (!auth) return null;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible'
      });
      return window.recaptchaVerifier;
    } catch(err) {
      console.warn("Recaptcha error:", err);
      return null;
    }
  };

  const loginWithPhone = async (phoneNumber, appVerifier) => {
    if (!auth) {
      window.mockConfirmationResult = { confirm: () => Promise.resolve({ user: { uid: 'phone-mock' } }) };
      return window.mockConfirmationResult;
    }
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  };

  const verifyPhoneOTP = async (otp, role) => {
    if (!auth) return mockLogin(role);
    const confirmationResult = window.confirmationResult || window.mockConfirmationResult;
    const result = await confirmationResult.confirm(otp);
    const userData = await saveUserRole(result.user, role, 'phone');
    setCurrentUser(userData);
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem('mockSession');
    setCurrentUser(null);
  };

  useEffect(() => {
    if (!auth) {
      const mockSession = localStorage.getItem('mockSession');
      if (mockSession) setCurrentUser(JSON.parse(mockSession));
      setLoading(false);
      return;
    }

    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Start real-time profile listener
        unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setCurrentUser({ ...user, ...doc.data() });
          } else {
            // Fallback if doc doesn't exist yet (e.g. still creating)
            setCurrentUser(user);
          }
          setLoading(false);
        }, (err) => {
          console.warn("Profile listener error:", err);
          setCurrentUser(user);
          setLoading(false);
        });
      } else {
        unsubscribeProfile();
        setCurrentUser(null);
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
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    setupRecaptcha,
    loginWithPhone,
    verifyPhoneOTP,
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
