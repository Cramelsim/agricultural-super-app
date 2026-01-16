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
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  Public,
  Lock,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getCommunities, joinCommunity, createCommunity } from '../store/slices/communitySlice';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));
const CommunitiesPage = () => {
  const dispatch = useDispatch();
  const { communities, userCommunities, isLoading, error } = useSelector((state) => state.communities);
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    is_public: true,
    image: null,
  });
  useEffect(() => {
    dispatch(getCommunities());
  }, [dispatch]);
  
  const handleSearch = () => {
    dispatch(getCommunities({ search: searchTerm }));
  };
  const handleJoinCommunity = (communityId) => {
    dispatch(joinCommunity(communityId));
  };
  
const handleCreateCommunity = () => {
    dispatch(createCommunity(newCommunity)).then(() => {
      setOpenCreateDialog(false);
      setNewCommunity({
        name: '',
        description: '',
        is_public: true,
        image: null,
      });
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewCommunity({
        ...newCommunity,
        image: e.target.files[0],
      });
    }
  };
 return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Agricultural Communities
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Community
        </Button>
      </Box>

       {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <></>
         {/* User's Communities */}
          {userCommunities.length > 0 && (
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
                        image={community.image_url || '/default-community.jpg'}
                        alt={community.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {community.name}
                          {community.is_public ? (
                            <Public fontSize="small" sx={{ ml: 1 }} />
                          ) : (
                            <Lock fontSize="small" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {community.description?.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            icon={<Group />}
                            label={`${community.member_count} members`}
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
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => handleJoinCommunity(community.public_id)}
                        >
                          Leave
                        </Button>
                      </CardActions>
                    </StyledCard>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {/* All Communities */}
          <Typography variant="h6" gutterBottom>
            All Communities
          </Typography>
          {communities.length === 0 ? (
            <Alert severity="info">
              No communities found. Be the first to create one!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {communities.map((community) => (
                <Grid item xs={12} sm={6} md={4} key={community.public_id}>
                  <StyledCard>
                    <CardMedia
                      component="img"
                      height="160"
                      image={community.image_url || '/default-community.jpg'}
                      alt={community.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {community.name}
                        {community.is_public ? (
                          <Public fontSize="small" sx={{ ml: 1, color: 'success.main' }} />
                        ) : (
                          <Lock fontSize="small" sx={{ ml: 1, color: 'warning.main' }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {community.description?.substring(0, 150)}...
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip
                          icon={<Group />}
                          label={`${community.member_count} members`}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          By {community.admin?.username}
                        </Typography>
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
                      <Button
                        size="small"
                        color={community.is_member ? "secondary" : "primary"}
                        onClick={() => handleJoinCommunity(community.public_id)}
                        sx={{ ml: 'auto' }}
                      >
                        {community.is_member ? 'Leave' : 'Join'}
                      </Button>
                    </CardActions>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}