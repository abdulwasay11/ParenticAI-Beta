import React, { useState, useRef, useEffect } from 'react';
import { getApiUrl } from './utils/api';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  TextField,
  IconButton,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Psychology,
  ChildCare,
  Chat,
  Security,
  TrendingUp,
  Favorite,
  Send,
  Person,
} from '@mui/icons-material';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// TypeScript interfaces
interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

interface BenefitItemProps {
  item: string;
  index: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Features data with proper typing
const features: Feature[] = [
  {
    icon: <Psychology />,
    title: 'AI-Powered Guidance',
    description: 'Get personalized parenting advice from our advanced AI assistant trained on child development expertise.',
  },
  {
    icon: <ChildCare />,
    title: 'Child Profiles',
    description: 'Create detailed profiles for each child with their interests, personality traits, and development milestones.',
  },
  {
    icon: <Chat />,
    title: 'Smart Conversations',
    description: 'Have natural conversations with our AI that remembers your family context and provides relevant advice.',
  },
  {
    icon: <Security />,
    title: 'Safe & Secure',
    description: 'Your family data is protected with enterprise-grade security and privacy measures.',
  },
  {
    icon: <TrendingUp />,
    title: 'Track Progress',
    description: 'Monitor your parenting journey and your children\'s development with insightful analytics.',
  },
  {
    icon: <Favorite />,
    title: 'Community Support',
    description: 'Connect with other parents and share experiences in a supportive, judgment-free environment.',
  },
];

// Benefits list with proper typing
const benefitsList: string[] = [
  'Evidence-based parenting advice',
  'Personalized child development insights',
  'AI-powered conversation assistance',
  'Secure family data management',
];

// Benefit item component
const BenefitItem: React.FC<BenefitItemProps> = ({ item, index }) => (
  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#fbbf24',
      }}
    />
    <Typography variant="body1">{item}</Typography>
  </Box>
);

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Chat functionality state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m ParenticAI, your parenting assistant. Ask me anything about parenting - no account needed! 🤗',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions: string[] = [
    'How do I handle tantrums?',
    'Sleep training tips for toddlers',
    'Healthy meal ideas for picky eaters',
    'Screen time guidelines by age',
    'Positive discipline strategies',
  ];

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Make API call to backend (anonymous - no auth required)
      const response = await fetch(getApiUrl('chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          child_context: [] // No context for anonymous users
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again in a moment! For the best experience with saved conversations and personalized advice, consider signing up.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string): void => {
    setInputMessage(question);
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Chip
                  label="AI-Powered Parenting"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: 'fit-content',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.1,
                  }}
                >
                  Welcome to{' '}
                  <Box component="span" sx={{ color: '#fbbf24' }}>
                    ParenticAI
                  </Box>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 400,
                    opacity: 0.9,
                    lineHeight: 1.4,
                  }}
                >
                  Your intelligent parenting companion that provides personalized advice,
                  tracks your children's development, and supports your parenting journey.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                      },
                    }}
                    onClick={() => {
                      document.getElementById('try-ai-chat')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Try AI Chat
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                  p: 4,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  🎯 Perfect for parents who want:
                </Typography>
                <Stack spacing={2}>
                  {benefitsList.map((item: string, index: number) => (
                    <BenefitItem key={index} item={item} index={index} />
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Everything you need for
            <Box component="span" sx={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              ml: 1 
            }}>
              confident parenting
            </Box>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            ParenticAI combines cutting-edge AI technology with evidence-based parenting wisdom
            to support you every step of the way.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {features.map((feature: Feature, index: number) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: 'primary.main',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Try AI Chat Section */}
      <Box id="try-ai-chat" sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
              Try ParenticAI{' '}
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Right Now
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Ask any parenting question - no sign-up required! Experience our AI assistant instantly.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} lg={8}>
              {/* Quick Questions */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Try these popular questions:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} justifyContent="center">
                  {quickQuestions.map((question: string, index: number) => (
                    <Chip
                      key={index}
                      label={question}
                      variant="outlined"
                      onClick={() => handleQuickQuestion(question)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Chat Interface */}
              <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                {/* Messages */}
                <Box sx={{ 
                  flex: 1, 
                  p: 2, 
                  overflow: 'auto',
                  backgroundColor: 'white'
                }}>
                  <Stack spacing={2}>
                    {messages.map((message: Message) => (
                      <Box 
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start',
                          gap: 1
                        }}
                      >
                        {message.sender === 'ai' && (
                          <Avatar sx={{ backgroundColor: 'primary.main' }}>
                            <Psychology />
                          </Avatar>
                        )}
                        
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                            color: message.sender === 'user' ? 'white' : 'text.primary',
                          }}
                        >
                          <Typography variant="body1">
                            {message.text}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.7,
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Paper>

                        {message.sender === 'user' && (
                          <Avatar sx={{ backgroundColor: 'secondary.main' }}>
                            <Person />
                          </Avatar>
                        )}
                      </Box>
                    ))}
                    
                    {isLoading && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ backgroundColor: 'primary.main' }}>
                          <Psychology />
                        </Avatar>
                        <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                          <Typography variant="body1">
                            AI is thinking...
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </Stack>
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'white' }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={3}
                      placeholder="Ask your parenting question..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      sx={{ 
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '&:disabled': {
                          backgroundColor: 'grey.300',
                        }
                      }}
                    >
                      <Send />
                    </IconButton>
                  </Stack>
                </Box>
              </Card>

              {/* Info Box */}
              <Card sx={{ mt: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2">
                    💡 <strong>Like what you see?</strong> Sign up for free to save your conversations, 
                    create child profiles for personalized advice, and access advanced features!
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      mt: 2,
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      }
                    }}
                  >
                    Sign Up Free
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Ready to transform your parenting journey?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of parents who trust ParenticAI for personalized guidance and support.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'grey.100',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Start Your Free Journey
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 