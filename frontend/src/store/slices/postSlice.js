import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ================== ASYNC THUNKS ==================

export const getPosts = createAsyncThunk(
  'posts/getPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch posts');
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
      return rejectWithValue(error.response?.data || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create post');
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
      return rejectWithValue(error.response?.data || 'Failed to update post');
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
      return rejectWithValue(error.response?.data || 'Failed to delete post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to like post');
    }
  }
);

// ================== SLICE ==================

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
      // ===== GET POSTS =====
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
        state.error = action.payload;
      })

      // ===== GET SINGLE POST =====
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
        state.error = action.payload;
      })

      // ===== CREATE POST =====
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
        state.error = action.payload;
      })

      // ===== LIKE POST =====
      .addCase(likePost.fulfilled, (state, action) => {
        const { liked, like_count } = action.payload;
        const postId = action.meta.arg;

        const post = state.posts.find(p => p.public_id === postId);
        if (post) {
          post.liked = liked;
          post.like_count = like_count;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ===== DELETE POST =====
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(
          p => p.public_id !== action.payload
        );
        if (
          state.currentPost &&
          state.currentPost.public_id === action.payload
        ) {
          state.currentPost = null;
        }
      });
  },
});

export const { clearError, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;
