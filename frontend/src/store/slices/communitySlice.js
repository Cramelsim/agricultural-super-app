// src/store/slices/communitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const getCommunities = createAsyncThunk(
  'communities/getCommunities',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Add trailing slash
      const response = await api.get('/communities/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch communities');
    }
  }
);

export const getUserCommunities = createAsyncThunk(
  'communities/getUserCommunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/communities/user/joined');
      return response.data.communities || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user communities');
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'communities/joinCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/communities/${communityId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to join community');
    }
  }
);

export const createCommunity = createAsyncThunk(
  'communities/createCommunity',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/communities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create community');
    }
  }
);

const communitySlice = createSlice({
  name: 'communities',
  initialState: {
    communities: [],
    userCommunities: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCommunities: (state) => {
      state.communities = [];
      state.userCommunities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Communities
      .addCase(getCommunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities = action.payload.communities || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.per_page = action.payload.per_page || 20;
        state.pages = action.payload.pages || 1;
      })
      .addCase(getCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get User Communities
      .addCase(getUserCommunities.fulfilled, (state, action) => {
        state.userCommunities = action.payload;
      })
      
      // Join Community
      .addCase(joinCommunity.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Create Community
      .addCase(createCommunity.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCommunities } = communitySlice.actions;
export default communitySlice.reducer;