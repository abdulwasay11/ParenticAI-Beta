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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material';
import { ChildCare, Add, Edit, Delete } from '@mui/icons-material';

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
  const [children, setChildren] = useState<Child[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
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

  const handleEditChild = (child: Child): void => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      age: child.age.toString(),
      gender: child.gender,
      hobbies: child.hobbies,
      interests: child.interests,
      personality: child.personality,
      schoolGrade: child.schoolGrade,
      studies: child.studies,
      ethnicity: child.ethnicity,
      heightCm: child.heightCm?.toString() || '',
      weightKg: child.weightKg?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleSaveChild = (): void => {
    if (!formData.name || !formData.age || !formData.gender) return;

    const childData: Child = {
      id: editingChild?.id || Date.now().toString(),
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender as 'Male' | 'Female' | 'Other',
      hobbies: formData.hobbies,
      interests: formData.interests,
      personality: formData.personality,
      schoolGrade: formData.schoolGrade,
      studies: formData.studies,
      ethnicity: formData.ethnicity,
      heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
      weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
    };

    if (editingChild) {
      setChildren((prev: Child[]) => prev.map((child: Child) => child.id === editingChild.id ? childData : child));
    } else {
      setChildren((prev: Child[]) => [...prev, childData]);
    }

    setIsDialogOpen(false);
  };

  const handleDeleteChild = (childId: string): void => {
    setChildren(prev => prev.filter(child => child.id !== childId));
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
            {children.map((child: Child) => (
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
                    {child.schoolGrade && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📚 {child.schoolGrade}
                      </Typography>
                    )}
                    {child.ethnicity && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        🌍 {child.ethnicity}
                      </Typography>
                    )}
                    {(child.heightCm || child.weightKg) && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📏 {child.heightCm ? `${child.heightCm}cm` : ''}{child.heightCm && child.weightKg ? ' • ' : ''}{child.weightKg ? `${child.weightKg}kg` : ''}
                      </Typography>
                    )}

                    {child.hobbies.length > 0 && (
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

                    {child.interests.length > 0 && (
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

                    {child.studies.length > 0 && (
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
      </Stack>
    </Box>
  );
};

export default ChildrenPage; 