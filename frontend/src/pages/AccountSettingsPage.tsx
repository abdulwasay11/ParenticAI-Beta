import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Save, Upgrade, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface UserAccount {
  email: string;
  phone?: string;
  subscription_tier?: 'free' | 'parent' | 'family';
}

const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    childrenLimit: 2,
    price: '$0',
    features: [
      '2 child profiles (sample + 1 additional)',
      'Basic AI chat',
      'Parent profile',
      'Dashboard insights'
    ]
  },
  parent: {
    name: 'Parent',
    childrenLimit: 4,
    price: '$9.99/month',
    features: [
      'Up to 4 child profiles',
      'Advanced AI chat',
      'Personality assessments',
      'Priority support',
      'All Free features'
    ]
  },
  family: {
    name: 'Family',
    childrenLimit: 999,
    price: '$19.99/month',
    features: [
      'Unlimited child profiles',
      'Advanced AI chat',
      'Personality assessments',
      'Priority support',
      'Family collaboration',
      'Advanced analytics',
      'All Parent features'
    ]
  }
};

const AccountSettingsPage: React.FC = () => {
  const { firebaseUser, token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [account, setAccount] = useState<UserAccount>({
    email: '',
    phone: '',
    subscription_tier: 'free'
  });
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeToTier, setUpgradeToTier] = useState<'parent' | 'family' | null>(null);

  useEffect(() => {
    const loadAccount = async () => {
      if (!firebaseUser?.uid || !token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const userData = await api.getUser(firebaseUser.uid, token);
        setAccount({
          email: userData.email || firebaseUser.email || '',
          phone: userData.phone || '',
          subscription_tier: userData.subscription_tier || 'free'
        });
      } catch (err: any) {
        console.error('Error loading account:', err);
        setError(err.message || 'Failed to load account information');
        // Fallback to Firebase data
        if (firebaseUser) {
          setAccount({
            email: firebaseUser.email || '',
            phone: '',
            subscription_tier: 'free'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAccount();
  }, [firebaseUser, token]);

  const handleSave = async (): Promise<void> => {
    if (!firebaseUser?.uid || !token) {
      setError('You must be logged in to save your account settings');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await api.updateUser({
        email: account.email,
        phone: account.phone,
        subscription_tier: account.subscription_tier
      }, firebaseUser.uid, token);

      setSuccess('Account settings updated successfully!');
      // Update Firebase email if changed (this requires re-authentication in production)
      // For now, just show success message
    } catch (err: any) {
      console.error('Error saving account:', err);
      setError(err.message || 'Failed to save account settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradeClick = (tier: 'parent' | 'family') => {
    setUpgradeToTier(tier);
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeConfirm = () => {
    if (upgradeToTier) {
      setAccount(prev => ({ ...prev, subscription_tier: upgradeToTier }));
      setUpgradeDialogOpen(false);
      setUpgradeToTier(null);
      // In production, this would redirect to payment page
      setSuccess(`Upgraded to ${SUBSCRIPTION_TIERS[upgradeToTier].name} subscription! (Note: Payment integration needed)`);
    }
  };

  const currentTier = account.subscription_tier || 'free';
  const currentTierInfo = SUBSCRIPTION_TIERS[currentTier];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          Account Settings
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Contact Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={account.email}
                      onChange={(e) => setAccount(prev => ({ ...prev, email: e.target.value }))}
                      variant="outlined"
                      helperText="Note: Changing email may require re-authentication"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={account.phone || ''}
                      onChange={(e) => setAccount(prev => ({ ...prev, phone: e.target.value }))}
                      variant="outlined"
                      placeholder="+1 (555) 123-4567"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Current Subscription
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Chip
                      label={currentTierInfo.name}
                      color={currentTier === 'free' ? 'default' : currentTier === 'parent' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 600, mb: 1 }}
                    />
                    <Typography variant="h5" fontWeight={600} color="primary">
                      {currentTierInfo.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Up to {currentTierInfo.childrenLimit === 999 ? 'unlimited' : currentTierInfo.childrenLimit} children
                    </Typography>
                  </Box>
                  <Divider />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Features:
                  </Typography>
                  <Stack spacing={0.5}>
                    {currentTierInfo.features.map((feature, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Subscription Management
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Change Subscription Tier</InputLabel>
                      <Select
                        value={account.subscription_tier || 'free'}
                        onChange={(e) => {
                          const newTier = e.target.value as 'free' | 'parent' | 'family';
                          if (newTier !== 'free' && newTier !== currentTier) {
                            handleUpgradeClick(newTier);
                          } else {
                            setAccount(prev => ({ ...prev, subscription_tier: newTier }));
                          }
                        }}
                        label="Change Subscription Tier"
                      >
                        <MenuItem value="free">Free - {SUBSCRIPTION_TIERS.free.price}</MenuItem>
                        <MenuItem value="parent">Parent - {SUBSCRIPTION_TIERS.parent.price}</MenuItem>
                        <MenuItem value="family">Family - {SUBSCRIPTION_TIERS.family.price}</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Note: Subscription changes require payment integration. Current selection is for display only.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {currentTier !== 'family' && (
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Upgrade Your Subscription
                      </Typography>
                      <Typography variant="body2">
                        {currentTier === 'free' 
                          ? 'Upgrade to Parent plan to add up to 4 children, or Family plan for unlimited children and advanced features.'
                          : 'Upgrade to Family plan for unlimited children and advanced collaboration features.'
                        }
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      {currentTier !== 'parent' && (
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<Upgrade />}
                          onClick={() => handleUpgradeClick('parent')}
                          sx={{ backgroundColor: 'white', color: 'primary.main', '&:hover': { backgroundColor: 'grey.100' } }}
                        >
                          Upgrade to Parent
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Upgrade />}
                        onClick={() => handleUpgradeClick('family')}
                        sx={{ backgroundColor: 'white', color: 'primary.main', '&:hover': { backgroundColor: 'grey.100' } }}
                      >
                        Upgrade to Family
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Stack>

      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)}>
        <DialogTitle>Upgrade Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {upgradeToTier && (
              <>
                You are about to upgrade to the <strong>{SUBSCRIPTION_TIERS[upgradeToTier].name}</strong> plan ({SUBSCRIPTION_TIERS[upgradeToTier].price}).
                <br /><br />
                <strong>Features included:</strong>
                <ul>
                  {SUBSCRIPTION_TIERS[upgradeToTier].features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <br />
                <strong>Note:</strong> Payment integration is required to complete the upgrade. This is currently a demo feature.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpgradeConfirm} variant="contained" color="primary">
            Confirm Upgrade (Demo)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountSettingsPage;

