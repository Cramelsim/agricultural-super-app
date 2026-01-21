import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Avatar,
  IconButton,
} from '@mui/material';
import { Search, LocationOn, Star, StarBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ExplorePage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

 const categories = [
    'All', 'Experts', 'Communities', 'Posts', 'Videos', 'Events'
  ];

  const experts = [
    { id: 1, name: 'Dr. Jane Farmer', role: 'Soil Scientist', location: 'Nairobi', followers: 1250, avatar: '' },
    { id: 2, name: 'John AgriTech', role: 'Farm Technology', location: 'Kampala', followers: 890, avatar: '' },
    { id: 3, name: 'Maria Green', role: 'Organic Farming', location: 'Accra', followers: 2100, avatar: '' },
    { id: 4, name: 'David Harvest', role: 'Crop Specialist', location: 'Lagos', followers: 1500, avatar: '' },
  ];
const communities = [
    { id: 1, name: 'Organic Farmers', members: 5200, description: 'Discuss organic farming practices' },
    { id: 2, name: 'Dairy Farmers', members: 3200, description: 'For dairy farming enthusiasts' },
    { id: 3, name: 'Smart Irrigation', members: 1800, description: 'Modern irrigation techniques' },
    { id: 4, name: 'Young Farmers', members: 4100, description: 'Next generation of farmers' },
  ];
   return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Explore
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search experts, communities, posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

<Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              color={selectedCategory === cat.toLowerCase() ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat.toLowerCase())}
              clickable
            />
          ))}
        </Box>
      </Box>