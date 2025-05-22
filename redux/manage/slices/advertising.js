import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// INITIAL STATE
const initialState = {
  advertising: [],
  item: null, 
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    paused: 0
  },
  // UI
  loading: false,
  error: null,
  success: null,
  info: null
};

// FETCH ADVERTISING
export const fetchAdvertising = createAsyncThunk(
  'advertising/fetchAdvertising',
  async ({ page = 1, searchTerm = '', status = '' }, { rejectWithValue }) => {
    try {
      let url = `/api/manage/advertising?page=${page}&limit=10&sort=-updatedAt`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (status) url += `&status=${status}`;     
      const response = await axios.get(url);
      return response.data;   
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch advertising.');
    }
  }
);

// FETCH SINGLE ADVERTISING ITEM
export const fetchAdvertisingItem = createAsyncThunk(
  'advertising/fetchAdvertisingItem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/manage/advertising/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch advertising feed.');
    }
  }
);

// CREATE ADVERTISING
export const createAdvertising = createAsyncThunk(
  'advertising/createAdvertising',
  async (advertisingData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/manage/advertising', advertisingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create advertising.');
    }
  }
);

// UPDATE ADVERTISING
export const updateAdvertising = createAsyncThunk(
  'advertising/updateAdvertising',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/manage/advertising/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update advertising feed.');
    }
  }
);

// DELETE ADVERTISING
export const deleteAdvertising = createAsyncThunk(
  'advertising/deleteAdvertising',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/advertising/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete advertising feed.');
    }
  }
);

// SLICE
const advertisingSlice = createSlice({
  name: 'advertising',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearInfo: (state) => {
      state.info = null;
    },
    clearItem: (state) => {
      state.item = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchAdvertising.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertising.fulfilled, (state, action) => {
        state.loading = false;
        state.advertising = action.payload.advertising;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        if (action.payload.message) state.info = action.payload.message;
      })
      .addCase(fetchAdvertising.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH ITEM
      .addCase(fetchAdvertisingItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingItem.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload.item;
      })
      .addCase(fetchAdvertisingItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createAdvertising.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdvertising.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload.item;
        state.success = action.payload.message || 'Feed created successfully.';
      })
      .addCase(createAdvertising.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // UPDATE
      .addCase(updateAdvertising.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvertising.fulfilled, (state, action) => { 
        state.loading = false;
        state.item = action.payload.item;
        state.success = action.payload.message || 'Feed updated successfully.';
      })
      .addCase(updateAdvertising.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // DELETE
      .addCase(deleteAdvertising.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvertising.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Feed deleted successfully.';
        state.item = null;
        // Remove the deleted item from the list if it exists
        if (state.advertising.length > 0) {
          state.advertising = state.advertising.filter(item => item._id !== action.meta.arg);
        }
      })
      .addCase(deleteAdvertising.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearInfo, clearItem } = advertisingSlice.actions;

export default advertisingSlice.reducer;