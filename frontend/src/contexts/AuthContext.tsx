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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'ensureUserInBackend called',data:{firebaseUid:firebaseUser.uid,hasEmail:!!firebaseUser.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  try {
    // Step 1: Check if user exists in backend, create if not
    let userExists = false;
    try {
      await api.getUser(firebaseUser.uid, idToken);
      userExists = true;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'User exists in backend',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (getUserError: any) {
      if (getUserError.message.includes('not found') || getUserError.message.includes('404')) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'User not found, creating user',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
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
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'User created in backend',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        userExists = true;
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Error checking user existence',data:{errorMessage:getUserError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        throw getUserError;
      }
    }
    
    if (!userExists) return;
    
    // Step 2: Ensure parent profile exists
    try {
      await api.getParentProfile(firebaseUser.uid, idToken);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Parent profile exists',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (getParentError: any) {
      if (getParentError.message.includes('not found') || getParentError.message.includes('404')) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Parent profile not found, creating',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        await api.createParentProfile({
          age: undefined,
          location: undefined,
          parenting_style: undefined,
          concerns: undefined,
          goals: undefined,
          experience_level: undefined,
          family_structure: undefined,
        }, firebaseUser.uid, idToken);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Parent profile created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Error checking parent profile',data:{errorMessage:getParentError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('Error checking parent profile:', getParentError);
      }
    }
    
    // Step 3: Ensure at least one child exists (sample child)
    try {
      const children = await api.getChildren(firebaseUser.uid, idToken);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Children fetched',data:{childrenCount:children.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Check if sample child already exists
      const hasSampleChild = children.some(child => child.name === 'Sample Child');
      
      if (children.length === 0 || !hasSampleChild) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'No children or sample child missing, creating sample child',data:{hasSampleChild,childrenCount:children.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        await api.createChild({
          name: 'Sample Child',
          age: 5,
          gender: 'Other',
          hobbies: ['Reading', 'Drawing'],
          interests: ['Science', 'Art'],
          personality_traits: ['Curious', 'Creative'],
          school_grade: 'Kindergarten',
        }, firebaseUser.uid, idToken);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Sample child created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Sample child already exists',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      }
    } catch (childrenError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Error fetching/creating children',data:{errorMessage:childrenError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error ensuring children exist:', childrenError);
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'ensureUserInBackend completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:ensureUserInBackend',message:'Error in ensureUserInBackend',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:60',message:'onAuthStateChanged fired',data:{hasFirebaseUser:!!firebaseUser,firebaseUid:firebaseUser?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:65',message:'Setting isAuthenticated to true',data:{firebaseUid:firebaseUser.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
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
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:106',message:'Setting isAuthenticated to false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:115',message:'Setting isLoading to false',data:{isAuthenticated:!!firebaseUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:218',message:'loginWithGoogle called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:223',message:'Google sign-in popup completed',data:{hasFirebaseUser:!!firebaseUser,firebaseUid:firebaseUser.uid,email:firebaseUser.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Extract name from Google profile
      const displayName = firebaseUser.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create user in backend database if doesn't exist
      try {
        const idToken = await firebaseUser.getIdToken();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:233',message:'Got ID token, checking if user exists',data:{hasIdToken:!!idToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Try to get user first
        try {
          await api.getUser(firebaseUser.uid, idToken);
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:237',message:'User already exists in database',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
        } catch (getUserError: any) {
        // User doesn't exist, create them
        if (getUserError.message.includes('not found') || getUserError.message.includes('404')) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:241',message:'User not found, creating new user',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          await api.createUser({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.email?.split('@')[0] || '',
            first_name: firstName,
            last_name: lastName,
          }, idToken);
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:250',message:'User created, creating parent profile',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
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
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:262',message:'Parent profile created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          } catch (parentError: any) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:265',message:'Failed to create parent profile',data:{errorMessage:parentError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:277',message:'Sample child created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          } catch (childError: any) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:280',message:'Failed to create sample child',data:{errorMessage:childError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.error('Failed to create sample child:', childError);
          }
        }
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:285',message:'loginWithGoogle backend operations completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } catch (backendError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:288',message:'Backend error in loginWithGoogle',data:{errorMessage:backendError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error('Failed to create user in backend:', backendError);
        // Don't throw error here as Firebase auth was successful
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:293',message:'loginWithGoogle function completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:296',message:'Error in loginWithGoogle catch block',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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