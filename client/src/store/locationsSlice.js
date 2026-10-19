import { createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import { apiThunk } from './apiThunk';

export const fetchCorporateLocations = apiThunk('locations/fetchCorporate', api.corporateLocations);
export const fetchLocalLocations = apiThunk('locations/fetchLocal', api.localLocations);

const locationsSlice = createSlice({
  name: 'locations',
  initialState: { corporate: [], local: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCorporateLocations.fulfilled, (state, action) => {
        state.corporate = action.payload;
      })
      .addCase(fetchLocalLocations.fulfilled, (state, action) => {
        state.local = action.payload;
      });
  },
});

export default locationsSlice.reducer;
