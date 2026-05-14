import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// ═══════════════════════════════════════════════════════════════════════════
// Firebase Configuration
// Replace with your Firebase project credentials
// ═══════════════════════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyDI5UUicd6SFioCXFLlnsoyNymnJekC_3I",
  authDomain: "huzaifa-productivity.firebaseapp.com",
  databaseURL: "https://huzaifa-productivity-default-rtdb.firebaseio.com",
  projectId: "huzaifa-productivity",
  storageBucket: "huzaifa-productivity.firebasestorage.app",
  messagingSenderId: "267773997235",
  appId: "1:267773997235:web:618742cecf8cbc2afb80c6",
  measurementId: "G-KQNT7BSWZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Database and Auth
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;
