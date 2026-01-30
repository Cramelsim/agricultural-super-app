// src/pages/CreatePostPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add, Close, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../store/slices/postSlice';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.posts);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState([]);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setFormError('Maximum 5 images allowed');
      return;
    }
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setFormError('Please login to create a post');
      navigate('/login');
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setFormError('Title, content, and category are required');
      return;
    }

    // Prepare form data
    const postFormData = new FormData();
    postFormData.append('title', formData.title);
    postFormData.append('content', formData.content);
    postFormData.append('category', formData.category);
    
    if (formData.tags.length > 0) {
      postFormData.append('tags', formData.tags.join(','));
    }
    
    // Add images
    images.forEach((image, index) => {
      postFormData.append(`images`, image);
    });

    // Dispatch create post action
    const result = await dispatch(createPost(postFormData));
    
    if (result.meta.requestStatus === 'fulfilled') {
      // Success - navigate to feed or the new post
      navigate('/feed');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" paragraph>
            You need to be logged in to create a post.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/register')}
          >
            Sign Up
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
        </Typography>
        
        {(error || formError) && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
            {error || formError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="">Select a category</MenuItem>
                  <MenuItem value="crop-advice">Crop Advice</MenuItem>
                  <MenuItem value="market-prices">Market Prices</MenuItem>
                  <MenuItem value="pest-control">Pest Control</MenuItem>
                  <MenuItem value="irrigation">Irrigation</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                  <MenuItem value="weather">Weather</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="livestock">Livestock</MenuItem>
                  <MenuItem value="general">General Discussion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                multiline
                rows={8}
                variant="outlined"
                placeholder="Share your agricultural knowledge, ask questions, or discuss farming topics..."
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags (Optional)
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Add relevant tags to help others find your post
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleAddTag} 
                    startIcon={<Add />}
                    disabled={loading}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                      disabled={loading}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Images (Optional)
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Upload up to 5 images. Supported formats: JPG, PNG, GIF
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="post-images-upload"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <label htmlFor="post-images-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={loading}
                  >
                    Choose Images
                  </Button>
                </label>
                {images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Selected {images.length} image(s):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {images.map((image, index) => (
                        <Chip
                          key={index}
                          label={image.name}
                          onDelete={() => {
                            setImages(prev => prev.filter((_, i) => i !== index));
                          }}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ flexGrow: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Publish Post'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/feed')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Tips for a great post:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Be clear and specific in your title</li>
                    <li>Include relevant details about your farming situation</li>
                    <li>Use proper formatting for readability</li>
                    <li>Add relevant tags to help others find your post</li>
                  </ul>
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePostPage;