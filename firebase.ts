
// Force Sync Update: 2025-02-21
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Helper to safely trim environment variables
const getEnv = (key: string) => (process.env[key] || "").trim();

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

// Fix for modular Firebase initialization: Ensure app is only initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export the Firestore database instance
export const db = getFirestore(app);
