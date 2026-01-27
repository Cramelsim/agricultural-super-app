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

export const fetchCommunities = createAsyncThunk(
  'explore/fetchCommunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/communities');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch communities');
    }
  }
);

const exploreSlice = createSlice({
  name: 'explore',
  initialState: {
    experts: [],
    communities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder