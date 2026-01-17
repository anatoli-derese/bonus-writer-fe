import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiKeyService } from '../../api/apiKeyService';
import { userService } from '../../api/userService';

// Initial state
const initialState = {
  apiKeys: [],
  users: [],
  isLoading: false,
  error: null,
};

// Fetch all API keys
export const fetchAPIKeys = createAsyncThunk(
  'admin/fetchAPIKeys',
  async (_, { rejectWithValue }) => {
    try {
      const apiKeys = await apiKeyService.getAllAPIKeys();
      return apiKeys;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch API keys.'
      );
    }
  }
);

// Create API key
export const createAPIKey = createAsyncThunk(
  'admin/createAPIKey',
  async (data, { rejectWithValue }) => {
    try {
      const apiKey = await apiKeyService.createAPIKey(data);
      return apiKey;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to create API key.'
      );
    }
  }
);

// Update API key
export const updateAPIKey = createAsyncThunk(
  'admin/updateAPIKey',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const apiKey = await apiKeyService.updateAPIKey(id, data);
      return apiKey;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to update API key.'
      );
    }
  }
);

// Delete API key
export const deleteAPIKey = createAsyncThunk(
  'admin/deleteAPIKey',
  async (id, { rejectWithValue }) => {
    try {
      await apiKeyService.deleteAPIKey(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to delete API key.'
      );
    }
  }
);

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.getAllUsers();
      return users;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch users.'
      );
    }
  }
);

// Assign API key to user
export const assignAPIKey = createAsyncThunk(
  'admin/assignAPIKey',
  async ({ userId, apiId }, { rejectWithValue }) => {
    try {
      await userService.assignAPIKeyToUser(userId, apiId);
      return { userId, apiId };
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to assign API key to user.'
      );
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch API keys
    builder
      .addCase(fetchAPIKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAPIKeys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apiKeys = action.payload;
        state.error = null;
      })
      .addCase(fetchAPIKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create API key
    builder
      .addCase(createAPIKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAPIKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apiKeys.push(action.payload);
        state.error = null;
      })
      .addCase(createAPIKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update API key
    builder
      .addCase(updateAPIKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAPIKey.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.apiKeys.findIndex(key => key.id === action.payload.id);
        if (index !== -1) {
          state.apiKeys[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAPIKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete API key
    builder
      .addCase(deleteAPIKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAPIKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apiKeys = state.apiKeys.filter(key => key.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAPIKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Assign API key
    builder
      .addCase(assignAPIKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignAPIKey.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update user's API key in the users list
        const user = state.users.find(u => u.id === action.payload.userId);
        if (user) {
          const apiKey = state.apiKeys.find(k => k.id === action.payload.apiId);
          user.api_key = apiKey || null;
        }
        state.error = null;
      })
      .addCase(assignAPIKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
