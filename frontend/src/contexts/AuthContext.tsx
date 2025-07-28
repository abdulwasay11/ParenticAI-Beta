import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak from 'keycloak-js';
import axios from 'axios';

// Types
interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  keycloak: Keycloak | null;
  login: () => void;
  logout: () => void;
  token: string | null;
}

// Keycloak configuration
const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'parentic-ai',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'parentic-client',
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const kc = new Keycloak(keycloakConfig);
        
        const authenticated = await kc.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
        });

        setKeycloak(kc);
        setIsAuthenticated(authenticated);

        if (authenticated && kc.token) {
          setToken(kc.token);
          
          // Set up axios interceptor for token
          axios.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
          
          // Extract user info from token
          if (kc.tokenParsed) {
            const userInfo: User = {
              id: kc.tokenParsed.sub || '',
              email: kc.tokenParsed.email || '',
              username: kc.tokenParsed.preferred_username || '',
              firstName: kc.tokenParsed.given_name,
              lastName: kc.tokenParsed.family_name,
            };
            setUser(userInfo);
          }

          // Set up token refresh
          kc.onTokenExpired = () => {
            kc.updateToken(30).then((refreshed) => {
              if (refreshed && kc.token) {
                setToken(kc.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
              }
            }).catch(() => {
              console.log('Failed to refresh token');
              logout();
            });
          };
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login({
        redirectUri: window.location.origin + '/dashboard',
      });
    }
  };

  const logout = () => {
    if (keycloak) {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
      keycloak.logout({
        redirectUri: window.location.origin,
      });
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    keycloak,
    login,
    logout,
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