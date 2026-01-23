import React, { useState } from 'react';
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
  IconButton,
  Badge,
} from '@mui/material';
import { Send, Search } from '@mui/icons-material';

const MessagesPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, name: 'John Farmer', lastMessage: 'Hey, how is the harvest?', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Agricultural Dept', lastMessage: 'New subsidy program announced', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'Seed Supplier', lastMessage: 'Your order is ready', time: '2 days ago', unread: 1 },
    { id: 4, name: 'Farmers Group', lastMessage: 'Meeting this Saturday', time: '3 days ago', unread: 0 },
  ]);
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage('');
    }
  };

   return (
    <Container maxWidth="lg" sx={{ py: 4, height: '80vh' }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                size="small"
                InputProps={{
                  startAdornment: <Search fontSize="small" />,
                }}
              />
            </Box>
            <List>
              {messages.map((chat) => (
                <ListItem
                  key={chat.id}
                  button
                  selected={selectedChat === chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                ></ListItem>
                <ListItemAvatar>
                    <Badge
                      badgeContent={chat.unread}
                      color="primary"
                      invisible={chat.unread === 0}
                    >
                      <Avatar>{chat.name.charAt(0)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">{chat.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {chat.time}
                        </Typography>
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
                        }}
                      >
                        {chat.lastMessage}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>