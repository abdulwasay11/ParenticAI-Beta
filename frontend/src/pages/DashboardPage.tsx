import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent, Box, Button, Stack, CircularProgress } from '@mui/material';
import { ChildCare, Chat, Psychology, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

// TypeScript interfaces
interface StatCard {
  title: string;
  value: string;
  icon: React.ReactElement;
  color: string;
  path: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { firebaseUser, token } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Children Profiles', value: '0', icon: <ChildCare />, color: '#6366f1', path: '/children' },
    { title: 'AI Conversations', value: '0', icon: <Chat />, color: '#ec4899', path: '/chat' },
    { title: 'Assessments Done', value: '0', icon: <Psychology />, color: '#10b981', path: '/personality-assessment' },
    { title: 'Days Active', value: '1', icon: <TrendingUp />, color: '#f59e0b', path: '/profile' },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      if (!firebaseUser?.uid || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const dashboardStats = await api.getDashboardStats(firebaseUser.uid, token);
        setStats([
          { title: 'Children Profiles', value: dashboardStats.childrenCount.toString(), icon: <ChildCare />, color: '#6366f1', path: '/children' },
          { title: 'AI Conversations', value: dashboardStats.chatCount.toString(), icon: <Chat />, color: '#ec4899', path: '/chat' },
          { title: 'Assessments Done', value: dashboardStats.assessmentsCount.toString(), icon: <Psychology />, color: '#10b981', path: '/personality-assessment' },
          { title: 'Days Active', value: dashboardStats.daysActive.toString(), icon: <TrendingUp />, color: '#f59e0b', path: '/profile' },
        ]);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [firebaseUser, token]);

  const handleStatClick = (path: string): void => {
    navigate(path);
  };

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
          Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Welcome to your ParenticAI dashboard! Get started by creating your first child profile.
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat: StatCard, index: number) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  }
                }}
                onClick={() => handleStatClick(stat.path)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: stat.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => navigate('/children')}
                  >
                    Add Child Profile
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => navigate('/chat')}
                  >
                    Start AI Chat
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => navigate('/profile')}
                  >
                    Complete Your Profile
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Getting Started
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Welcome to ParenticAI! Here's how to get the most out of your experience:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2" gutterBottom>
                    Complete your parent profile
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Add your children's information
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Start chatting with our AI assistant
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Try the personality assessment feature
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default DashboardPage; 