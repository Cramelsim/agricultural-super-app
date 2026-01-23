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