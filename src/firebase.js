import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  getDocs,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

// Firebase config — reads from Vercel/Vite env vars first, falls back to defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBlpGJjge7yfi0NoMRfnlq_2AkiW-Gg0rE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "punarnava-1cf89.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "punarnava-1cf89",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "punarnava-1cf89.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "51229171731",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:51229171731:web:b32386bce5b1ec0bcc1fe6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XSPXTFYDE1"
};

let app, auth, db, googleProvider, githubProvider;

try {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    throw new Error("Using placeholder Firebase config.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  window.db = db;
  googleProvider = new GoogleAuthProvider();
  githubProvider = new GithubAuthProvider();
  auth.useDeviceLanguage();
} catch (error) {
  console.warn("Firebase initialization skipped or failed. Using Mock Fallback mode.", error.message);
  app = null;
  auth = null;
  db = null;
}

export { 
  app, auth, db, 
  googleProvider, githubProvider,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged,
  sendEmailVerification, sendPasswordResetEmail, updateProfile,
  doc, setDoc, getDoc, onSnapshot, collection, query, where, orderBy, limit, serverTimestamp, increment, getDocs, deleteDoc, updateDoc
};
