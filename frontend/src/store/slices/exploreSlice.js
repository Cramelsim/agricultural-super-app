// src/store/slices/exploreSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunk for explore data
export const fetchExploreData = createAsyncThunk(
  'explore/fetchExploreData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/explore', { params });
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.error || 'Failed to fetch explore data');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch explore data');
    }
  }
);

export const fetchExploreExperts = createAsyncThunk(
  'explore/fetchExploreExperts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/explore/experts', { params });
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || 'Failed to fetch experts');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch experts');
    }
  }
);

export const fetchExploreCommunities = createAsyncThunk(
  'explore/fetchExploreCommunities',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/explore/communities', { params });
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || 'Failed to fetch communities');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch communities');
    }
  }
);


export const fetchExploreCategories = createAsyncThunk(
  'explore/fetchExploreCategories',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/explore/categories', { params });
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || 'Failed to fetch categories');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
    }
  }
);

const exploreSlice = createSlice({
  name: 'explore',
  initialState: {
    experts: [],
    communities: [],
    trendingPosts: [],
    categories: [],
    loading: false,
    error: null,
    pagination: {
      experts: {},
      communities: {},
      trendingPosts: {}
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExploreData: (state) => {
      state.experts = [];
      state.communities = [];
      state.trendingPosts = [];
      state.categories = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all explore data
      .addCase(fetchExploreData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExploreData.fulfilled, (state, action) => {
        state.loading = false;
        state.experts = action.payload.experts || [];
        state.communities = action.payload.communities || [];
        state.trendingPosts = action.payload.trending_posts || [];
        state.categories = action.payload.categories || [];
      })
      .addCase(fetchExploreData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch experts
      .addCase(fetchExploreExperts.fulfilled, (state, action) => {
        state.experts = action.payload.experts || [];
        state.pagination.experts = {
          total: action.payload.total,
          page: action.payload.page,
          per_page: action.payload.per_page,
          pages: action.payload.pages
        };
      })
      
      // Fetch communities
      .addCase(fetchExploreCommunities.fulfilled, (state, action) => {
        state.communities = action.payload.communities || [];
        state.pagination.communities = {
          total: action.payload.total,
          page: action.payload.page,
          per_page: action.payload.per_page,
          pages: action.payload.pages
        };
      })
      
      // Fetch trending posts
      .addCase(fetchExploreTrending.fulfilled, (state, action) => {
        state.trendingPosts = action.payload.posts || [];
        state.pagination.trendingPosts = {
          total: action.payload.total,
          page: action.payload.page,
          per_page: action.payload.per_page,
          pages: action.payload.pages
        };
      })
      
      // Fetch categories
      .addCase(fetchExploreCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories || [];
      });
  },
});

export const { clearError, clearExploreData } = exploreSlice.actions;
export default exploreSlice.reducer;