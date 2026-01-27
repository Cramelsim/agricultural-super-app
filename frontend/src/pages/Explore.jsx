// src/pages/ExplorePage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, LocationOn, People } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExperts, fetchCommunities } from '../store/slices/exploreSlice';

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { 
    experts, 
    communities, 
    loading, 
    error 
  } = useSelector((state) => state.explore);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchExperts());
    dispatch(fetchCommunities());
  }, [dispatch]);

  const categories = [
    'All', 'Experts', 'Communities', 'Posts', 'Videos', 'Events'
  ];

  const filteredExperts = experts.filter(expert => 
    expert.name.toLowerCase().includes(search.toLowerCase()) ||
    expert.role.toLowerCase().includes(search.toLowerCase()) ||
    expert.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(search.toLowerCase()) ||
    community.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Explore
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Discover agricultural experts, communities, and resources
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
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Top Experts ({filteredExperts.length})
          </Typography>
          
          {filteredExperts.length === 0 ? (
            <Alert severity="info">
              No experts found. Try a different search term.
            </Alert>
          ) : (
            filteredExperts.map((expert) => (
              <Card key={expert.id || expert._id} sx={{ mb: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ width: 60, height: 60, mr: 2 }}
                    src={expert.profile_image || expert.avatar}
                    alt={expert.name}
                  >
                    {expert.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component={Link} to={`/profile/${expert.id || expert._id}`}>
                      {expert.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {expert.role || expert.expertise || 'Agricultural Expert'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {expert.location && (
                        <>
                          <LocationOn fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {expert.location}
                          </Typography>
                        </>
                      )}
                      {expert.followers !== undefined && (
                        <Typography variant="body2" sx={{ ml: expert.location ? 2 : 0 }}>
                          {expert.followers.toLocaleString()} followers
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Button variant="outlined" size="small">
                    Follow
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Popular Communities ({filteredCommunities.length})
          </Typography>
          
          {filteredCommunities.length === 0 ? (
            <Alert severity="info">
              No communities found. Try a different search term.
            </Alert>
          ) : (
            filteredCommunities.map((community) => (
              <Card key={community.id || community._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {community.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {community.description || 'Agricultural community'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {community.members ? community.members.toLocaleString() : '0'} members
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {community.category && (
                      <Chip 
                        label={community.category} 
                        size="small" 
                      />
                    )}
                    <Button 
                      variant="contained" 
                      size="small" 
                      component={Link} 
                      to={`/communities/${community.id || community._id}`}
                    >
                      {community.is_private ? 'Request to Join' : 'Join'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExplorePage;