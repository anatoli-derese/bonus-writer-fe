import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import titleReducer from './slices/titleSlice';
import generationReducer from './slices/generationSlice';
import historyReducer from './slices/historySlice';
import adminReducer from './slices/adminSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    title: titleReducer,
    generation: generationReducer,
    history: historyReducer,
    admin: adminReducer,
    user: userReducer,
  },
});

