import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getComments = createAsyncThunk(
  'comments/getComments',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/comments/post/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comments/post/${postId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);