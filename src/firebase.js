import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// ═══════════════════════════════════════════════════════════════════════════
// Firebase Configuration
// Replace with your Firebase project credentials
// ═══════════════════════════════════════════════════════════════════════════

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY";
console.log("Firebase API key loaded:", apiKey === "YOUR_API_KEY" ? apiKey : `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-app.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123xyz"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Database and Auth
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;
