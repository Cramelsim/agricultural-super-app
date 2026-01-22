import React from 'react';
import { Container, Grid, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { Agriculture, TrendingUp, Group, Forum } from '@mui/icons-material';

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to AgriConnect
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph sx={{ mb: 4 }}>
          Connecting farmers, sharing knowledge, growing together
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
          >
            Join Now
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/feed"
          >
            Explore Feed
          </Button>
        </Box>
      </Box>