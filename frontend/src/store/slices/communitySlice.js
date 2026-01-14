import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getCommunities = createAsyncThunk(
  'communities/getCommunities',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/communities', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCommunity = createAsyncThunk(
  'communities/getCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/${communityId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCommunity = createAsyncThunk(
  'communities/createCommunity',
  async (communityData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(communityData).forEach(key => {
        if (key === 'image' && communityData[key]) {
          formData.append('image', communityData[key]);
        } else {
          formData.append(key, communityData[key]);
        }
      });
      
      const response = await api.post('/communities', formData, {
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

export const joinCommunity = createAsyncThunk(
  'communities/joinCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/communities/${communityId}/join`);
      return { communityId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserCommunities = createAsyncThunk(
  'communities/getUserCommunities',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/communities/user/joined', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getCommunityMembers = createAsyncThunk(
  'communities/getCommunityMembers',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/${communityId}/members`);
      return { communityId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  communities: [],
  currentCommunity: null,
  userCommunities: [],
  communityMembers: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
};
const communitySlice = createSlice({
  name: 'communities',
  initialState,
  reducers: {
    clearCommunities: (state) => {
      state.communities = [];
      state.total = 0;
    },
    clearCurrentCommunity: (state) => {
      state.currentCommunity = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
   extraReducers: (builder) => {
    builder
      .addCase(getCommunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })