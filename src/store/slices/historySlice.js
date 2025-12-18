import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { historyService } from '../../api/historyService';

// Initial state
const initialState = {
  generations: [],
  isLoading: false,
  error: null,
};

// Get history async thunk
export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await historyService.getHistory(limit);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch history. Please try again.'
      );
    }
  }
);

// History slice
const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.generations = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.generations = action.payload.generations || [];
        state.error = null;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.generations = [];
      });
  },
});

export const { clearHistory, clearError } = historySlice.actions;
export default historySlice.reducer;

