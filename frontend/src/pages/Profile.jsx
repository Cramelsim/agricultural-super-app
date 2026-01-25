import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Avatar,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
} from '@mui/material';
import { Edit, LocationOn, Email, Phone, Agriculture } from '@mui/icons-material';

const ProfilePage = () => {
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  // Mock user data
  const user = {
    name: 'John Farmer',
    username: '@johnfarmer',
    bio: 'Third-generation farmer specializing in organic vegetables. Passionate about sustainable agriculture and sharing knowledge with the farming community.',
    location: 'Nakuru, Kenya',
    email: 'john@farm.com',
    phone: '+254 712 345 678',
    joinDate: 'January 2023',
    followers: 1248,
    following: 342,
    posts: 47,
    expertise: ['Organic Farming', 'Vegetables', 'Irrigation', 'Soil Health'],
  };
