// src/pages/MessagesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  TextField,
  Button,
  Badge,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Send, Search } from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markAsRead,
  createConversation,
} from '../store/slices/messageSlice';

const MessagesPage = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  
  // Get data from Redux store
  const {
    conversations,
    currentMessages,
    currentConversation,
    isLoading,
    isSending,
    error,
    hasMoreMessages,
    page,
  } = useSelector((state) => state.messages);
  
  // Local state
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversationUser, setNewConversationUser] = useState('');

  // Fetch conversations on component mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessages({ conversationId: selectedChat, page: 1 }));
      // Mark conversation as read
      dispatch(markAsRead(selectedChat));
    }
  }, [selectedChat, dispatch]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectChat = (conversationId) => {
    setSelectedChat(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const messageData = {
      conversationId: selectedChat,
      content: newMessage.trim(),
    };
    
    try {
      await dispatch(sendMessage(messageData)).unwrap();
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleStartNewConversation = async () => {
    if (!newConversationUser.trim()) return;
    
    try {
      const result = await dispatch(createConversation({
        username: newConversationUser.trim(),
      })).unwrap();
      
      setSelectedChat(result.conversation.id);
      setNewConversationUser('');
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  if (isLoading && conversations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '80vh' }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search and New Chat */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Start new chat..."
                  value={newConversationUser}
                  onChange={(e) => setNewConversationUser(e.target.value)}
                  size="small"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartNewConversation()}
                />
                <Button
                  variant="outlined"
                  onClick={handleStartNewConversation}
                  disabled={!newConversationUser.trim() || isSending}
                >
                  New
                </Button>
              </Box>
            </Box>
            
            {/* Conversations List */}
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {filteredConversations.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </Typography>
              ) : (
                filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={selectedChat === conversation.id}
                    onClick={() => handleSelectChat(conversation.id)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unread_count || 0}
                        color="primary"
                        invisible={!conversation.unread_count}
                      >
                        <Avatar
                          src={conversation.other_user?.avatar}
                          sx={{ bgcolor: 'primary.main' }}
                        >
                          {getInitials(conversation.other_user?.username)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: conversation.unread_count ? 'bold' : 'normal' }}>
                            {conversation.other_user?.username || 'Unknown User'}
                          </Typography>
                          {conversation.last_message?.created_at && (
                            <Typography variant="caption" color="textSecondary">
                              {formatTime(conversation.last_message.created_at)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: conversation.unread_count ? 'bold' : 'normal',
                          }}
                        >
                          {conversation.last_message?.content || 'No messages yet'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Chat Window */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {conversations.find(c => c.id === selectedChat)?.other_user?.username || 'Unknown User'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {conversations.find(c => c.id === selectedChat)?.other_user?.email}
                  </Typography>
                </Box>
                
                {/* Messages Area */}
                <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                      <CircularProgress />
                    </Box>
                  ) : currentMessages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Load more button if there are more messages */}
                      {hasMoreMessages && (
                        <Button
                          onClick={() => dispatch(fetchMessages({ conversationId: selectedChat, page: page + 1 }))}
                          disabled={isLoading}
                          sx={{ mb: 2 }}
                        >
                          Load older messages
                        </Button>
                      )}
                      
                      {/* Messages */}
                      {currentMessages.map((message, index) => {
                        const isCurrentUser = message.sender_id === currentUser?.id; // You'll need to get current user from auth state
                        const showDate = index === 0 || 
                          new Date(message.created_at).toDateString() !== 
                          new Date(currentMessages[index - 1].created_at).toDateString();
                        
                        return (
                          <React.Fragment key={message.id}>
                            {showDate && (
                              <Divider sx={{ my: 2 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </Typography>
                              </Divider>
                            )}
                            
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                mb: 1,
                              }}
                            >
                              <Paper
                                sx={{
                                  p: 1.5,
                                  maxWidth: '70%',
                                  backgroundColor: isCurrentUser ? 'primary.main' : 'grey.100',
                                  color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="body2">{message.content}</Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    textAlign: 'right',
                                    mt: 0.5,
                                    opacity: 0.7,
                                    color: isCurrentUser ? 'primary.contrastText' : 'text.secondary',
                                  }}
                                >
                                  {formatTime(message.created_at)}
                                </Typography>
                              </Paper>
                            </Box>
                          </React.Fragment>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>
                
                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      size="small"
                      multiline
                      maxRows={4}
                      disabled={isSending}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      sx={{ minWidth: 'auto' }}
                    >
                      {isSending ? <CircularProgress size={24} /> : <Send />}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <Typography variant="h6" color="textSecondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessagesPage;