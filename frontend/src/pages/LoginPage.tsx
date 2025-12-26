import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { ArrowBack, Phone, Google } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../config/firebase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Phone authentication state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const { login, signup, resetPassword, loginWithGoogle, sendPhoneVerificationCode, verifyPhoneCode } = useAuth();
  const navigate = useNavigate();

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (typeof window !== 'undefined' && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccessMessage('');
    setPhoneStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
    setConfirmationResult(null);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:100',message:'handleGoogleSignIn called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      await loginWithGoogle();
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:107',message:'loginWithGoogle completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Wait for auth state to update, then navigate
      // The onAuthStateChanged listener will update isAuthenticated
      // We'll wait a moment for it to propagate, then navigate
      setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:115',message:'Navigating to dashboard after Google sign-in',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/48b11a14-7742-440c-a064-d29346f95d75',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:120',message:'Error in handleGoogleSignIn',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    // Format phone number (add + if not present)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    setError('');
    setLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not initialized');
      }
      const confirmation = await sendPhoneVerificationCode(formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setPhoneStep('code');
      setSuccessMessage('Verification code sent! Please check your phone.');
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code');
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) {
      setError('Please enter the verification code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyPhoneCode(confirmationResult, verificationCode);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, firstName, lastName);
      setSuccessMessage('Account created successfully! You are now signed in.');
      // Don't clear the form or switch tabs since user is now signed in
      // The AuthContext will handle the redirect to dashboard
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h3"
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ParenticAI
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, textAlign: 'center' }}
            >
              Your AI-powered parenting assistant
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Sign In" />
                <Tab label="Sign Up" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleResetPassword}
                  disabled={loading || !email}
                  sx={{ mb: 2 }}
                >
                  Forgot Password?
                </Button>
                
                <Divider sx={{ my: 2 }}>OR</Divider>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  Sign in with Google
                </Button>
                
                {phoneStep === 'phone' ? (
                  <Box component="form" onSubmit={handlePhoneSubmit}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      margin="normal"
                      placeholder="+1234567890"
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="outlined"
                      startIcon={<Phone />}
                      disabled={loading || !phoneNumber}
                      sx={{
                        mb: 2,
                        py: 1.5,
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handlePhoneVerify}>
                    <TextField
                      fullWidth
                      label="Verification Code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      margin="normal"
                      placeholder="Enter 6-digit code"
                      required
                      disabled={loading}
                      inputProps={{ maxLength: 6 }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="outlined"
                      disabled={loading || !verificationCode}
                      sx={{
                        mb: 2,
                        py: 1.5,
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        setPhoneStep('phone');
                        setVerificationCode('');
                        setConfirmationResult(null);
                      }}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    >
                      Change Phone Number
                    </Button>
                  </Box>
                )}
                
                <div id="recaptcha-container-signin" style={{ display: 'none' }}></div>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/')}
                  disabled={loading}
                  sx={{ mb: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleSignup}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                  helperText="Password must be at least 6 characters long"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                </Button>
                
                <Divider sx={{ my: 2 }}>OR</Divider>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  Sign up with Google
                </Button>
                
                {phoneStep === 'phone' ? (
                  <Box component="form" onSubmit={handlePhoneSubmit}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      margin="normal"
                      placeholder="+1234567890"
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="outlined"
                      startIcon={<Phone />}
                      disabled={loading || !phoneNumber}
                      sx={{
                        mb: 2,
                        py: 1.5,
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handlePhoneVerify}>
                    <TextField
                      fullWidth
                      label="Verification Code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      margin="normal"
                      placeholder="Enter 6-digit code"
                      required
                      disabled={loading}
                      inputProps={{ maxLength: 6 }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="outlined"
                      disabled={loading || !verificationCode}
                      sx={{
                        mb: 2,
                        py: 1.5,
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        setPhoneStep('phone');
                        setVerificationCode('');
                        setConfirmationResult(null);
                      }}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    >
                      Change Phone Number
                    </Button>
                  </Box>
                )}
                
                <div id="recaptcha-container-signup" style={{ display: 'none' }}></div>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/')}
                  disabled={loading}
                  sx={{ mb: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </TabPanel>
            
            {/* Hidden reCAPTCHA container for phone authentication */}
            <div id="recaptcha-container" style={{ display: 'none' }}></div>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage; 