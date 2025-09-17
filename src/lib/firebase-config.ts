import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "studio-5968331546-377b8",
  appId: "1:1047403536331:web:430b3bfe40521fd3f4a04e",
  storageBucket: "studio-5968331546-377b8.firebasestorage.app",
  apiKey: "AIzaSyCq9z1-rZz28GhEXP07CJZSo6xbZmI2icU",
  authDomain: "studio-5968331546-377b8.firebaseapp.com",
  messagingSenderId: "1047403536331",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
