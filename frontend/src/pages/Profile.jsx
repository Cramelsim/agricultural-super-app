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
  const userPosts = [
    { id: 1, title: 'Tomato Blight Prevention', likes: 42, comments: 12, date: '2 days ago' },
    { id: 2, title: 'Composting Guide for Beginners', likes: 85, comments: 24, date: '1 week ago' },
    { id: 3, title: 'Drip Irrigation Setup', likes: 56, comments: 18, date: '2 weeks ago' },
  ];
   const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
 return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 150, height: 150, mb: 2 }}
                src=""
              >
                {user.name.charAt(0)}
              </Avatar>
              <Button variant="outlined" startIcon={<Edit />}>
                Edit Profile
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4">{user.name}</Typography>
              <Typography variant="h6" color="textSecondary">
                {user.username}
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              {user.bio}
            </Typography>
            
Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography>{user.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1 }} />
                  <Typography>{user.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1 }} />
                  <Typography>{user.phone}</Typography>
                </Box>
              </Grid>
            </Grid>
             {/* Expertise */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Expertise
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {user.expertise.map((skill, index) => (
                  <Chip key={index} label={skill} icon={<Agriculture />} />
                ))}
              </Box>
            </Box>