import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Stack,
  Avatar,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import { 
  Send, 
  Psychology, 
  Person, 
  AttachFile, 
  Mic, 
  Stop,
  Close
} from '@mui/icons-material';
import FormattedMessage from '../components/Common/FormattedMessage';
import { api, Child } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// TypeScript interfaces
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  images?: string[]; // Base64 or URLs
  audio?: string; // Base64 or URL
}

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const { firebaseUser, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI parenting assistant. How can I help you today?',
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
  
  // Child selection state
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('generic');
  const [loadingChildren, setLoadingChildren] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const childrenRef = useRef<Child[]>([]);

  const quickQuestions: string[] = [
    'How do I handle tantrums?',
    'Sleep training tips',
    'Healthy meal ideas',
    'Screen time guidelines',
    'Discipline strategies',
  ];

  // Auto-scroll to bottom
  const scrollToBottom = (immediate: boolean = false): void => {
    if (immediate) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  useEffect(() => {
    // Auto-scroll when messages change
    if (messages.length > 0) {
      scrollToBottom(!streamingMessageId);
    }
  }, [messages, streamingMessageId]);

  useEffect(() => {
    childrenRef.current = children;
  }, [children]);

  // Create sample child for new users (only if no children exist and no sample child already exists)
  const createSampleChild = useCallback(async () => {
    if (!firebaseUser?.uid || !token) return;

    // Check if a sample child already exists
    const hasSampleChild = childrenRef.current.some(c => c.name === 'Sample Child');
    if (hasSampleChild) return;

    try {
      const sampleChild = await api.createChild({
        name: 'Sample Child',
        age: 5,
        gender: 'Other',
        hobbies: ['Reading', 'Drawing'],
        interests: ['Science', 'Art'],
        personality_traits: ['Curious', 'Creative'],
        school_grade: 'Kindergarten',
      }, firebaseUser.uid, token);

      setChildren(prev => [...prev, sampleChild]);
      setSelectedChildId(sampleChild.id.toString());
    } catch (error) {
      console.error('Error creating sample child:', error);
    }
  }, [firebaseUser?.uid, token]);

  // Load children on mount
  useEffect(() => {
    const loadChildren = async () => {
      if (!firebaseUser?.uid || !token) return;
      
      try {
        setLoadingChildren(true);
        const childrenData = await api.getChildren(firebaseUser.uid, token);
        setChildren(childrenData);
        
        // If no children exist, create a sample child
        if (childrenData.length === 0) {
          await createSampleChild();
        }
      } catch (error) {
        console.error('Error loading children:', error);
      } finally {
        setLoadingChildren(false);
      }
    };
    
    loadChildren();
  }, [firebaseUser, token, createSampleChild]);

  // Load chat history when child selection changes (only after children are loaded)
  useEffect(() => {
    const loadHistory = async () => {
      if (!firebaseUser?.uid || !token || loadingChildren) return;
      
      try {
        const selectedChild = selectedChildId === 'generic' 
          ? null 
          : children.find(c => c.id.toString() === selectedChildId);
        
        const history = await api.getChatHistory(
          firebaseUser.uid, 
          selectedChild?.id || null, 
          50, 
          token
        );
        
        // Convert history to Message format
        const historyMessages: Message[] = history.flatMap((item) => [
          {
            id: `history-user-${item.id}`,
            text: item.message,
            sender: 'user' as const,
            timestamp: new Date(item.timestamp)
          },
          {
            id: `history-ai-${item.id}`,
            text: item.response,
            sender: 'ai' as const,
            timestamp: new Date(item.timestamp)
          }
        ]);
        
        // Replace messages with history, or show welcome message if no history
        if (historyMessages.length > 0) {
          setMessages(historyMessages);
        } else {
          setMessages([{
            id: '1',
            text: 'Hello! I\'m your AI parenting assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date()
          }]);
        }
      } catch (historyError) {
        console.error('Error loading chat history:', historyError);
        // Keep current messages if history fails to load
      }
    };
    
    loadHistory();
  }, [firebaseUser, token, selectedChildId, children, loadingChildren]);

  // Format child data as context for AI
  const formatChildContext = (child: Child | null): string[] => {
    if (!child) return [];
    
    const context: string[] = [];
    context.push(`Child's name: ${child.name}`);
    context.push(`Age: ${child.age} years old`);
    context.push(`Gender: ${child.gender}`);
    
    if (child.school_grade) {
      context.push(`School grade: ${child.school_grade}`);
    }
    
    if (child.hobbies && child.hobbies.length > 0) {
      context.push(`Hobbies: ${child.hobbies.join(', ')}`);
    }
    
    if (child.interests && child.interests.length > 0) {
      context.push(`Interests: ${child.interests.join(', ')}`);
    }
    
    if (child.personality_traits && child.personality_traits.length > 0) {
      context.push(`Personality traits: ${child.personality_traits.join(', ')}`);
    }
    
    if (child.favorite_activities && child.favorite_activities.length > 0) {
      context.push(`Favorite activities: ${child.favorite_activities.join(', ')}`);
    }
    
    if (child.challenges) {
      context.push(`Challenges: ${child.challenges}`);
    }
    
    if (child.achievements) {
      context.push(`Achievements: ${child.achievements}`);
    }
    
    if (child.special_needs) {
      context.push(`Special needs: ${child.special_needs}`);
    }
    
    if (child.studies && child.studies.length > 0) {
      context.push(`Studies: ${child.studies.join(', ')}`);
    }
    
    return context;
  };

  // Cleanup
  useEffect(() => {
    return () => {
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

    // Reset input
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

    // Create a placeholder AI message
    const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
      id: aiMessageId,
      text: '',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);
    scrollToBottom(true);

    // Get child context if a child is selected
    const selectedChild = selectedChildId === 'generic' 
      ? null 
      : children.find(c => c.id.toString() === selectedChildId);
    const childContext = formatChildContext(selectedChild || null);

    try {
      // For now, we'll only send text. Image and audio support can be added to API later
      await api.sendChatMessageStream(
        currentMessage || '[Image or audio message]',
        childContext,
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
          scrollToBottom(true);
        },
        (error: Error) => {
          console.error('Error streaming message:', error);
          setIsLoading(false);
          setStreamingMessageId(null);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' }
              : msg
          ));
          scrollToBottom(true);
        },
        firebaseUser?.uid || null,
        selectedChild?.id || null
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setStreamingMessageId(null);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' }
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
    <Box
      sx={{
        height: 'calc(100vh - 112px)', // Account for Toolbar (64px) + Container padding (48px)
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        position: 'relative',
        mx: -3, // Remove Container padding
        my: -3, // Remove Container padding
      }}
    >
      {/* Child Selector - Top Left */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper', display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="child-select-label">Chat Context</InputLabel>
          <Select
            labelId="child-select-label"
            id="child-select"
            value={selectedChildId}
            label="Chat Context"
            onChange={(e) => setSelectedChildId(e.target.value)}
            disabled={loadingChildren}
          >
            <MenuItem value="generic">Generic Chat</MenuItem>
            {children.map((child) => (
              <MenuItem key={child.id} value={child.id.toString()}>
                {child.name} ({child.age} years)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedChildId !== 'generic' && (() => {
          const child = children.find(c => c.id.toString() === selectedChildId);
          return child ? (
            <Typography variant="body2" color="text.secondary">
              Chatting about: {child.name}
        </Typography>
          ) : null;
        })()}
      </Box>

      {/* Quick Questions - Only show when no messages or at top */}
      {messages.length <= 1 && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Quick Questions:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
                    color: 'white',
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        sx={{
            flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 1, sm: 2 },
          py: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? '#555' : '#888',
            borderRadius: '4px',
            '&:hover': {
              background: theme.palette.mode === 'dark' ? '#777' : '#555',
            },
          },
        }}
      >
        <Box sx={{ maxWidth: '768px', mx: 'auto' }}>
          <Stack spacing={0}>
              {messages.map((message: Message) => (
                <Box 
                  key={message.id}
                  sx={{
                    display: 'flex',
                  gap: 2,
                  py: 3,
                  px: 2,
                  backgroundColor: message.sender === 'user' 
                    ? (theme.palette.mode === 'dark' ? 'rgba(25, 195, 125, 0.1)' : '#f7f7f8')
                    : 'background.paper',
                  '&:hover': {
                    backgroundColor: message.sender === 'user'
                      ? (theme.palette.mode === 'dark' ? 'rgba(25, 195, 125, 0.15)' : '#f0f0f0')
                      : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa'),
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
                  backgroundColor: 'background.paper',
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
          </Box>

          {/* Input Area */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          p: 2,
        }}
      >
        <Box sx={{ maxWidth: '768px', mx: 'auto' }}>
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
                    border: 1,
                    borderColor: 'divider',
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
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 1,
              backgroundColor: 'background.paper',
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 0 0 2px rgba(99, 102, 241, 0.3)'
                  : '0 0 0 2px rgba(99, 102, 241, 0.1)',
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
                    ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5')
                    : '#19c37d',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: (!inputMessage.trim() && selectedImages.length === 0 && !audioBlob) || isLoading
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5')
                      : '#16a570',
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#999',
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
      </Box>
    </Box>
  );
};

export default ChatPage; 
