import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { Person, Edit, Save } from '@mui/icons-material';

// TypeScript interfaces
interface ParentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  parentingStyle: string;
  experience: string;
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profile, setProfile] = useState<ParentProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    parentingStyle: '',
    experience: '',
  });

  const handleInputChange = (field: keyof ParentProfile) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = (): void => {
    setIsEditing(false);
    // TODO: Save to backend
    console.log('Saving profile:', profile);
  };

  const parentingStyles: string[] = [
    'Authoritative', 'Permissive', 'Authoritarian', 'Uninvolved', 'Positive Parenting'
  ];

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
          >
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </Box>

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
                      label="Phone"
                      value={profile.phone}
                      onChange={handleInputChange('phone')}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio / About Me"
                      value={profile.bio}
                      onChange={handleInputChange('bio')}
                      disabled={!isEditing}
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Tell us a bit about yourself and your parenting journey..."
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