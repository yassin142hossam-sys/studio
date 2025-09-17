import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// =================================================================================
// IMPORTANT: PASTE YOUR CUSTOMER'S FIREBASE PROJECT CONFIGURATION HERE
// =================================================================================
const firebaseConfig = {
  apiKey: "PASTE_YOUR_CUSTOMER_API_KEY_HERE",
  authDomain: "PASTE_YOUR_CUSTOMER_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_CUSTOMER_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_CUSTOMER_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_CUSTOMER_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_CUSTOMER_APP_ID_HERE"
};
// =================================================================================
// =================================================================================


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
