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