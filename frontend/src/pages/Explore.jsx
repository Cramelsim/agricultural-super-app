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

