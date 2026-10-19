import { createAsyncThunk } from '@reduxjs/toolkit';

/** createAsyncThunk that keeps the server's per-field errors on rejection. */
export const apiThunk = (type, run) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await run(arg);
    } catch (error) {
      return rejectWithValue({ message: error.message, errors: error.errors ?? [] });
    }
  });
