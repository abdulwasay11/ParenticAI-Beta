import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Import pages
import LandingPage from './LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ChildrenPage from './pages/ChildrenPage';
import ChatPage from './pages/ChatPage';
import CommunityPage from './pages/CommunityPage';
import PersonalityAssessmentPage from './pages/PersonalityAssessmentPage';
import ChatHistoryPage from './pages/ChatHistoryPage';

// Import layout and auth
import Layout from './components/Layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// TypeScript interfaces
interface RouteWrapperProps {
  children: ReactNode;
}



// Protected route wrapper
const ProtectedRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper
const PublicRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:121',message:'PublicRoute render',data:{isAuthenticated,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  }, [isAuthenticated, isLoading]);
  // #endregion

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:139',message:'PublicRoute redirecting authenticated user to dashboard',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/account-settings" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AccountSettingsPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/children" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChildrenPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/community" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CommunityPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/personality-assessment" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PersonalityAssessmentPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat-history" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatHistoryPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 