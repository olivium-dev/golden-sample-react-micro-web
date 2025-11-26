// Polyfill process BEFORE any other imports
import process from 'process/browser';
(window as any).process = process;
(window as any).global = window;

// Ensure process.env is available with Firebase config
if (!(window as any).process.env) {
  (window as any).process.env = {
    NODE_ENV: 'development',
    REACT_APP_FIREBASE_API_KEY: "AIzaSyA3Hy9lztHYQXqkViAONm9UXIWHq2OGscA",
    REACT_APP_FIREBASE_AUTH_DOMAIN: "creamati.firebaseapp.com",
    REACT_APP_FIREBASE_PROJECT_ID: "creamati",
    REACT_APP_FIREBASE_STORAGE_BUCKET: "creamati.firebasestorage.app",
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: "84649081999",
    REACT_APP_FIREBASE_APP_ID: "1:84649081999:android:b7f05dc7d0e702c833c4fa"
  };
}

// Bootstrap pattern for Module Federation
import('./bootstrap');
