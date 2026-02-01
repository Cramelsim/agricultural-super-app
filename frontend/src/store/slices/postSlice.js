import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks (add comment thunks)
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, commentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comments/`, commentData);
      return { postId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add comment');
    }
  }
);

export const getComments = createAsyncThunk(
  'posts/getComments',
  async ({ postId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}/comments/`, { params });
      return { postId, comments: response.data.comments };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch comments');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete comment');
    }
  }
);

// ... keep your existing thunks (getPosts, getPost, createPost, etc.)

const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  perPage: 20,
  // Add comments-related state
  commentsLoading: false,
  commentsError: null,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.commentsError = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    // Add a reducer to manually add comment to state for immediate feedback
    addCommentToState: (state, action) => {
      const { postId, comment } = action.payload;
      
      // Update posts array
      const postIndex = state.posts.findIndex(p => p.public_id === postId);
      if (postIndex !== -1) {
        if (!state.posts[postIndex].comments) {
          state.posts[postIndex].comments = [];
        }
        state.posts[postIndex].comments.unshift(comment);
        state.posts[postIndex].comment_count = (state.posts[postIndex].comment_count || 0) + 1;
      }
      
      // Update currentPost
      if (state.currentPost && state.currentPost.public_id === postId) {
        if (!state.currentPost.comments) {
          state.currentPost.comments = [];
        }
        state.currentPost.comments.unshift(comment);
        state.currentPost.comment_count = (state.currentPost.comment_count || 0) + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ... keep your existing reducers
      
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        const { postId, comment } = action.payload;
        
        // Update posts array
        const postIndex = state.posts.findIndex(p => p.public_id === postId);
        if (postIndex !== -1) {
          if (!state.posts[postIndex].comments) {
            state.posts[postIndex].comments = [];
          }
          // Check if comment already exists to avoid duplicates
          const exists = state.posts[postIndex].comments.some(c => c.id === comment.id);
          if (!exists) {
            state.posts[postIndex].comments.unshift(comment);
            state.posts[postIndex].comment_count = (state.posts[postIndex].comment_count || 0) + 1;
          }
        }
        
        // Update currentPost
        if (state.currentPost && state.currentPost.public_id === postId) {
          if (!state.currentPost.comments) {
            state.currentPost.comments = [];
          }
          const exists = state.currentPost.comments.some(c => c.id === comment.id);
          if (!exists) {
            state.currentPost.comments.unshift(comment);
            state.currentPost.comment_count = (state.currentPost.comment_count || 0) + 1;
          }
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload?.error || 'Failed to add comment';
      })
      
      // Get Comments
      .addCase(getComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        const { postId, comments } = action.payload;
        
        // Update posts array
        const postIndex = state.posts.findIndex(p => p.public_id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].comments = comments;
        }
        
        // Update currentPost
        if (state.currentPost && state.currentPost.public_id === postId) {
          state.currentPost.comments = comments;
        }
      })
      .addCase(getComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload?.error || 'Failed to load comments';
      })
      
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        
        // Update posts array
        const postIndex = state.posts.findIndex(p => p.public_id === postId);
        if (postIndex !== -1 && state.posts[postIndex].comments) {
          state.posts[postIndex].comments = state.posts[postIndex].comments.filter(
            c => c.id !== commentId
          );
          state.posts[postIndex].comment_count = Math.max(
            (state.posts[postIndex].comment_count || 0) - 1,
            0
          );
        }
        
        // Update currentPost
        if (state.currentPost && state.currentPost.public_id === postId && state.currentPost.comments) {
          state.currentPost.comments = state.currentPost.comments.filter(
            c => c.id !== commentId
          );
          state.currentPost.comment_count = Math.max(
            (state.currentPost.comment_count || 0) - 1,
            0
          );
        }
      });
  },
});

export const { clearError, clearCurrentPost, addCommentToState } = postSlice.actions;
export default postSlice.reducer;