import React, { useState, useRef, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  Psychology,
  ChildCare,
  Chat,
  Security,
  TrendingUp,
  Send,
  Person,
  AttachFile,
  Mic,
  Stop,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FormattedMessage from './components/Common/FormattedMessage';
import { api } from './utils/api';

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
  images?: string[]; // Base64 or URLs
  audio?: string; // Base64 or URL
}

// Features data with proper typing
const features: Feature[] = [
  {
    icon: <Psychology />,
    title: 'AI-Powered Guidance',
    description: 'Get personalized parenting advice from our advanced AI assistant trained on child development expertise. No signup required to start!',
  },
  {
    icon: <ChildCare />,
    title: 'Children Database',
    description: 'Store your children\'s information for better context. Track their interests, personality traits, development milestones, and more.',
  },
  {
    icon: <Chat />,
    title: 'Smart Conversations',
    description: 'Have natural conversations with our AI that remembers your family context and provides relevant advice based on your children\'s profiles.',
  },
  {
    icon: <TrendingUp />,
    title: 'Parent Profile Building',
    description: 'Build your parenting profile over time. Track how good your parenting is, identify your style, and discover areas for improvement.',
  },
  {
    icon: <Psychology />,
    title: 'Personality Assessment',
    description: 'AI-powered personality assessment for children using facial features analysis and quizzes. Store and maintain comprehensive child profiles.',
  },
  {
    icon: <Security />,
    title: 'Safe & Secure',
    description: 'Your family data is protected with enterprise-grade security and privacy measures.',
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
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const quickQuestions: string[] = [
    'How do I handle tantrums?',
    'Sleep training tips for toddlers',
    'Healthy meal ideas for picky eaters',
    'Screen time guidelines by age',
    'Positive discipline strategies',
  ];

  const scrollToBottom = (immediate: boolean = false): void => {
    if (immediate) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      // Debounce scrolling during streaming
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    // Only scroll immediately when not streaming
    if (!streamingMessageId) {
      scrollToBottom(false);
    }
  }, [messages, streamingMessageId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setSelectedImages(prev => [...prev, base64String]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clear audio
  const clearAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() && selectedImages.length === 0 && !audioBlob) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      audio: audioBlob ? audioUrl || undefined : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setSelectedImages([]);
    clearAudio();
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);
    scrollToBottom(true); // Scroll immediately when message starts

    try {
      await api.sendChatMessageStream(
        currentMessage || '[Image or audio message]',
        [],
        (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: msg.text + chunk }
              : msg
          ));
          // Smooth scroll during streaming
          if (Math.random() < 0.15) {
            scrollToBottom(false);
          }
        },
        () => {
          setIsLoading(false);
          setStreamingMessageId(null);
          scrollToBottom(true); // Final scroll when complete
        },
        (error: Error) => {
          console.error('Error streaming message:', error);
          setIsLoading(false);
          setStreamingMessageId(null);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: 'Sorry, I encountered an error. Please try again in a moment! For the best experience with saved conversations and personalized advice, consider signing up.' }
              : msg
          ));
          scrollToBottom(true);
        }
      );
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setIsLoading(false);
      setStreamingMessageId(null);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: 'Sorry, I encountered an error. Please try again in a moment! For the best experience with saved conversations and personalized advice, consider signing up.' }
          : msg
      ));
      scrollToBottom(true);
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
                  Talk to a ParenticAI Assistant without any signup! Get instant parenting advice right now.
                  <Box component="span" sx={{ display: 'block', mt: 2, fontSize: '1.1rem' }}>
                    Sign up to unlock powerful features: children database, parent profile building with progress tracking, and AI-powered personality assessments.
                  </Box>
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
                  Perfect for parents who want:
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
      <Container maxWidth="lg" sx={{ py: 8, px: { xs: 2, md: 3 } }}>
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
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
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
            <Grid item xs={12}>
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

              {/* Chat Interface - ChatGPT Style */}
              <Card 
                sx={{ 
                  height: '600px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5',
                }}
              >
                {/* Messages */}
                <Box
                  ref={messagesContainerRef}
                  sx={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    backgroundColor: '#f7f7f8',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: '4px',
                      '&:hover': {
                        background: '#555',
                      },
                    },
                  }}
                >
                  <Stack spacing={0}>
                    {messages.map((message: Message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          py: 3,
                          px: 2,
                          backgroundColor: message.sender === 'user' ? '#f7f7f8' : 'white',
                          '&:hover': {
                            backgroundColor: message.sender === 'user' ? '#f0f0f0' : '#fafafa',
                          },
                        }}
                      >
                        {/* Avatar */}
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: message.sender === 'user' ? '#19c37d' : '#ab68ff',
                            flexShrink: 0,
                          }}
                        >
                          {message.sender === 'user' ? (
                            <Person sx={{ fontSize: 20 }} />
                          ) : (
                            <Psychology sx={{ fontSize: 20 }} />
                          )}
                        </Avatar>

                        {/* Message Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Images */}
                          {message.images && message.images.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                              {message.images.map((img, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    position: 'relative',
                                    maxWidth: '200px',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <img
                                    src={img}
                                    alt={`Upload ${idx + 1}`}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      display: 'block',
                                    }}
                                  />
                                </Box>
                              ))}
                            </Stack>
                          )}

                          {/* Audio */}
                          {message.audio && (
                            <Box sx={{ mb: 1 }}>
                              <audio controls src={message.audio} style={{ width: '100%', maxWidth: '400px' }} />
                            </Box>
                          )}

                          {/* Text */}
                          {message.text && (
                            <Box>
                              {message.sender === 'ai' ? (
                                <FormattedMessage text={message.text} variant="body1" />
                              ) : (
                                <Typography
                                  variant="body1"
                                  sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.75,
                                  }}
                                >
                                  {message.text}
                                </Typography>
                              )}
                            </Box>
                          )}

                          {/* Timestamp */}
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              mt: 0.5,
                              display: 'block',
                              fontSize: '0.75rem',
                            }}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && !streamingMessageId && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          py: 3,
                          px: 2,
                          backgroundColor: 'white',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#ab68ff',
                          }}
                        >
                          <Psychology sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            Thinking...
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <div ref={messagesEndRef} />
                  </Stack>
                </Box>

                {/* Input Area */}
                <Box
                  sx={{
                    borderTop: '1px solid #e5e5e5',
                    backgroundColor: 'white',
                    p: 2,
                  }}
                >
                  {/* Selected Images Preview */}
                  {selectedImages.length > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedImages.map((img, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #e5e5e5',
                          }}
                        >
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImage(idx)}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Audio Preview */}
                  {audioUrl && (
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <audio controls src={audioUrl} style={{ flex: 1, maxWidth: '400px' }} />
                      <IconButton size="small" onClick={clearAudio} color="error">
                        <Close />
                      </IconButton>
                    </Box>
                  )}

                  {/* Input Box */}
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 1,
                      '&:focus-within': {
                        borderColor: 'primary.main',
                        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.1)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ width: '100%', alignItems: 'flex-end' }}>
                      {/* Attachment Button */}
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        sx={{ color: 'text.secondary' }}
                      >
                        <AttachFile />
                      </IconButton>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />

                      {/* Text Input */}
                      <TextField
                        fullWidth
                        multiline
                        maxRows={6}
                        placeholder="Message ParenticAI..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            fontSize: '0.95rem',
                            py: 0.5,
                          },
                        }}
                        sx={{ flex: 1 }}
                      />

                      {/* Audio Recording Button */}
                      {!isRecording ? (
                        <IconButton
                          size="small"
                          onClick={startRecording}
                          disabled={isLoading || !!audioBlob}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Mic />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={stopRecording}
                          sx={{ color: 'error.main' }}
                        >
                          <Stop />
                        </IconButton>
                      )}

                      {/* Send Button */}
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={(!inputMessage.trim() && selectedImages.length === 0 && !audioBlob) || isLoading}
                        sx={{
                          backgroundColor: (!inputMessage.trim() && selectedImages.length === 0 && !audioBlob) || isLoading
                            ? '#e5e5e5'
                            : '#19c37d',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: (!inputMessage.trim() && selectedImages.length === 0 && !audioBlob) || isLoading
                              ? '#e5e5e5'
                              : '#16a570',
                          },
                          '&:disabled': {
                            backgroundColor: '#e5e5e5',
                            color: '#999',
                          },
                        }}
                      >
                        <Send />
                      </IconButton>
                    </Stack>
                  </Paper>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'error.main',
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                          },
                        }}
                      />
                      <Typography variant="caption" color="error">
                        Recording...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>

              {/* Info Box */}
              <Card sx={{ mt: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    💡 <strong>Sign up to unlock powerful features:</strong>
                  </Typography>
                  <Box component="ul" sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto', mb: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      <strong>Children Database:</strong> Store your children's information for better AI context and personalized advice
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      <strong>Parent Profile Building:</strong> Track your parenting progress over time, identify your style, and discover improvement areas
                    </Typography>
                    <Typography component="li" variant="body2">
                      <strong>Personality Assessment:</strong> AI-powered personality analysis using facial features and quizzes to build comprehensive child profiles
                    </Typography>
                  </Box>
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
        <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 2, md: 3 } }}>
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