import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getPost = createAsyncThunk(
  'posts/getPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(postData).forEach(key => {
        if (key === 'images') {
          // Handle multiple images
          postData.images.forEach((image, index) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, postData[key]);
        }
      });
      
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  perPage: 20,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Posts
      .addCase(getPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.perPage = action.payload.per_page;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load posts';
      })
      
      // Get Single Post
      .addCase(getPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(getPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load post';
      })
      
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to create post';
      })
      
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked, like_count } = action.payload;
        const postIndex = state.posts.findIndex(p => p.public_id === postId);
        
        if (postIndex !== -1) {
          state.posts[postIndex].liked = liked;
          state.posts[postIndex].like_count = like_count;
        }
        
        if (state.currentPost && state.currentPost.public_id === postId) {
          state.currentPost.liked = liked;
          state.currentPost.like_count = like_count;
        }
      })
      
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.public_id !== action.payload);
        if (state.currentPost && state.currentPost.public_id === action.payload) {
          state.currentPost = null;
        }
      });
  },
});

export const { clearError, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;