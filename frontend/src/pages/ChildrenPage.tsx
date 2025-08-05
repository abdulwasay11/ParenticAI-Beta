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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { ChildCare, Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api, Child as BackendChild, ChildOptions } from '../utils/api';

// TypeScript interfaces
interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  hobbies: string[];
  interests: string[];
  personality: string[];
  schoolGrade: string;
  studies: string[];
  ethnicity: string;
  heightCm: number | null;
  weightKg: number | null;
}

interface ChildFormData {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  hobbies: string[];
  interests: string[];
  personality: string[];
  schoolGrade: string;
  studies: string[];
  ethnicity: string;
  heightCm: string;
  weightKg: string;
}

const ChildrenPage: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<BackendChild[]>([]);
  const [childOptions, setChildOptions] = useState<ChildOptions | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingChild, setEditingChild] = useState<BackendChild | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    age: '',
    gender: '',
    hobbies: [],
    interests: [],
    personality: [],
    schoolGrade: '',
    studies: [],
    ethnicity: '',
    heightCm: '',
    weightKg: '',
  });

  // Predefined options
  const hobbyOptions: string[] = [
    'Reading', 'Drawing', 'Sports', 'Music', 'Dancing', 'Gaming', 'Cooking', 
    'Gardening', 'Building/Lego', 'Outdoor Activities', 'Swimming', 'Cycling'
  ];

  const interestOptions: string[] = [
    'Science', 'Technology', 'Animals', 'Nature', 'Art', 'History', 'Math', 
    'Languages', 'Travel', 'Movies', 'Books', 'Space', 'Cars', 'Fashion'
  ];

  const personalityOptions: string[] = [
    'Outgoing', 'Shy', 'Creative', 'Analytical', 'Empathetic', 'Independent', 
    'Collaborative', 'Curious', 'Energetic', 'Calm', 'Funny', 'Serious'
  ];

  const studiesOptions: string[] = [
    'Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Music', 
    'Physical Education', 'Computer Science', 'Languages', 'Biology', 'Chemistry', 
    'Physics', 'Literature', 'Social Studies', 'Drama', 'Economics'
  ];

  const gradeOptions: string[] = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', 
    '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', 
    '11th Grade', '12th Grade', 'College Freshman', 'College Sophomore', 
    'College Junior', 'College Senior', 'Graduate'
  ];

  // Load children and options from backend
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load child options
        const options = await api.getChildOptions();
        setChildOptions(options);
        
        // Load children
        const childrenData = await api.getChildren(user.id);
        setChildren(childrenData);
      } catch (err) {
        console.error('Error loading children data:', err);
        setError('Failed to load children data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const ethnicityOptions: string[] = [
    'African American', 'Asian', 'Caucasian', 'Hispanic/Latino', 'Native American', 
    'Pacific Islander', 'Middle Eastern', 'Mixed/Multiracial', 'Other', 'Prefer not to say'
  ];

  const handleAddChild = (): void => {
    setEditingChild(null);
    setFormData({
      name: '',
      age: '',
      gender: '',
      hobbies: [],
      interests: [],
      personality: [],
      schoolGrade: '',
      studies: [],
      ethnicity: '',
      heightCm: '',
      weightKg: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditChild = (child: BackendChild): void => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      age: child.age.toString(),
      gender: child.gender as 'Male' | 'Female' | 'Other',
      hobbies: child.hobbies || [],
      interests: child.interests || [],
      personality: child.personality_traits || [],
      schoolGrade: child.school_grade || '',
      studies: child.studies || [],
      ethnicity: child.ethnicity || '',
      heightCm: child.height_cm ? child.height_cm.toString() : '',
      weightKg: child.weight_kg ? child.weight_kg.toString() : '',
    });
    setIsDialogOpen(true);
  };

  const handleSaveChild = async (): Promise<void> => {
    if (!formData.name || !formData.age || !formData.gender || !user?.id) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      const childData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        hobbies: formData.hobbies,
        interests: formData.interests,
        personality_traits: formData.personality,
        school_grade: formData.schoolGrade,
        studies: formData.studies,
        ethnicity: formData.ethnicity,
        height_cm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
        weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
      };

      if (editingChild) {
        const updatedChild = await api.updateChild(editingChild.id, childData, user.id);
        setChildren(prev => prev.map(child => 
          child.id === editingChild.id ? updatedChild : child
        ));
        showSnackbar('Child updated successfully!', 'success');
      } else {
        const newChild = await api.createChild(childData, user.id);
        setChildren(prev => [...prev, newChild]);
        showSnackbar('Child added successfully!', 'success');
      }

      setIsDialogOpen(false);
      setEditingChild(null);
      setFormData({
        name: '',
        age: '',
        gender: '',
        hobbies: [],
        interests: [],
        personality: [],
        schoolGrade: '',
        studies: [],
        ethnicity: '',
        heightCm: '',
        weightKg: '',
      });
    } catch (error) {
      console.error('Error saving child:', error);
      showSnackbar('Failed to save child. Please try again.', 'error');
    }
  };

  const handleDeleteChild = async (childId: number): Promise<void> => {
    if (!user?.id) return;
    
    try {
      await api.deleteChild(childId, user.id);
      setChildren(prev => prev.filter(child => child.id !== childId));
      showSnackbar('Child deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting child:', error);
      showSnackbar('Failed to delete child. Please try again.', 'error');
    }
  };

  const toggleArrayItem = (array: string[], item: string): string[] => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={600}>
            Children Profiles
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddChild}
          >
            Add Child
          </Button>
        </Box>

        {children.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ChildCare sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No children profiles yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add your first child's profile to get personalized parenting advice.
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddChild}>
                Add Your First Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {children.map((child: BackendChild) => (
              <Grid item xs={12} md={6} lg={4} key={child.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: 'primary.main'
                        }}
                      >
                        <ChildCare />
                      </Avatar>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditChild(child)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteChild(child.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {child.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {child.age} years old • {child.gender}
                    </Typography>
                    {child.school_grade && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📚 {child.school_grade}
                      </Typography>
                    )}
                    {child.ethnicity && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        🌍 {child.ethnicity}
                      </Typography>
                    )}
                    {(child.height_cm || child.weight_kg) && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📏 {child.height_cm ? `${child.height_cm}cm` : ''}{child.height_cm && child.weight_kg ? ' • ' : ''}{child.weight_kg ? `${child.weight_kg}kg` : ''}
                      </Typography>
                    )}

                    {child.hobbies && child.hobbies.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Hobbies:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                          {child.hobbies.slice(0, 3).map((hobby: string) => (
                            <Chip key={hobby} label={hobby} size="small" />
                          ))}
                          {child.hobbies.length > 3 && (
                            <Chip label={`+${child.hobbies.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {child.interests && child.interests.length > 0 && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Interests:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                          {child.interests.slice(0, 3).map((interest: string) => (
                            <Chip key={interest} label={interest} size="small" variant="outlined" />
                          ))}
                          {child.interests.length > 3 && (
                            <Chip label={`+${child.interests.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {child.studies && child.studies.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Studies:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                          {child.studies.slice(0, 3).map((subject: string) => (
                            <Chip key={subject} label={subject} size="small" color="secondary" />
                          ))}
                          {child.studies.length > 3 && (
                            <Chip label={`+${child.studies.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Child Dialog */}
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingChild ? 'Edit Child Profile' : 'Add New Child'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Child's Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Gender"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      gender: e.target.value as 'Male' | 'Female' | 'Other' 
                    }))}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Class/Grade</InputLabel>
                  <Select
                    value={formData.schoolGrade}
                    label="Class/Grade"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      schoolGrade: e.target.value 
                    }))}
                  >
                    {gradeOptions.map((grade: string) => (
                      <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Ethnicity</InputLabel>
                  <Select
                    value={formData.ethnicity}
                    label="Ethnicity"
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      ethnicity: e.target.value 
                    }))}
                  >
                    {ethnicityOptions.map((ethnicity: string) => (
                      <MenuItem key={ethnicity} value={ethnicity}>{ethnicity}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData(prev => ({ ...prev, heightCm: e.target.value }))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => setFormData(prev => ({ ...prev, weightKg: e.target.value }))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Studies/Subjects (select all that apply):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {studiesOptions.map((subject: string) => (
                    <Chip
                      key={subject}
                      label={subject}
                      variant={formData.studies.includes(subject) ? "filled" : "outlined"}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        studies: toggleArrayItem(prev.studies, subject)
                      }))}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Hobbies (select all that apply):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {hobbyOptions.map((hobby: string) => (
                    <Chip
                      key={hobby}
                      label={hobby}
                      variant={formData.hobbies.includes(hobby) ? "filled" : "outlined"}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        hobbies: toggleArrayItem(prev.hobbies, hobby)
                      }))}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Interests (select all that apply):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {interestOptions.map((interest: string) => (
                    <Chip
                      key={interest}
                      label={interest}
                      variant={formData.interests.includes(interest) ? "filled" : "outlined"}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        interests: toggleArrayItem(prev.interests, interest)
                      }))}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Personality Traits (select all that apply):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {personalityOptions.map((trait: string) => (
                    <Chip
                      key={trait}
                      label={trait}
                      variant={formData.personality.includes(trait) ? "filled" : "outlined"}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        personality: toggleArrayItem(prev.personality, trait)
                      }))}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChild} 
              variant="contained"
              disabled={!formData.name || !formData.age || !formData.gender}
            >
              {editingChild ? 'Update Child' : 'Add Child'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
};

export default ChildrenPage; 