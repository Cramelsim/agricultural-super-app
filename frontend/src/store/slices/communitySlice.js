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
      addCase(getCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities = action.payload.communities;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(getCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load communities';
      })
      
      .addCase(getCommunity.fulfilled, (state, action) => {
        state.currentCommunity = action.payload.community;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.communities.unshift(action.payload.community);
      })
       .addCase(joinCommunity.fulfilled, (state, action) => {
        const { communityId, is_member } = action.payload;
        const index = state.communities.findIndex(c => c.public_id === communityId);
        
        if (index !== -1) {
          state.communities[index].is_member = is_member;
          state.communities[index].member_count += is_member ? 1 : -1;
        }
        
        if (state.currentCommunity && state.currentCommunity.public_id === communityId) {
          state.currentCommunity.is_member = is_member;
          state.currentCommunity.member_count += is_member ? 1 : -1;
        }
      })
      .addCase(getUserCommunities.fulfilled, (state, action) => {
        state.userCommunities = action.payload.communities;
      })

      .addCase(getCommunityMembers.fulfilled, (state, action) => {
        // Store members for current community
      });
  },
});