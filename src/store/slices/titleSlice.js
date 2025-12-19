import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { titleService } from '../../api/titleService';
import { bookService } from '../../api/bookService';
import { translateService } from '../../api/translateService';

// Initial state
const initialState = {
  titlesByLanguage: {}, // { [lang]: string[] } - titles grouped by language
  selectedIndices: [], // Track selected title indices (same across all languages)
  languages: [], // Languages used for title generation
  isLoading: false,
  isGenerating: false, // Track book generation status
  jobId: null, // Store job_id from start-generate response
  generationError: null,
  error: null,
};

// Generate titles async thunk
export const generateTitles = createAsyncThunk(
  'title/generateTitles',
  async ({ title, tableOfContents, languages }, { rejectWithValue }) => {
    try {
      const response = await titleService.generateTitles(
        title,
        tableOfContents,
        languages
      );
      return { ...response, languages }; // Include languages in response
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to generate titles. Please try again.'
      );
    }
  }
);

// Add custom title with translation async thunk
export const addCustomTitleWithTranslation = createAsyncThunk(
  'title/addCustomTitleWithTranslation',
  async ({ title, fromLanguage, languages }, { rejectWithValue }) => {
    try {
      // Get languages to translate to (all except the source language)
      const toLanguages = languages.filter(lang => lang !== fromLanguage);
      
      let translations = {};
      
      // If there are languages to translate to, call the translate API
      if (toLanguages.length > 0) {
        const translateResponse = await translateService.translateText(
          title,
          fromLanguage,
          toLanguages
        );
        translations = translateResponse.translations || {};
      }
      
      // Build the complete translations object
      const allTranslations = {
        [fromLanguage]: title, // Original title
        ...translations, // Translated titles
      };
      
      return { translations: allTranslations, languages };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to translate and add custom title. Please try again.'
      );
    }
  }
);

// Start book generation async thunk
export const startBookGeneration = createAsyncThunk(
  'title/startBookGeneration',
  async ({ titlesByLanguage, bookTitle, tableOfContents, languages }, { rejectWithValue }) => {
    try {
      const response = await bookService.startGeneration(
        titlesByLanguage,
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
      state.titlesByLanguage = {};
      state.selectedIndices = [];
      state.languages = [];
      state.error = null;
      state.jobId = null;
      state.generationError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleTitleSelection: (state, action) => {
      const index = action.payload; // Index of the title
      const indexPosition = state.selectedIndices.indexOf(index);
      if (indexPosition > -1) {
        state.selectedIndices.splice(indexPosition, 1);
      } else {
        state.selectedIndices.push(index);
      }
      // Sort to keep indices in order
      state.selectedIndices.sort((a, b) => a - b);
    },
    addCustomTitle: (state, action) => {
      // This is now handled by the async thunk, but keeping for backward compatibility
      const { translations, languages } = action.payload;
      if (translations && languages) {
        // Add translated titles to all languages
        languages.forEach((lang) => {
          if (state.titlesByLanguage[lang] && translations[lang]) {
            state.titlesByLanguage[lang].push(translations[lang]);
          }
        });
        
        // Get the max length to determine the new index
        const maxLength = Math.max(...Object.values(state.titlesByLanguage).map(arr => arr.length), 0);
        const newIndex = maxLength - 1;
        
        // Add to selected indices
        if (newIndex >= 0 && !state.selectedIndices.includes(newIndex)) {
          state.selectedIndices.push(newIndex);
          state.selectedIndices.sort((a, b) => a - b);
        }
      }
    },
    setAllTitlesSelected: (state) => {
      // Select all titles (get max length from any language)
      const maxLength = Math.max(...Object.values(state.titlesByLanguage).map(arr => arr.length), 0);
      state.selectedIndices = Array.from({ length: maxLength }, (_, i) => i);
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
        state.titlesByLanguage = action.payload.titles_by_language || {};
        state.languages = action.payload.languages || [];
        state.selectedIndices = []; // Titles are unchecked by default
        state.error = null;
      })
      .addCase(generateTitles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.titlesByLanguage = {};
        state.selectedIndices = [];
        state.languages = [];
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

    // Add custom title with translation
    builder
      .addCase(addCustomTitleWithTranslation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCustomTitleWithTranslation.fulfilled, (state, action) => {
        state.isLoading = false;
        const { translations, languages } = action.payload;
        
        // Get the current max length across all languages
        const currentMaxLength = Math.max(...Object.values(state.titlesByLanguage).map(arr => arr.length), 0);
        
        // Add translated titles to all languages at the same index
        languages.forEach((lang) => {
          if (!state.titlesByLanguage[lang]) {
            state.titlesByLanguage[lang] = [];
          }
          
          // Pad with empty strings if needed to reach the same length as other languages
          while (state.titlesByLanguage[lang].length < currentMaxLength) {
            state.titlesByLanguage[lang].push('');
          }
          
          // Add the translated title (use original if translation not available for this language)
          const translatedTitle = translations[lang] || translations[languages[0]] || '';
          state.titlesByLanguage[lang].push(translatedTitle);
        });
        
        // The new index is the current max length (since we added one more)
        const newIndex = currentMaxLength;
        
        // Add to selected indices
        if (!state.selectedIndices.includes(newIndex)) {
          state.selectedIndices.push(newIndex);
          state.selectedIndices.sort((a, b) => a - b);
        }
        
        state.error = null;
      })
      .addCase(addCustomTitleWithTranslation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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

