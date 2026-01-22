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

     {/* Features */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Agriculture sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Expert Advice
              </Typography>
              <Typography>
                Get advice from agricultural experts and experienced farmers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Market Prices
              </Typography>
              <Typography>
                Stay updated with real-time market prices for your produce
              </Typography>
            </CardContent>
          </Card>
        </Grid>
         <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Group sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Communities
              </Typography>
              <Typography>
                Join farming communities and connect with peers
              </Typography>
            </CardContent>
          </Card>
        </Grid>