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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCBqiELZcS0Aw2qEqYxJdXzYqVx8Zw8fZ0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "saawt-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "saawt-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "saawt-app.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "111180020195242483280",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:111180020195242483280:web:8c9e5f3a4b2d1e6f7a8b9c"
};

// Debug: Log the actual API key being used (first 20 chars only for security)
console.log('🔑 Firebase API Key being used:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'NOT SET');
console.log('🏠 Firebase Auth Domain:', firebaseConfig.authDomain);

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Optional: Configure Google provider
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};

export type { User };

