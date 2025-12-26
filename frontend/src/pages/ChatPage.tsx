import React, { useState, useRef, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  TextField, 
  Button, 
  Stack,
  Avatar,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import { Send, Psychology, Person } from '@mui/icons-material';
import FormattedMessage from '../components/Common/FormattedMessage';
import { api } from '../utils/api';

// TypeScript interfaces
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const quickQuestions: string[] = [
    'How do I handle tantrums?',
    'Sleep training tips',
    'Healthy meal ideas',
    'Screen time guidelines',
    'Discipline strategies',
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
    };
  }, []);

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

    // Create a placeholder AI message that we'll update as chunks arrive
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
      // Use streaming API
      await api.sendChatMessageStream(
        currentMessage,
        [], // TODO: Add actual child context from profiles
        (chunk: string) => {
          // Update the AI message with each chunk
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: msg.text + chunk }
              : msg
          ));
          // Only scroll occasionally during streaming (every 10 chunks or so)
          if (Math.random() < 0.1) {
            scrollToBottom(false);
          }
        },
        () => {
          // Stream complete
          setIsLoading(false);
          setStreamingMessageId(null);
          scrollToBottom(true); // Final scroll when complete
        },
        (error: Error) => {
          console.error('Error streaming message:', error);
          setIsLoading(false);
          setStreamingMessageId(null);
          
          // Update the message with error
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: 'Sorry, I encountered an error while processing your request. Please try again.' }
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
          ? { ...msg, text: 'Sorry, I encountered an error while processing your request. Please make sure the AI service is running and try again.' }
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
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          AI Chat Assistant
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Ask your AI parenting assistant for advice, tips, and guidance.
        </Typography>

        {/* Quick Questions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Quick Questions:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {quickQuestions.map((question: string, index: number) => (
              <Chip
                key={index}
                label={question}
                variant="outlined"
                onClick={() => handleQuickQuestion(question)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>

        {/* Chat Area */}
        <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box sx={{ 
            flex: 1, 
            p: 2, 
            overflow: 'auto',
            backgroundColor: 'grey.50'
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
                      backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    {message.sender === 'ai' ? (
                      <FormattedMessage text={message.text} variant="body1" />
                    ) : (
                      <Typography variant="body1">
                        {message.text}
                      </Typography>
                    )}
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
              
              {/* Only show loading indicator if not streaming (no placeholder message) */}
              {isLoading && !streamingMessageId && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ backgroundColor: 'primary.main' }}>
                    <Psychology />
                  </Avatar>
                  <Paper sx={{ p: 2 }}>
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
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
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
        <Card sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">
              💡 <strong>Tip:</strong> The AI assistant uses information from your children's profiles to provide personalized advice. 
              Make sure to complete their profiles for the best recommendations!
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
};

export default ChatPage; 