import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import titleReducer from './slices/titleSlice';
import generationReducer from './slices/generationSlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    title: titleReducer,
    generation: generationReducer,
    history: historyReducer,
  },
});

