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
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider
} from '@mui/material';
import { Person, Edit, Save, PhotoCamera, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

// TypeScript interfaces
interface ParentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age?: number;
  location?: string;
  concerns?: string;
  goals?: string;
  parentingStyle: string;
  experience: string;
  family_structure?: 'single' | 'couple';
  preferred_language?: string;
  photo_url?: string;
  partner_first_name?: string;
  partner_last_name?: string;
  partner_email?: string;
  partner_phone?: string;
  parenting_score?: number;
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Turkish',
  'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Hebrew',
  'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog', 'Urdu', 'Bengali',
  'Punjabi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'
];

const ProfilePage: React.FC = () => {
  const { firebaseUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ParentProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    parentingStyle: '',
    experience: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  // Populate profile with Firebase data immediately when available
  useEffect(() => {
    if (firebaseUser && !profile.email) {
      const displayName = firebaseUser.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setProfile(prev => ({
        ...prev,
        email: firebaseUser.email || prev.email || '',
        firstName: firstName || prev.firstName || '',
        lastName: lastName || prev.lastName || '',
      }));
    }
  }, [firebaseUser, profile.email]);

  // Load profile data from API
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
            phone: userData.phone || '',
            age: parentData.age,
            location: parentData.location || '',
            concerns: parentData.concerns || '',
            goals: parentData.goals || '',
            parentingStyle: parentData.parenting_style || '',
            experience: parentData.experience_level || '',
            family_structure: parentData.family_structure || 'single',
            preferred_language: parentData.preferred_language || '',
            photo_url: parentData.photo_url || '',
            partner_first_name: parentData.partner_first_name || '',
            partner_last_name: parentData.partner_last_name || '',
            partner_email: parentData.partner_email || '',
            partner_phone: parentData.partner_phone || '',
            parenting_score: parentData.parenting_score || 0,
          });

          if (parentData.photo_url) {
            setPhotoPreview(parentData.photo_url);
          }
        } catch (err) {
          // Parent profile might not exist yet
          console.log('Parent profile not found, will create on save');
          setProfile(prev => ({
            ...prev,
            firstName: userData.first_name || prev.firstName || '',
            lastName: userData.last_name || prev.lastName || '',
            email: userData.email || firebaseUser.email || prev.email || '',
            phone: userData.phone || prev.phone || '',
            family_structure: 'single',
          }));
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
        
        // Populate profile with Firebase data as fallback when API fails
        if (firebaseUser) {
          const displayName = firebaseUser.displayName || '';
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setProfile(prev => ({
            ...prev,
            email: firebaseUser.email || prev.email || '',
            firstName: firstName || prev.firstName || '',
            lastName: lastName || prev.lastName || '',
            family_structure: 'single',
          }));
        }
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

  const handleSelectChange = (field: keyof ParentProfile) => (
    event: any
  ): void => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size must be less than 5MB');
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setProfile(prev => ({ ...prev, photo_url: undefined }));
  };

  const handleSave = async (): Promise<void> => {
    if (!firebaseUser?.uid || !token) {
      setError('You must be logged in to save your profile');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Note: Photo upload will be handled separately when DB integration is ready
      // For now, we just store the preview URL if a photo was selected
      const photoUrl = selectedPhoto ? photoPreview : profile.photo_url;

      // Update/create parent profile
      await api.updateParentProfile({
        age: profile.age,
        location: profile.location,
        parenting_style: profile.parentingStyle,
        concerns: profile.concerns,
        goals: profile.goals,
        experience_level: profile.experience,
        family_structure: profile.family_structure || 'single',
        preferred_language: profile.preferred_language,
        photo_url: photoUrl ?? undefined,
        partner_first_name: profile.family_structure === 'couple' ? profile.partner_first_name : undefined,
        partner_last_name: profile.family_structure === 'couple' ? profile.partner_last_name : undefined,
        partner_email: profile.family_structure === 'couple' ? profile.partner_email : undefined,
        partner_phone: profile.family_structure === 'couple' ? profile.partner_phone : undefined,
      }, firebaseUser.uid, token);

      setIsEditing(false);
      setSelectedPhoto(null); // Clear selected photo after save
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

  const isCouple = profile.family_structure === 'couple';

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
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={photoPreview || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      backgroundColor: 'primary.main'
                    }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        type="file"
                        onChange={handlePhotoChange}
                      />
                      <label htmlFor="photo-upload">
                        <IconButton
                          color="primary"
                          component="span"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'background.paper',
                            boxShadow: 2
                          }}
                        >
                          <PhotoCamera />
                        </IconButton>
                      </label>
                      {photoPreview && (
                        <IconButton
                          color="error"
                          onClick={handleRemovePhoto}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'background.paper',
                            boxShadow: 2
                          }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
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
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Family Structure</InputLabel>
                      <Select
                        value={profile.family_structure || 'single'}
                        onChange={handleSelectChange('family_structure')}
                        disabled={!isEditing}
                        label="Family Structure"
                      >
                        <MenuItem value="single">Single Parent</MenuItem>
                        <MenuItem value="couple">Couple (Two Parents)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Your Information
                    </Typography>
                  </Grid>
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
                    <FormControl fullWidth>
                      <InputLabel>Preferred Language</InputLabel>
                      <Select
                        value={profile.preferred_language || ''}
                        onChange={handleSelectChange('preferred_language')}
                        disabled={!isEditing}
                        label="Preferred Language"
                      >
                        <MenuItem value="">Select a language</MenuItem>
                        {LANGUAGES.map(lang => (
                          <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {isCouple && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ mt: 1 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          Partner Information
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Partner First Name"
                          value={profile.partner_first_name || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, partner_first_name: e.target.value }))}
                          disabled={!isEditing}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Partner Last Name"
                          value={profile.partner_last_name || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, partner_last_name: e.target.value }))}
                          disabled={!isEditing}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Partner Email"
                          type="email"
                          value={profile.partner_email || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, partner_email: e.target.value }))}
                          disabled={!isEditing}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Partner Phone"
                          value={profile.partner_phone || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, partner_phone: e.target.value }))}
                          disabled={!isEditing}
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Concerns"
                      value={profile.concerns || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, concerns: e.target.value }))}
                      disabled={!isEditing}
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="What parenting challenges or concerns do you have?"
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
