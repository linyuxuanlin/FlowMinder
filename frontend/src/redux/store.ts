import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import flowReducer from './slices/flowSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    flow: flowReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 