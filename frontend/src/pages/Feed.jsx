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
  const { posts: reduxPosts, isLoading, error } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // State to track which posts are liked by current user
  const [likedPosts, setLikedPosts] = useState({});
  // State to track optimistic like counts
  const [optimisticLikeCounts, setOptimisticLikeCounts] = useState({});
  
  // Initialize likedPosts from posts data
  useEffect(() => {
    if (reduxPosts.length > 0) {
      const likedMap = {};
      const likeCountMap = {};
      
      reduxPosts.forEach(post => {
        // Use post.liked if available from backend, otherwise default to false
        likedMap[post.public_id] = post.liked || false;
        likeCountMap[post.public_id] = post.like_count || 0;
      });
      
      setLikedPosts(likedMap);
      setOptimisticLikeCounts(likeCountMap);
    }
  }, [reduxPosts]);
  
  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);
  
  const handleLike = async (postId) => {
    try {
      // Get current liked state and like count
      const currentlyLiked = likedPosts[postId] || false;
      const currentLikeCount = optimisticLikeCounts[postId] || 0;
      
      // OPTIMISTIC UPDATE: Immediately update UI
      // 1. Toggle liked state
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !currentlyLiked
      }));
      
      // 2. Update like count optimistically
      setOptimisticLikeCounts(prev => ({
        ...prev,
        [postId]: currentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1
      }));
      
      // 3. Call the API
      const result = await dispatch(likePost(postId));
      
      // 4. If API fails, revert optimistic update
      if (result.meta.requestStatus === 'rejected') {
        // Revert liked state
        setLikedPosts(prev => ({
          ...prev,
          [postId]: currentlyLiked // Revert to original state
        }));
        
        // Revert like count
        setOptimisticLikeCounts(prev => ({
          ...prev,
          [postId]: currentLikeCount // Revert to original count
        }));
        
        console.error('Failed to like post:', result.payload);
        
        // Show error toast (you can add a toast notification here)
        // alert('Failed to like post. Please try again.');
      }
      
      // If API succeeds, the data is already updated via Redux
      // We'll refetch posts to ensure consistency
      if (result.meta.requestStatus === 'fulfilled') {
        // Optional: Refetch posts to sync with server
        // dispatch(getPosts());
      }
      
    } catch (error) {
      console.error('Error in handleLike:', error);
    }
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
  
  // Use posts from Redux, but override with optimistic updates
  const posts = reduxPosts.map(post => {
    const postId = post.public_id;
    return {
      ...post,
      // Use optimistic liked state if available, otherwise use post.liked
      liked: likedPosts[postId] !== undefined ? likedPosts[postId] : (post.liked || false),
      // Use optimistic like count if available, otherwise use post.like_count
      like_count: optimisticLikeCounts[postId] !== undefined 
        ? optimisticLikeCounts[postId] 
        : (post.like_count || 0)
    };
  });
  
  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'following' && user) {
      // Filter posts from followed users
      // This would require additional logic
      return true;
    }
    if (filter === 'category' && post.category) {
      return post.category === filter;
    }
    return true;
  });
  
  if (isLoading && posts.length === 0) {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Agricultural Feed
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/create-post"
        >
          Create Post
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Filter Chips */}
          <Box sx={{ mb: 3 }}>
            <Chip
              label="All Posts"
              color={filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilter('all')}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Following"
              color={filter === 'following' ? 'primary' : 'default'}
              onClick={() => setFilter('following')}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Crop Advice"
              color={filter === 'crop-advice' ? 'primary' : 'default'}
              onClick={() => setFilter('crop-advice')}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Market Prices"
              color={filter === 'market-prices' ? 'primary' : 'default'}
              onClick={() => setFilter('market-prices')}
            />
          </Box>
          
          {/* Posts */}
          {filteredPosts.length === 0 ? (
            <Alert severity="info">
              No posts found. Be the first to share agricultural knowledge!
            </Alert>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = post.liked;
              const likeCount = post.like_count;
              
              return (
                <StyledCard key={post.public_id}>
                  <CardHeader
                    avatar={
                      <Avatar
                        src={post.author?.profile_image}
                        alt={post.author?.username}
                        component={Link}
                        to={`/profile/${post.author?.public_id}`}
                      />
                    }
                    action={
                      <IconButton onClick={(e) => handleMenuOpen(e, post)}>
                        <MoreVert />
                      </IconButton>
                    }
                    title={
                      <Typography variant="subtitle1" component="div">
                        {post.author?.full_name || post.author?.username}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        {post.category && ` • ${post.category}`}
                      </Typography>
                    }
                  />
                  
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {post.content.length > 500
                        ? `${post.content.substring(0, 500)}...`
                        : post.content}
                    </Typography>
                    
                    {/* Images */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <Grid container spacing={1} sx={{ mt: 2 }}>
                        {post.image_urls.slice(0, 3).map((url, index) => (
                          <Grid item xs={4} key={index}>
                            <CardMedia
                              component="img"
                              height="140"
                              image={`http://localhost:5000${url}`}
                              alt={`Post image ${index + 1}`}
                              sx={{ borderRadius: 1 }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        {post.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <IconButton
                      aria-label="like"
                      onClick={() => handleLike(post.public_id)}
                      sx={{
                        '&:hover': {
                          color: isLiked ? 'error.main' : 'inherit'
                        }
                      }}
                    >
                      {isLiked ? (
                        <Favorite sx={{ color: 'error.main' }} />  // Red heart when liked
                      ) : (
                        <FavoriteBorder />
                      )}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          ml: 0.5,
                          color: isLiked ? 'error.main' : 'inherit'
                        }}
                      >
                        {likeCount}
                      </Typography>
                    </IconButton>
                    
                    <IconButton
                      aria-label="comment"
                      component={Link}
                      to={`/post/${post.public_id}`}
                    >
                      <Comment />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {post.comment_count || 0}
                      </Typography>
                    </IconButton>
                    
                    <IconButton 
                      aria-label="share"
                      onClick={() => handleMenuOpen(null, post)}
                    >
                      <Share />
                    </IconButton>
                    
                    <Button
                      size="small"
                      component={Link}
                      to={`/post/${post.public_id}`}
                      sx={{ ml: 'auto' }}
                    >
                      Read More
                    </Button>
                  </CardActions>
                </StyledCard>
              );
            })
          )}
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trending Topics
              </Typography>
              <Box>
                <Chip label="Organic Farming" sx={{ m: 0.5 }} />
                <Chip label="Irrigation" sx={{ m: 0.5 }} />
                <Chip label="Pest Control" sx={{ m: 0.5 }} />
                <Chip label="Market Prices" sx={{ m: 0.5 }} />
                <Chip label="Climate Smart" sx={{ m: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Experts
              </Typography>
              {/* Expert list would go here */}
              <Typography variant="body2" color="textSecondary">
                Follow agricultural experts to see their posts in your feed
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                component={Link}
                to="/explore"
              >
                Explore Experts
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Post Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShare}>Share</MenuItem>
        <MenuItem onClick={handleSave}>Save</MenuItem>
        {selectedPost?.author?.public_id === user?.public_id && (
          <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        )}
        {selectedPost?.author?.public_id === user?.public_id && (
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>Report</MenuItem>
      </Menu>
    </Container>
  );
};

export default FeedPage;