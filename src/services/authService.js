import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

// ═══════════════════════════════════════════════════════════════════════════
// Firebase Authentication Helper
// Use this to manage user auth for sync system
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} User auth result
 */
export async function registerUser(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User registered:', result.user.uid);
    return {
      success: true,
      userId: result.user.uid,
      email: result.user.email
    };
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} User auth result
 */
export async function loginUser(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User logged in:', result.user.uid);
    return {
      success: true,
      userId: result.user.uid,
      email: result.user.email
    };
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Logout current user
 * @returns {Promise} Logout result
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log('✅ User logged out');
    return { success: true };
  } catch (error) {
    console.error('❌ Logout failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Listen to authentication state changes
 * Use this to update your app when user logs in/out
 * @param {function} callback - Called with (user) when auth state changes
 * @returns {function} Unsubscribe function
 */
export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('👤 User authenticated:', user.uid);
      callback({
        authenticated: true,
        userId: user.uid,
        email: user.email
      });
    } else {
      console.log('👤 User not authenticated');
      callback({
        authenticated: false,
        userId: null,
        email: null
      });
    }
  });
}

/**
 * Get current user ID (for use in sync functions)
 * @returns {string|null} Current user ID or null
 */
export function getCurrentUserId() {
  const user = auth.currentUser;
  return user ? user.uid : null;
}

/**
 * Get current user email
 * @returns {string|null} Current user email or null
 */
export function getCurrentUserEmail() {
  const user = auth.currentUser;
  return user ? user.email : null;
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  listenToAuthState,
  getCurrentUserId,
  getCurrentUserEmail
};
