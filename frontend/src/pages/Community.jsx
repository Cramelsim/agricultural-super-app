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
  }, [