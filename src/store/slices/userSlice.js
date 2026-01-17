import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../api/userService';
import { decodeJWT } from '../../utils/jwtDecoder';
import { tokenStorage } from '../../utils/tokenStorage';

// Initial state
const initialState = {
  currentUser: null,
  hasAPIKey: undefined, // undefined = unknown, false = no key, true = has key
  apiKey: null,
  isLoading: false,
  error: null,
};

// Fetch current user info with API key status
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Get username from JWT token
      const token = tokenStorage.get();
      if (!token) {
        return {
          currentUser: null,
          hasAPIKey: false,
          apiKey: null,
        };
      }

      const payload = decodeJWT(token);
      const username = payload?.sub;
      const isAdmin = payload?.is_admin === true;

      if (!username) {
        return {
          currentUser: null,
          hasAPIKey: false,
          apiKey: null,
        };
      }

      // Only admin users can call getAllUsers endpoint
      // For regular users, we can't determine API key status from this endpoint
      // They'll find out when they try to use generation features
      if (!isAdmin) {
        // For non-admin users, we can't check API key status via this endpoint
        // Return null/undefined to indicate we don't know (don't show warning)
        return {
          currentUser: null,
          hasAPIKey: undefined, // undefined means "unknown" - don't show warning
          apiKey: null,
        };
      }

      // Get all users and find current user by matching username (admin only)
      const users = await userService.getAllUsers();
      const currentUser = users.find(user => user.username === username) || null;
      
      return {
        currentUser,
        hasAPIKey: currentUser?.api_key !== null && currentUser?.api_key !== undefined,
        apiKey: currentUser?.api_key || null,
      };
    } catch (error) {
      // If error is 401/403 (not admin), don't assume no API key
      // Return undefined for hasAPIKey to indicate unknown status
      const status = error?.status || error?.response?.status;
      if (status === 401 || status === 403) {
        return {
          currentUser: null,
          hasAPIKey: undefined, // unknown - don't show warning
          apiKey: null,
        };
      }
      return rejectWithValue(
        error.message || 'Failed to fetch user information.'
      );
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserAPIKey: (state, action) => {
      state.hasAPIKey = action.payload !== null;
      state.apiKey = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.hasAPIKey = false;
      state.apiKey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.currentUser;
        state.hasAPIKey = action.payload.hasAPIKey;
        state.apiKey = action.payload.apiKey;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Don't set hasAPIKey to false on error - keep it as undefined to indicate unknown
        // This prevents showing false warnings
        state.apiKey = null;
      });
  },
});

export const { clearError, setUserAPIKey, clearUser } = userSlice.actions;
export default userSlice.reducer;
