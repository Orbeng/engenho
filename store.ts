// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import projectsSlice from './projectsSlice';
import clientsSlice from './clientsSlice';
import financesSlice from './financesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    clients: clientsSlice,
    finances: financesSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;