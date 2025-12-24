import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

// Validate that required Firebase config values are present
const missingVars: string[] = [];
if (!firebaseConfig.apiKey) missingVars.push('REACT_APP_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('REACT_APP_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingVars.push('REACT_APP_FIREBASE_PROJECT_ID');
if (!firebaseConfig.appId) missingVars.push('REACT_APP_FIREBASE_APP_ID');

// Check if using example/placeholder values
if (firebaseConfig.appId === '1:123456789:web:abc123def456' || firebaseConfig.appId.includes('123456789')) {
  console.error('⚠️ WARNING: Firebase App ID appears to be using example/placeholder value.');
  console.error('Please set REACT_APP_FIREBASE_APP_ID to your actual Firebase App ID from Firebase Console.');
  missingVars.push('REACT_APP_FIREBASE_APP_ID (currently using placeholder)');
}

if (missingVars.length > 0) {
  console.error('Missing or invalid Firebase environment variables. Please set:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  throw new Error(`Firebase configuration is incomplete. Missing: ${missingVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Firebase Analytics (only in browser environment and if measurementId is provided)
export const analytics: Analytics | null = 
  typeof window !== 'undefined' && firebaseConfig.measurementId 
    ? getAnalytics(app) 
    : null;

export default app; 