import { createSlice } from '@reduxjs/toolkit';
import { api } from '../api';
import { apiThunk } from './apiThunk';

export const fetchAssets = apiThunk('catalog/fetchAssets', api.assets);
export const fetchLogos = apiThunk('catalog/fetchLogos', api.logos);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: { assets: [], logos: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.assets = action.payload;
      })
      .addCase(fetchLogos.fulfilled, (state, action) => {
        state.logos = action.payload;
      });
  },
});

export default catalogSlice.reducer;
