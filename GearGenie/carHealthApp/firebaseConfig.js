// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBv6Hj9KKzS2azZfxsIj7DMuxkIp0x-fz8",
  authDomain: "tekion-a6b95.firebaseapp.com",
  projectId: "tekion-a6b95",
  storageBucket: "tekion-a6b95.firebasestorage.app",
  messagingSenderId: "905316982744",
  appId: "1:905316982744:web:2f54343d3ff5801ae8dcad",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firestore + Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
