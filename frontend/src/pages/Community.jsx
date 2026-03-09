// src/pages/CommunitiesPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  Public,
  Lock,
  FilterList,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getCommunities, joinCommunity, createCommunity, getUserCommunities } from '../store/slices/communitySlice';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const CommunitiesPage = () => {
  const dispatch = useDispatch();
  const { 
    communities, 
    userCommunities, 
    isLoading, 
    error,
    total,
    page,
    per_page,
    pages 
  } = useSelector((state) => state.communities);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: '',
    is_public: true,
    image: null,
  });
  
  useEffect(() => {
    fetchCommunities();
    if (isAuthenticated) {
      dispatch(getUserCommunities());
    }
  }, [dispatch, isAuthenticated, currentPage, searchTerm, category, sortBy]);
  
  const fetchCommunities = () => {
    const params = {
      page: currentPage,
      per_page: 20,
      search: searchTerm,
      category: category || undefined,
    };
    dispatch(getCommunities(params));
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCommunities();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleJoinCommunity = (communityId) => {
    dispatch(joinCommunity(communityId)).then(() => {
      // Refresh communities after join/leave
      fetchCommunities();
      if (isAuthenticated) {
        dispatch(getUserCommunities());
      }
    });
  };
  
  const handleCreateCommunity = () => {
    const formData = new FormData();
    formData.append('name', newCommunity.name);
    formData.append('description', newCommunity.description);
    formData.append('is_public', newCommunity.is_public.toString());
    
    if (newCommunity.category) {
      formData.append('category', newCommunity.category);
    }
    
    if (newCommunity.image) {
      formData.append('image', newCommunity.image);
    }
    
    dispatch(createCommunity(formData)).then((success) => {
      if (success) {
        setOpenCreateDialog(false);
        setNewCommunity({
          name: '',
          description: '',
          category: '',
          is_public: true,
          image: null,
        });
        fetchCommunities();
        if (isAuthenticated) {
          dispatch(getUserCommunities());
        }
      }
    });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCommunity({
        ...newCommunity,
        image: e.target.files[0],
      });
    }
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortBy('recent');
    setCurrentPage(1);
  };
  
  const isUserMember = (community) => {
    if (!isAuthenticated) return false;
    
    // Check if user is in userCommunities
    return userCommunities.some(uc => uc.public_id === community.public_id);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Agricultural Communities
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create Community
          </Button>
        )}
      </Box>
      
      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="farming">Farming</MenuItem>
                <MenuItem value="livestock">Livestock</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="education">Education</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={handleSearch}
                fullWidth
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}
      
      {isLoading && communities.length === 0 ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* User's Communities (only if authenticated) */}
          {isAuthenticated && userCommunities.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Your Communities
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {userCommunities.slice(0, 4).map((community) => (
                  <Grid item xs={12} sm={6} md={3} key={community.public_id}>
                    <StyledCard>
                      <CardMedia
                        component="img"
                        height="140"
                        image={community.image_url || 'https://via.placeholder.com/300x140?text=Community'}
                        alt={community.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {community.name}
                          </Typography>
                          {community.is_public ? (
                            <Public fontSize="small" color="action" />
                          ) : (
                            <Lock fontSize="small" color="action" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {community.description?.substring(0, 80)}...
                        </Typography>
                        <Box>
                          <Chip
                            icon={<Group />}
                            label={`${community.member_count || 0} members`}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          component={Link}
                          to={`/communities/${community.public_id}`}
                          fullWidth
                        >
                          View
                        </Button>
                      </CardActions>
                    </StyledCard>
                  </Grid>
                ))}
                {userCommunities.length > 4 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        component={Link}
                        to="/user/communities"
                        variant="outlined"
                      >
                        View All Your Communities ({userCommunities.length})
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </>
          )}
          
          {/* All Communities */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              All Communities ({total || 0})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {page || 1} of {pages || 1}
            </Typography>
          </Box>
          
          {communities.length === 0 ? (
            <Alert severity="info">
              No communities found. {isAuthenticated && 'Be the first to create one!'}
            </Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                {communities.map((community) => {
                  const isMember = isUserMember(community);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={community.public_id}>
                      <StyledCard>
                        <CardMedia
                          component="img"
                          height="160"
                          image={community.image_url || 'https://via.placeholder.com/300x160?text=Community'}
                          alt={community.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography gutterBottom variant="h6" component="div" sx={{ flexGrow: 1 }}>
                              {community.name}
                            </Typography>
                            {community.is_public ? (
                              <Public fontSize="small" color="success" />
                            ) : (
                              <Lock fontSize="small" color="warning" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {community.description?.substring(0, 120) || 'No description available'}...
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                            <Chip
                              icon={<Group />}
                              label={`${community.member_count || 0} members`}
                              size="small"
                            />
                            {community.admin && (
                              <Typography variant="caption" color="text.secondary">
                                By {community.admin.username}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            component={Link}
                            to={`/communities/${community.public_id}`}
                          >
                            View Details
                          </Button>
                          {isAuthenticated ? (
                            <Button
                              size="small"
                              color={isMember ? "secondary" : "primary"}
                              onClick={() => handleJoinCommunity(community.public_id)}
                              sx={{ ml: 'auto' }}
                            >
                              {isMember ? 'Leave' : 'Join'}
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              component={Link}
                              to="/login"
                              sx={{ ml: 'auto' }}
                            >
                              Login to Join
                            </Button>
                          )}
                        </CardActions>
                      </StyledCard>
                    </Grid>
                  );
                })}
              </Grid>
              
              {/* Pagination */}
              
                </Box>
              )}
            </>
          )}
        </>
      )}
      
      {/* Create Community Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Create New Community</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Community Name *"
            fullWidth
            value={newCommunity.name}
            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newCommunity.description}
            onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category (optional)"
            fullWidth
            value={newCommunity.category}
            onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
            placeholder="e.g., Farming, Livestock, Technology"
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Community Image (optional)
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="community-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="community-image-upload">
              <Button variant="outlined" component="span">
                Choose Image
              </Button>
            </label>
            {newCommunity.image && (
              <Typography variant="caption" sx={{ ml: 2 }}>
                {newCommunity.image.name}
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Privacy Settings:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={newCommunity.is_public ? "contained" : "outlined"}
                onClick={() => setNewCommunity({ ...newCommunity, is_public: true })}
                startIcon={<Public />}
              >
                Public
              </Button>
              <Button
                variant={!newCommunity.is_public ? "contained" : "outlined"}
                onClick={() => setNewCommunity({ ...newCommunity, is_public: false })}
                startIcon={<Lock />}
              >
                Private
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {newCommunity.is_public 
                ? 'Anyone can join and see content' 
                : 'Only invited members can join and see content'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCommunity} 
            variant="contained"
            disabled={!newCommunity.name.trim()}
          >
            Create Community
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunitiesPage;