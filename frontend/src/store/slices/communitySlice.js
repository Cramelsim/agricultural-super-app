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