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
