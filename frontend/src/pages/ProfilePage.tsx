import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid, 
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person, Edit, Save } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

// TypeScript interfaces
interface ParentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  parentingStyle: string;
  experience: string;
  age?: number;
  location?: string;
  concerns?: string;
  goals?: string;
  family_structure?: string;
  parenting_score?: number;
}

const ProfilePage: React.FC = () => {
  const { user, firebaseUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ParentProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    parentingStyle: '',
    experience: '',
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!firebaseUser?.uid || !token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user data
        const userData = await api.getUser(firebaseUser.uid, token);
        
        // Get parent profile
        try {
          const parentData = await api.getParentProfile(firebaseUser.uid, token);
          
          setProfile({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || firebaseUser.email || '',
            phone: '', // Phone not stored in parent profile yet
            bio: parentData.concerns || '',
            parentingStyle: parentData.parenting_style || '',
            experience: parentData.experience_level || '',
            age: parentData.age,
            location: parentData.location || '',
            concerns: parentData.concerns || '',
            goals: parentData.goals || '',
            family_structure: parentData.family_structure || '',
            parenting_score: parentData.parenting_score || 0,
          });
        } catch (err) {
          // Parent profile might not exist yet
          console.log('Parent profile not found, will create on save');
          setProfile({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || firebaseUser.email || '',
            phone: '',
            bio: '',
            parentingStyle: '',
            experience: '',
          });
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [firebaseUser, token]);

  const handleInputChange = (field: keyof ParentProfile) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async (): Promise<void> => {
    if (!firebaseUser?.uid || !token) {
      setError('You must be logged in to save your profile');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Update user data
      await api.createUser({
        firebase_uid: firebaseUser.uid,
        email: profile.email,
        username: profile.email.split('@')[0],
        first_name: profile.firstName,
        last_name: profile.lastName,
      }, token);

      // Update/create parent profile
      await api.createParentProfile({
        age: profile.age,
        location: profile.location,
        parenting_style: profile.parentingStyle,
        concerns: profile.bio || profile.concerns,
        goals: profile.goals,
        experience_level: profile.experience,
        family_structure: profile.family_structure,
      }, firebaseUser.uid, token);

      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const parentingStyles: string[] = [
    'Authoritative', 'Permissive', 'Authoritarian', 'Uninvolved', 'Positive Parenting'
  ];

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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={600}>
            Parent Profile
          </Typography>
          <Button
            variant={isEditing ? "contained" : "outlined"}
            startIcon={isEditing ? <Save /> : <Edit />}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={isSaving}
          >
            {isEditing ? (isSaving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {profile.parenting_score !== undefined && profile.parenting_score > 0 && (
          <Card sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Parenting Score: {profile.parenting_score}/100
              </Typography>
              <Typography variant="body2">
                Your parenting progress is tracked over time. Keep engaging with ParenticAI to improve your score!
              </Typography>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: 'primary.main'
                  }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Parent Profile
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profile.firstName}
                      onChange={handleInputChange('firstName')}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profile.lastName}
                      onChange={handleInputChange('lastName')}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile.email}
                      onChange={handleInputChange('email')}
                      disabled={!isEditing}
                      type="email"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={profile.location || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio / About Me / Concerns"
                      value={profile.bio}
                      onChange={handleInputChange('bio')}
                      disabled={!isEditing}
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Tell us a bit about yourself and your parenting journey..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Goals"
                      value={profile.goals || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, goals: e.target.value }))}
                      disabled={!isEditing}
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder="What are your parenting goals?"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Family Structure"
                      value={profile.family_structure || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, family_structure: e.target.value }))}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="e.g., Single parent, Two-parent household, etc."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Parenting Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Parenting Experience"
                      value={profile.experience}
                      onChange={handleInputChange('experience')}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="e.g., First-time parent, 5 years experience, etc."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Preferred Parenting Style"
                      value={profile.parentingStyle}
                      onChange={handleInputChange('parentingStyle')}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Common parenting styles:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {parentingStyles.map((style: string) => (
                        <Chip 
                          key={style}
                          label={style}
                          variant={profile.parentingStyle === style ? "filled" : "outlined"}
                          onClick={() => isEditing && setProfile(prev => ({ ...prev, parentingStyle: style }))}
                          sx={{ cursor: isEditing ? 'pointer' : 'default' }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default ProfilePage; 