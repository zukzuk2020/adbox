import { configureStore } from '@reduxjs/toolkit';
import catalog from './catalogSlice';
import locations from './locationsSlice';
import review from './reviewSlice';

export const store = configureStore({ reducer: { catalog, locations, review } });
