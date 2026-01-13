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