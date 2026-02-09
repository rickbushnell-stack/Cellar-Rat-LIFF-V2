import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const getEnv = (key: string) => (process.env[key] || "").trim();

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;

try {
  // Only attempt initialization if essential config is present
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app);
    console.log("Firebase & Firestore connected successfully.");
  } else {
    console.warn("Firebase configuration missing. Database features will be unavailable.");
  }
} catch (error) {
  console.error("Firebase startup error:", error);
}

// Export the db instance. Components should handle cases where db is undefined.
export const db = dbInstance as Firestore;