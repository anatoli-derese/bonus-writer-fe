import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  jobId: null,
  progress: null,
  isTracking: false,
  error: null,
  bookTitle: null, // Store book title for download
};

// Generation progress slice
const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    setJobId: (state, action) => {
      state.jobId = action.payload.jobId;
      state.bookTitle = action.payload.bookTitle;
      state.isTracking = true;
      state.error = null;
      state.progress = null;
    },
    updateProgress: (state, action) => {
      state.progress = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isTracking = false;
    },
    resetGeneration: (state) => {
      state.jobId = null;
      state.progress = null;
      state.isTracking = false;
      state.error = null;
      state.bookTitle = null;
    },
  },
});

export const { setJobId, updateProgress, setError, resetGeneration } = generationSlice.actions;
export default generationSlice.reducer;

