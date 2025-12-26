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

// Helper function to ensure user exists in backend database with all required attributes
async function ensureUserInBackend(firebaseUser: FirebaseUser, idToken: string): Promise<void> {
  try {
    // Step 1: Check if user exists in backend, create if not
    let userExists = false;
    try {
      await api.getUser(firebaseUser.uid, idToken);
      userExists = true;
    } catch (getUserError: any) {
      if (getUserError.message.includes('not found') || getUserError.message.includes('404')) {
        // Extract name from display name or email
        const displayName = firebaseUser.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await api.createUser({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email || firebaseUser.phoneNumber || '',
          username: firebaseUser.email?.split('@')[0] || firebaseUser.phoneNumber?.replace(/[^0-9]/g, '') || '',
          first_name: firstName,
          last_name: lastName,
        }, idToken);
        
        userExists = true;
      } else {
        throw getUserError;
      }
    }
    
    if (!userExists) return;
    
    // Step 2: Ensure parent profile exists
    try {
      await api.getParentProfile(firebaseUser.uid, idToken);
    } catch (getParentError: any) {
      if (getParentError.message.includes('not found') || getParentError.message.includes('404')) {
        await api.createParentProfile({
          age: undefined,
          location: undefined,
          parenting_style: undefined,
          concerns: undefined,
          goals: undefined,
          experience_level: undefined,
          family_structure: undefined,
        }, firebaseUser.uid, idToken);
      } else {
        console.error('Error checking parent profile:', getParentError);
      }
    }
    
    // Step 3: Ensure at least one child exists (sample child)
    try {
      const children = await api.getChildren(firebaseUser.uid, idToken);
      
      // Check if sample child already exists
      const hasSampleChild = children.some(child => child.name === 'Sample Child');
      
      if (children.length === 0 || !hasSampleChild) {
        await api.createChild({
          name: 'Sample Child',
          age: 5,
          gender: 'Other',
          hobbies: ['Reading', 'Drawing'],
          interests: ['Science', 'Art'],
          personality_traits: ['Curious', 'Creative'],
          school_grade: 'Kindergarten',
        }, firebaseUser.uid, idToken);
      }
    } catch (childrenError: any) {
      console.error('Error ensuring children exist:', childrenError);
    }
  } catch (error: any) {
    console.error('Error ensuring user exists in backend:', error);
    // Don't throw - allow login to continue even if backend operations fail
  }
}

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
        
        // Ensure user exists in backend database with all required attributes
        // This is a catch-all that works regardless of signup method
        await ensureUserInBackend(firebaseUser, idToken);
        
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
        
        // Create a parent profile first (required for creating children)
        try {
          await api.createParentProfile({
            age: undefined,
            location: undefined,
            parenting_style: undefined,
            concerns: undefined,
            goals: undefined,
            experience_level: undefined,
            family_structure: undefined,
          }, firebaseUser.uid, idToken);
        } catch (parentError) {
          console.error('Failed to create parent profile:', parentError);
          // Continue anyway - parent profile will be created when user fills profile
        }
        
        // Create a sample child for new users
        try {
          await api.createChild({
            name: 'Sample Child',
            age: 5,
            gender: 'Other',
            hobbies: ['Reading', 'Drawing'],
            interests: ['Science', 'Art'],
            personality_traits: ['Curious', 'Creative'],
            school_grade: 'Kindergarten',
          }, firebaseUser.uid, idToken);
        } catch (childError) {
          console.error('Failed to create sample child:', childError);
          // Don't throw error here as user creation was successful
        }
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
          
          // Create a parent profile first (required for creating children)
          try {
            await api.createParentProfile({
              age: undefined,
              location: undefined,
              parenting_style: undefined,
              concerns: undefined,
              goals: undefined,
              experience_level: undefined,
              family_structure: undefined,
            }, firebaseUser.uid, idToken);
          } catch (parentError: any) {
            console.error('Failed to create parent profile:', parentError);
          }
          
          // Create a sample child for new users
          try {
            await api.createChild({
              name: 'Sample Child',
              age: 5,
              gender: 'Other',
              hobbies: ['Reading', 'Drawing'],
              interests: ['Science', 'Art'],
              personality_traits: ['Curious', 'Creative'],
              school_grade: 'Kindergarten',
            }, firebaseUser.uid, idToken);
          } catch (childError: any) {
            console.error('Failed to create sample child:', childError);
          }
        }
        }
      } catch (backendError: any) {
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
          
          // Create a parent profile first (required for creating children)
          try {
            await api.createParentProfile({
              age: undefined,
              location: undefined,
              parenting_style: undefined,
              concerns: undefined,
              goals: undefined,
              experience_level: undefined,
              family_structure: undefined,
            }, firebaseUser.uid, idToken);
          } catch (parentError) {
            console.error('Failed to create parent profile:', parentError);
          }
          
          // Create a sample child for new users
          try {
            await api.createChild({
              name: 'Sample Child',
              age: 5,
              gender: 'Other',
              hobbies: ['Reading', 'Drawing'],
              interests: ['Science', 'Art'],
              personality_traits: ['Curious', 'Creative'],
              school_grade: 'Kindergarten',
            }, firebaseUser.uid, idToken);
          } catch (childError) {
            console.error('Failed to create sample child:', childError);
          }
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