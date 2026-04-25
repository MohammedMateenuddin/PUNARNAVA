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

// Replace these with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBlpGJjge7yfi0NoMRfnlq_2AkiW-Gg0rE",
  authDomain: "punarnava-1cf89.firebaseapp.com",
  projectId: "punarnava-1cf89",
  storageBucket: "punarnava-1cf89.firebasestorage.app",
  messagingSenderId: "51229171731",
  appId: "1:51229171731:web:b32386bce5b1ec0bcc1fe6",
  measurementId: "G-XSPXTFYDE1"
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
