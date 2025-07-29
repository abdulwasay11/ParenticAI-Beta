import React, { useState, useRef, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
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
import { Send, People, Person } from '@mui/icons-material';

// TypeScript interfaces
interface CommunityMessage {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

const CommunityPage: React.FC = () => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async (): Promise<void> => {
    try {
      const response = await fetch(getApiUrl('community/messages'));
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('community/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent
        })
      });

      if (response.ok) {
        // Refresh messages to show the new one
        await fetchMessages();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ backgroundColor: 'secondary.main' }}>
            <People />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Community Chat
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect with other parents, share experiences, and support each other
            </Typography>
          </Box>
        </Box>

        <Card sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">
              🌟 <strong>Welcome to the ParenticAI Community!</strong> This is a safe space for parents to chat, 
              share experiences, ask questions, and support each other. Please be respectful and kind. 
              Remember that everyone's parenting journey is unique.
            </Typography>
          </Box>
        </Card>

        {/* Community Guidelines */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Community Guidelines:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip label="Be Respectful" variant="outlined" size="small" />
            <Chip label="No Judgment" variant="outlined" size="small" />
            <Chip label="Support Others" variant="outlined" size="small" />
            <Chip label="Share Experiences" variant="outlined" size="small" />
            <Chip label="Ask Questions" variant="outlined" size="small" />
          </Stack>
        </Box>

        {/* Chat Interface */}
        <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box sx={{ 
            flex: 1, 
            p: 2, 
            overflow: 'auto',
            backgroundColor: 'grey.50'
          }}>
            {messages.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4, 
                color: 'text.secondary' 
              }}>
                <People sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1">
                  No messages yet. Be the first to start the conversation!
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map((message: CommunityMessage) => (
                  <Box 
                    key={message.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <Avatar sx={{ backgroundColor: 'primary.main', width: 32, height: 32 }}>
                      <Person sx={{ fontSize: 20 }} />
                    </Avatar>
                    
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        backgroundColor: 'white',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                          {message.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(message.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {message.content}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                
                {isLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ backgroundColor: 'primary.main', width: 32, height: 32 }}>
                      <Person sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                      <Typography variant="body2" color="text.secondary">
                        Sending message...
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'white' }}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Share your thoughts with the community..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                size="small"
              />
              <IconButton 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{ 
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.300',
                  }
                }}
              >
                <Send />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              💡 Tip: Press Enter to send, or Shift+Enter for a new line
            </Typography>
          </Box>
        </Card>

        {/* Additional Info */}
        <Card sx={{ backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">
              📝 <strong>Note:</strong> This is a public community space. Please don't share personal information 
              like your real name, address, or phone number. For personalized AI advice, use the private AI Chat feature.
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
};

export default CommunityPage; 