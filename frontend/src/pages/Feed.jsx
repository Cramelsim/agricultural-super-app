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
  CardHeader,
  Typography,
  Button,
  IconButton,
  Box,
  TextField,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  Add,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getPosts, likePost } from '../store/slices/postSlice';
import { formatDistanceToNow } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const FeedPage = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, error } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

const handleLike = (postId) => {
    dispatch(likePost(postId));
  };
  
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };
const handleShare = async () => {
    if (navigator.share && selectedPost) {
      try {
        await navigator.share({
          title: selectedPost.title,
          text: selectedPost.content.substring(0, 100),
          url: `${window.location.origin}/post/${selectedPost.public_id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
    handleMenuClose();
  };
  
  const handleSave = () => {
    // Implement save functionality
    handleMenuClose();
  };