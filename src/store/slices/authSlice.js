import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../api/authService';

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  changePasswordLoading: false,
  changePasswordError: null,
  changePasswordSuccess: false,
};

// Check authentication status on app load
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    return authService.isAuthenticated();
  }
);

// Login async thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

// Logout action (synchronous)
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    authService.logout();
  }
);

// Change password async thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(oldPassword, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to change password. Please try again.'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearChangePasswordError: (state) => {
      state.changePasswordError = null;
    },
    clearChangePasswordSuccess: (state) => {
      state.changePasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Check auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.error = null;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordError = null;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload;
        state.changePasswordSuccess = false;
      });
  },
});

export const { clearError, clearChangePasswordError, clearChangePasswordSuccess } = authSlice.actions;
export default authSlice.reducer;

