import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Share, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const PostDetailPage = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  
  const post = {
    id: id,
    title: 'Best Practices for Organic Tomato Farming',
    content: `Organic tomato farming requires careful attention to soil health, pest management, and irrigation. Here are some key practices:

1. Soil Preparation: Use compost and organic matter to enrich the soil
2. Pest Control: Introduce beneficial insects and use neem oil sprays
3. Watering: Drip irrigation is most efficient for tomatoes
4. Harvesting: Pick tomatoes when they are fully colored but still firm

Remember, healthy soil means healthy plants!`,
    author: {
      name: 'Dr. Jane Farmer',
      role: 'Organic Farming Expert',
      avatar: '',
    },
    createdAt: new Date('2024-01-10'),
    tags: ['organic', 'tomatoes', 'farming', 'agriculture'],
    comments: [
      { id: 1, user: 'John Doe', text: 'Great advice! When is the best time to plant?', time: '2 hours ago' },
      { id: 2, user: 'Maria Green', text: 'Have you tried companion planting with basil?', time: '1 day ago' },
    ],
  };
    const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

    const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      console.log('New comment:', comment);
      setComment('');
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        component={Link}
        to="/feed"
        sx={{ mb: 3 }}
      >
        Back to Feed
      </Button>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Author Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
            {post.author.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{post.author.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {post.author.role}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
        {/* Post Content */}
        <Typography variant="h4" gutterBottom>
          {post.title}
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line', mb: 3 }}>
          {post.content}
        </Typography>
        {/* Tags */}
        <Box sx={{ mb: 3 }}>
          {post.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <IconButton onClick={handleLike}>
            {liked ? <Favorite color="error" /> : <FavoriteBorder />}
            <Typography sx={{ ml: 1 }}>{likeCount}</Typography>
          </IconButton>
          
          <IconButton>
            <Comment />
            <Typography sx={{ ml: 1 }}>{post.comments.length}</Typography>
          </IconButton>
          
          <IconButton>
            <Share />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        {/* Comments */}
        <Typography variant="h6" gutterBottom>
          Comments ({post.comments.length})
        </Typography>
           {/* Comment Form */}
        <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Post Comment
          </Button>
        </Box>