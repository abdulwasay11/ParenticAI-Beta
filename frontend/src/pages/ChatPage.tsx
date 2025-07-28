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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions: string[] = [
    'How do I handle tantrums?',
    'Sleep training tips',
    'Healthy meal ideas',
    'Screen time guidelines',
    'Discipline strategies',
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
      // Make real API call to Llama 3 via backend
      const response = await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          child_context: [] // TODO: Add actual child context from profiles
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
        text: 'Sorry, I encountered an error while processing your request. Please make sure the AI service is running and try again.',
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
              
              {isLoading && (
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