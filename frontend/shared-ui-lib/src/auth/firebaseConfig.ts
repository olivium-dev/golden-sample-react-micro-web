/**
 * Firebase Client Configuration
 * Used for Google Sign-In and Email/Password authentication
 */
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

// Firebase configuration - webpack DefinePlugin will replace these at build time
// IMPORTANT: Do NOT use dynamic process.env checks - webpack needs to statically replace these
// The process.env.REACT_APP_* values below will be replaced with actual strings by webpack
// Using saawt-app project to match the Firebase Admin SDK on the backend
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA3Hy9lztHYQXqkViAONm9UXIWHq2OGscA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "creamati.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "creamati",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "creamati.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "84649081999",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:84649081999:android:b7f05dc7d0e702c833c4fa"
};

// Debug: Log the actual API key being used (first 20 chars only for security)
console.log('🔑 Firebase API Key being used:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'NOT SET');
console.log('🏠 Firebase Auth Domain:', firebaseConfig.authDomain);

// Initialize Firebase with HMR support
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Type declaration for HMR
declare const module: {
  hot?: {
    accept: (dependencies?: string | string[], callback?: () => void) => void;
  };
};

// Check if we're in HMR context and Firebase is already initialized
const isHMR = typeof module !== 'undefined' && module.hot;
const existingApps = typeof window !== 'undefined' && (window as any).__FIREBASE_APPS__;

function initializeFirebase() {
  try {
    // If HMR and Firebase already exists, reuse existing instances
    if (isHMR && existingApps) {
      console.log('🔄 HMR: Reusing existing Firebase instances');
      app = existingApps.app;
      auth = existingApps.auth;
      googleProvider = existingApps.googleProvider;
      return;
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Optional: Configure Google provider
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // Store instances for HMR
    if (typeof window !== 'undefined') {
      (window as any).__FIREBASE_APPS__ = { app, auth, googleProvider };
    }
    
    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

// Initialize Firebase
initializeFirebase();

// HMR acceptance
if (isHMR) {
  module.hot?.accept(undefined, () => {
    console.log('🔄 HMR: Firebase config updated');
    // Don't re-initialize Firebase on HMR, just log the update
  });
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};

export type { User as FirebaseUser };

