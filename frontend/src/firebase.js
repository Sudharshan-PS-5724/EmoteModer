import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBx7oBiH-y2RfAUrQ6T36xy_z1zaqu0_g",
  authDomain: "moodboard-me-chat.firebaseapp.com",
  projectId: "moodboard-me-chat",
  storageBucket: "moodboard-me-chat.firebasestorage.app",
  messagingSenderId: "525064474861",
  appId: "1:525064474861:web:bcfb48d991d4a4a773bce4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app; 