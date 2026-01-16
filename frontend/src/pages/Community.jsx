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