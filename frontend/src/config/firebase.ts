import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY8EvZa4Ttwh93RxLftRzGjPeLlGkUTVA",
  authDomain: "parenticai-auth.firebaseapp.com",
  projectId: "parenticai-auth",
  storageBucket: "parenticai-auth.firebasestorage.app",
  messagingSenderId: "335828509209",
  appId: "1:335828509209:web:7bd7ceb1cb0afe92780088",
  measurementId: "G-HJMPS85E4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Firebase Analytics (only in browser environment)
export const analytics: Analytics | null = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 