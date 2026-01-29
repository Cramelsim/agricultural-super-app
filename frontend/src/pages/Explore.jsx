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
  Tabs,
  Tab,
} from '@mui/material';
import { Search, LocationOn, People, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExploreData } from '../store/slices/exploreSlice';

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { 
    experts, 
    communities, 
    trendingPosts,
    categories,
    loading, 
    error 
  } = useSelector((state) => state.explore);
  
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchExploreData());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredExperts = experts.filter(expert => 
    search === '' || 
    expert.name.toLowerCase().includes(search.toLowerCase()) ||
    expert.role.toLowerCase().includes(search.toLowerCase()) ||
    (expert.location && expert.location.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredCommunities = communities.filter(community =>
    search === '' || 
    community.name.toLowerCase().includes(search.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(search.toLowerCase()))
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
        Discover agricultural experts, communities, and trending content
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Experts" />
          <Tab label="Communities" />
          <Tab label="Trending" />
        </Tabs>
      </Box>
      
      {/* Categories Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="All"
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('all')}
            clickable
          />
          {categories.map((category) => (
            <Chip
              key={category.name || category}
              label={`${category.name || category} ${category.count ? `(${category.count})` : ''}`}
              color={selectedCategory === category.name ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(category.name)}
              clickable
            />
          ))}
        </Box>
      </Box>
      
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Agricultural Experts ({filteredExperts.length})
            </Typography>
            
            {filteredExperts.length === 0 ? (
              <Alert severity="info">
                No experts found. Try a different search term.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {filteredExperts.map((expert) => (
                  <Grid item xs={12} md={6} key={expert.id || expert.public_id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ width: 80, height: 80, mr: 3 }}
                          src={expert.profile_image}
                          alt={expert.name}
                        >
                          {expert.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="h6" 
                            component={Link} 
                            to={`/profile/${expert.public_id || expert.id}`}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {expert.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {expert.role || expert.expertise_area}
                          </Typography>
                          {expert.bio && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {expert.bio.length > 100 ? `${expert.bio.substring(0, 100)}...` : expert.bio}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
                            {expert.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn fontSize="small" />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                  {expert.location}
                                </Typography>
                              </Box>
                            )}
                            <Typography variant="body2">
                              {expert.follower_count || 0} followers
                            </Typography>
                            <Typography variant="body2">
                              {expert.post_count || 0} posts
                            </Typography>
                          </Box>
                        </Box>
                        <Button variant="outlined" size="small">
                          Follow
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
      
      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Communities ({filteredCommunities.length})
            </Typography>
            
            {filteredCommunities.length === 0 ? (
              <Alert severity="info">
                No communities found. Try a different search term.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {filteredCommunities.map((community) => (
                  <Grid item xs={12} md={6} key={community.id || community.public_id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {community.image_url ? (
                            <Avatar 
                              src={community.image_url} 
                              sx={{ width: 60, height: 60, mr: 2 }}
                            />
                          ) : (
                            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mr: 2 }}>
                              {community.name.charAt(0)}
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="h6">
                              {community.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {community.is_public ? 'Public' : 'Private'} Community
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {community.description || 'No description available'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <People fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {community.member_count || 0} members
                            </Typography>
                          </Box>
                          
                          <Button 
                            variant="contained" 
                            size="small" 
                            component={Link} 
                            to={`/communities/${community.public_id || community.id}`}
                          >
                            {community.is_public ? 'Join' : 'Request to Join'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
      
      {selectedTab === 2 && trendingPosts.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Trending Posts
            </Typography>
            
            <Grid container spacing={3}>
              {trendingPosts.map((post) => (
                <Grid item xs={12} key={post.id || post.public_id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {post.author?.profile_image ? (
                          <Avatar 
                            src={post.author.profile_image} 
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                            {post.author?.name?.charAt(0) || 'U'}
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="subtitle1">
                            {post.author?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(post.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                          <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="textSecondary">
                            Trending
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" gutterBottom>
                        {post.title}
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        {post.excerpt}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {post.category && (
                            <Chip label={post.category} size="small" />
                          )}
                          <Typography variant="body2" color="textSecondary">
                            {post.like_count || 0} likes • {post.comment_count || 0} comments
                          </Typography>
                        </Box>
                        
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/post/${post.public_id || post.id}`}
                        >
                          Read More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ExplorePage;