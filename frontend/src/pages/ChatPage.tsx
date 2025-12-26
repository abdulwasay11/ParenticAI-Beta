import React, { useState, useRef, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Stack,
  Avatar,
  IconButton,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Send, 
  Psychology, 
  Person, 
  AttachFile, 
  Mic, 
  Stop,
  Image as ImageIcon,
  Close
} from '@mui/icons-material';
import FormattedMessage from '../components/Common/FormattedMessage';
import { api } from '../utils/api';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

    try {
      // For now, we'll only send text. Image and audio support can be added to API later
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
        }
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
        backgroundColor: '#f7f7f8',
        position: 'relative',
        mx: -3, // Remove Container padding
        my: -3, // Remove Container padding
      }}
    >
      {/* Quick Questions - Only show when no messages or at top */}
      {messages.length <= 1 && (
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e5e5', backgroundColor: 'white' }}>
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
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          borderTop: '1px solid #e5e5e5',
          backgroundColor: 'white',
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
      </Box>
    </Box>
  );
};

export default ChatPage;
