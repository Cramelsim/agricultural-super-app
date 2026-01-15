import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/user/${userId}`);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ receiverId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages/send', { receiver_id: receiverId, content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'messages/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/unread/count');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearConversations: (state) => {
      state.conversations = [];
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.conversations;
      })
       .addCase(getMessages.fulfilled, (state, action) => {
        state.currentConversation = action.payload.userId;
        state.messages = action.payload.messages;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message_data);
      })

      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unread_count;
      })

      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m.public_id !== action.payload);
      });
  },
});

export const { clearConversations, clearCurrentConversation, addMessage, clearError } = messageSlice.actions;
export default messageSlice.reducer;