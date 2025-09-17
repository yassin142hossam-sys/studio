import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// =================================================================================
// IMPORTANT: REPLACE THIS WITH YOUR CUSTOMER'S FIREBASE PROJECT CONFIGURATION
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCq9z1-rZz28GhEXP07CJZSo6xbZmI2icU",
  authDomain: "studio-5968331546-377b8.firebaseapp.com",
  projectId: "studio-5968331546-377b8",
  storageBucket: "studio-5968331546-377b8.appspot.com",
  messagingSenderId: "1047403536331",
  appId: "1:1047403536331:web:430b3bfe40521fd3f4a04e"
};
// =================================================================================
// =================================================================================


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
