import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration from environment variables
// Helper function to clean authDomain (remove protocol if present)
const cleanAuthDomain = (domain: string): string => {
  if (!domain) return '';
  // Remove http:// or https:// if present
  return domain.replace(/^https?:\/\//, '').split('/')[0];
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: cleanAuthDomain(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || ''),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

// Validate that required Firebase config values are present
const missingVars: string[] = [];
if (!firebaseConfig.apiKey) missingVars.push('REACT_APP_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('REACT_APP_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingVars.push('REACT_APP_FIREBASE_PROJECT_ID');
if (!firebaseConfig.appId) missingVars.push('FIREBASE_APP_ID');

// Warn if authDomain looks incorrect (contains protocol or is not a Firebase domain)
const rawAuthDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '';
if (rawAuthDomain && (rawAuthDomain.startsWith('http://') || rawAuthDomain.startsWith('https://'))) {
  console.warn('⚠️ WARNING: REACT_APP_FIREBASE_AUTH_DOMAIN should not include protocol (http:// or https://)');
  console.warn('Current value:', rawAuthDomain);
  console.warn('Expected format: your-project.firebaseapp.com');
}
if (firebaseConfig.authDomain && !firebaseConfig.authDomain.includes('.firebaseapp.com') && !firebaseConfig.authDomain.includes('localhost')) {
  console.warn('⚠️ WARNING: REACT_APP_FIREBASE_AUTH_DOMAIN should typically be your-project.firebaseapp.com');
  console.warn('Current value:', firebaseConfig.authDomain);
}

// Check if using example/placeholder values
if (firebaseConfig.appId === '1:123456789:web:abc123def456' || firebaseConfig.appId.includes('123456789')) {
  console.error('⚠️ WARNING: Firebase App ID appears to be using example/placeholder value.');
  console.error('Please set FIREBASE_APP_ID to your actual Firebase App ID from Firebase Console.');
  missingVars.push('FIREBASE_APP_ID (currently using placeholder)');
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