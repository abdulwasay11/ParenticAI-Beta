import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  Stack,
  Avatar,
  LinearProgress
} from '@mui/material';
import { Psychology, CloudUpload, Image } from '@mui/icons-material';

// TypeScript interfaces
interface AssessmentResult {
  id: string;
  childName: string;
  traits: string[];
  recommendations: string[];
  confidence: number;
  date: Date;
}

const PersonalityAssessmentPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [results, setResults] = useState<AssessmentResult[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResult: AssessmentResult = {
        id: Date.now().toString(),
        childName: 'Sample Child',
        traits: ['Creative', 'Curious', 'Energetic'],
        recommendations: [
          'Encourage artistic activities',
          'Provide hands-on learning experiences',
          'Include physical activities in daily routine'
        ],
        confidence: 85,
        date: new Date()
      };
      
      setResults(prev => [mockResult, ...prev]);
      setIsUploading(false);
    }, 3000);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          Personality Assessment
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Coming Soon!</strong> This feature will allow you to upload images for AI-powered personality analysis and insights.
        </Alert>

        {/* Upload Section */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Psychology sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI-Powered Personality Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a photo of your child to get personalized insights about their personality traits and recommendations for activities that match their temperament.
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
                disabled={isUploading}
                size="large"
              >
                {isUploading ? 'Analyzing Image...' : 'Upload Photo'}
              </Button>
            </label>

            {isUploading && (
              <Box sx={{ mt: 3, maxWidth: 300, mx: 'auto' }}>
                <Typography variant="body2" gutterBottom>
                  Analyzing personality traits...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <>
            <Typography variant="h5" fontWeight={600}>
              Assessment Results
            </Typography>
            
            <Stack spacing={2}>
              {results.map((result: AssessmentResult) => (
                <Card key={result.id}>
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Avatar sx={{ backgroundColor: 'primary.main' }}>
                        <Image />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          Assessment for {result.childName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {result.date.toLocaleDateString()} • Confidence: {result.confidence}%
                        </Typography>
                        
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Identified Traits:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {result.traits.map((trait: string, index: number) => (
                              <Typography 
                                key={index}
                                variant="body2"
                                sx={{
                                  backgroundColor: 'primary.light',
                                  color: 'primary.contrastText',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 1
                                }}
                              >
                                {trait}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>

                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Recommendations:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {result.recommendations.map((rec: string, index: number) => (
                              <Typography 
                                key={index}
                                component="li" 
                                variant="body2" 
                                gutterBottom
                              >
                                {rec}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </>
        )}

        {/* Info Section */}
        <Card sx={{ backgroundColor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="body2" paragraph>
              Our AI-powered personality assessment analyzes facial expressions, body language, and environmental cues to identify personality traits in children. The system considers:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" gutterBottom>
                Facial expressions and emotional indicators
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Body language and posture
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Activity preferences visible in the image
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Social interaction patterns
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Note: This feature is currently in development and will be available soon with integration to specialized personality assessment APIs.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default PersonalityAssessmentPage; 