import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import axios from 'axios';
import { api, User as BackendUser } from '../utils/api';

// Types
interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPhoneVerificationCode: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  token: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        setIsAuthenticated(true);
        
        // Get the ID token
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        
        // Set up axios interceptor for token
        axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
        
        // Get user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: userData.username,
              firstName: userData.firstName,
              lastName: userData.lastName,
              displayName: firebaseUser.displayName || '',
            });
          } else {
            // Create user document if it doesn't exist
            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user info
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
          });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Create user document in Firestore
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      // Create user in backend database
      try {
        const idToken = await firebaseUser.getIdToken();
        await api.createUser({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: email.split('@')[0], // Use email prefix as username
          first_name: firstName,
          last_name: lastName,
        }, idToken);
      } catch (backendError) {
        console.error('Failed to create user in backend:', backendError);
        // Don't throw error here as Firebase auth was successful
      }
      
      // Note: User will be automatically signed in after successful signup
      // The onAuthStateChanged listener will handle the state update
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Extract name from Google profile
      const displayName = firebaseUser.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create user in backend database if doesn't exist
      try {
        const idToken = await firebaseUser.getIdToken();
        // Try to get user first
        try {
          await api.getUser(firebaseUser.uid, idToken);
        } catch (getUserError: any) {
          // User doesn't exist, create them
          if (getUserError.message.includes('not found') || getUserError.message.includes('404')) {
            await api.createUser({
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              username: firebaseUser.email?.split('@')[0] || '',
              first_name: firstName,
              last_name: lastName,
            }, idToken);
          }
        }
      } catch (backendError) {
        console.error('Failed to create user in backend:', backendError);
        // Don't throw error here as Firebase auth was successful
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const sendPhoneVerificationCode = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string) => {
    try {
      const result = await confirmationResult.confirm(code);
      const firebaseUser = result.user;
      
      // Create user in backend database if doesn't exist
      try {
        const idToken = await firebaseUser.getIdToken();
        // Try to get user first
        try {
          await api.getUser(firebaseUser.uid, idToken);
        } catch (getUserError: any) {
          // User doesn't exist, create them
          if (getUserError.message.includes('not found') || getUserError.message.includes('404')) {
            await api.createUser({
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email || firebaseUser.phoneNumber || '',
              username: firebaseUser.phoneNumber?.replace(/[^0-9]/g, '') || '',
              first_name: '',
              last_name: '',
            }, idToken);
          }
        }
      } catch (backendError) {
        console.error('Failed to create user in backend:', backendError);
        // Don't throw error here as Firebase auth was successful
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    firebaseUser,
    login,
    signup,
    loginWithGoogle,
    sendPhoneVerificationCode,
    verifyPhoneCode,
    logout,
    resetPassword,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 