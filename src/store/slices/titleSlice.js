import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { titleService } from '../../api/titleService';
import { bookService } from '../../api/bookService';

// Initial state
const initialState = {
  titles: [],
  selectedTitles: [], // Track selected titles as array
  isLoading: false,
  isGenerating: false, // Track book generation status
  jobId: null, // Store job_id from start-generate response
  generationError: null,
  error: null,
};

// Generate titles async thunk
export const generateTitles = createAsyncThunk(
  'title/generateTitles',
  async ({ title, tableOfContents, language }, { rejectWithValue }) => {
    try {
      const response = await titleService.generateTitles(
        title,
        tableOfContents,
        language
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to generate titles. Please try again.'
      );
    }
  }
);

// Start book generation async thunk
export const startBookGeneration = createAsyncThunk(
  'title/startBookGeneration',
  async ({ titles, bookTitle, tableOfContents, languages }, { rejectWithValue }) => {
    try {
      const response = await bookService.startGeneration(
        titles,
        bookTitle,
        tableOfContents,
        languages
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to start book generation. Please try again.'
      );
    }
  }
);

// Title slice
const titleSlice = createSlice({
  name: 'title',
  initialState,
  reducers: {
    clearTitles: (state) => {
      state.titles = [];
      state.selectedTitles = [];
      state.error = null;
      state.jobId = null;
      state.generationError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleTitleSelection: (state, action) => {
      const title = action.payload;
      const index = state.selectedTitles.indexOf(title);
      if (index > -1) {
        state.selectedTitles.splice(index, 1);
      } else {
        state.selectedTitles.push(title);
      }
    },
    addCustomTitle: (state, action) => {
      const newTitle = action.payload;
      if (newTitle && !state.titles.includes(newTitle)) {
        state.titles.push(newTitle);
        // Add custom title as selected by default
        if (!state.selectedTitles.includes(newTitle)) {
          state.selectedTitles.push(newTitle);
        }
      }
    },
    setAllTitlesSelected: (state) => {
      // Select all titles
      state.selectedTitles = [...state.titles];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateTitles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateTitles.fulfilled, (state, action) => {
        state.isLoading = false;
        const newTitles = action.payload.titles || [];
        state.titles = newTitles;
        state.selectedTitles = [];
        state.error = null;
      })
      .addCase(generateTitles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.titles = [];
        state.selectedTitles = [];
      });

    // Start book generation
    builder
      .addCase(startBookGeneration.pending, (state) => {
        state.isGenerating = true;
        state.generationError = null;
      })
      .addCase(startBookGeneration.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.jobId = action.payload.job_id;
        state.generationError = null;
      })
      .addCase(startBookGeneration.rejected, (state, action) => {
        state.isGenerating = false;
        state.generationError = action.payload;
        state.jobId = null;
      });
  },
});

export const { 
  clearTitles, 
  clearError, 
  toggleTitleSelection, 
  addCustomTitle,
  setAllTitlesSelected 
} = titleSlice.actions;
export default titleSlice.reducer;

