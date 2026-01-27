import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchExperts = createAsyncThunk(
  'explore/fetchExperts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/experts');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch experts');
    }
  }
);