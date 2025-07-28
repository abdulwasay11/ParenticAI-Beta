import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Stack,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Psychology, Person, Search, ExpandMore, FilterList } from '@mui/icons-material';

// TypeScript interfaces
interface ChatSession {
  id: string;
  title: string;
  date: Date;
  messageCount: number;
  topics: string[];
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Mock data
  const chatSessions: ChatSession[] = [
    {
      id: '1',
      title: 'Toddler Sleep Issues',
      date: new Date('2024-01-15'),
      messageCount: 12,
      topics: ['Sleep', 'Toddler', 'Bedtime Routine'],
      messages: [
        {
          id: '1-1',
          text: 'My 2-year-old won\'t go to sleep at bedtime. Any suggestions?',
          sender: 'user',
          timestamp: new Date('2024-01-15T20:00:00')
        },
        {
          id: '1-2',
          text: 'Establishing a consistent bedtime routine is crucial for toddlers. Here are some strategies...',
          sender: 'ai',
          timestamp: new Date('2024-01-15T20:01:00')
        }
      ]
    },
    {
      id: '2',
      title: 'Picky Eating Strategies',
      date: new Date('2024-01-14'),
      messageCount: 8,
      topics: ['Nutrition', 'Eating', 'Toddler'],
      messages: [
        {
          id: '2-1',
          text: 'How can I get my child to try new foods?',
          sender: 'user',
          timestamp: new Date('2024-01-14T18:30:00')
        },
        {
          id: '2-2',
          text: 'Introducing new foods can be challenging. Try these evidence-based approaches...',
          sender: 'ai',
          timestamp: new Date('2024-01-14T18:31:00')
        }
      ]
    },
    {
      id: '3',
      title: 'Discipline and Boundaries',
      date: new Date('2024-01-13'),
      messageCount: 15,
      topics: ['Discipline', 'Behavior', 'Boundaries'],
      messages: [
        {
          id: '3-1',
          text: 'What\'s the best way to set boundaries without being too strict?',
          sender: 'user',
          timestamp: new Date('2024-01-13T16:15:00')
        },
        {
          id: '3-2',
          text: 'Positive discipline focuses on teaching rather than punishing. Here\'s how to implement it...',
          sender: 'ai',
          timestamp: new Date('2024-01-13T16:16:00')
        }
      ]
    }
  ];

  const allTopics: string[] = Array.from(
    new Set(chatSessions.flatMap(session => session.topics))
  );

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTopic = selectedTopic === '' || session.topics.includes(selectedTopic);
    
    return matchesSearch && matchesTopic;
  });

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          Chat History
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          View and search through your previous conversations with the AI assistant.
        </Typography>

        {/* Search and Filter */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Filter by topic:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    label="All Topics"
                    variant={selectedTopic === '' ? 'filled' : 'outlined'}
                    onClick={() => setSelectedTopic('')}
                    sx={{ cursor: 'pointer' }}
                  />
                  {allTopics.map((topic: string) => (
                    <Chip
                      key={topic}
                      label={topic}
                      variant={selectedTopic === topic ? 'filled' : 'outlined'}
                      onClick={() => setSelectedTopic(topic)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Chat Sessions */}
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No conversations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || selectedTopic 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start chatting with the AI assistant to see your conversation history here.'
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filteredSessions.map((session: ChatSession) => (
              <Accordion key={session.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ width: '100%', pr: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {session.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.date.toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                        {session.topics.map((topic: string) => (
                          <Chip key={topic} label={topic} size="small" variant="outlined" />
                        ))}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {session.messageCount} messages
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Stack spacing={2}>
                    {session.messages.map((message: ChatMessage) => (
                      <Box 
                        key={message.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 2,
                          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {message.sender === 'ai' && (
                          <Avatar sx={{ backgroundColor: 'primary.main' }}>
                            <Psychology />
                          </Avatar>
                        )}
                        
                        <Card 
                          sx={{ 
                            maxWidth: '70%',
                            backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                            color: message.sender === 'user' ? 'white' : 'text.primary'
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="body2">
                              {message.text}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                opacity: 0.7,
                                display: 'block',
                                mt: 1
                              }}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                          </CardContent>
                        </Card>

                        {message.sender === 'user' && (
                          <Avatar sx={{ backgroundColor: 'secondary.main' }}>
                            <Person />
                          </Avatar>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {/* Stats Card */}
        <Card sx={{ backgroundColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conversation Statistics
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {chatSessions.length}
                </Typography>
                <Typography variant="body2">
                  Total Conversations
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {chatSessions.reduce((sum, session) => sum + session.messageCount, 0)}
                </Typography>
                <Typography variant="body2">
                  Total Messages
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {allTopics.length}
                </Typography>
                <Typography variant="body2">
                  Topics Discussed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ChatHistoryPage; 