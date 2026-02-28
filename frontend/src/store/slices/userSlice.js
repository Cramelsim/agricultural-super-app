import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getUser = createAsyncThunk(
  'users/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(userData).forEach(key => {
        if (key === 'profile_image' && userData[key]) {
          formData.append('profile_image', userData[key]);
        } else if (userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      
      const response = await api.put('/users/profile', formData, {
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

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/search', { params: searchParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/follows/${userId}/follow`);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkFollow = createAsyncThunk(
  'users/checkFollow',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/follows/check/${userId}`);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getFollowing = createAsyncThunk(
  'users/getFollowing',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/follows/following', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getFollowers = createAsyncThunk(
  'users/getFollowers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/follows/followers', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  currentUser: null,
  searchResults: [],
  following: [],
  followers: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.currentUser = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to load user';
      })
      
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
      })
      
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload.users;
      })
      
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId, is_following } = action.payload;
        if (state.currentUser && state.currentUser.public_id === userId) {
          // Update follower count for current user
          state.currentUser.follower_count += is_following ? 1 : -1;
        }
      })
      
      .addCase(checkFollow.fulfilled, (state, action) => {
        // Store follow status for current user if needed
      })
      
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.following = action.payload.following;
      })
      
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.followers = action.payload.followers;
      });
  },
});

export const { clearUser, clearSearchResults, clearError } = userSlice.actions;
export default userSlice.reducer;