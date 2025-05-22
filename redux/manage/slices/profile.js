import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  profile: null,  
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//PROFILE
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try { 
      const response = await axios.get('/api/manage/profile');
      console.log(123,response.data);
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profile, { rejectWithValue }) => {
      try {       
        const response = await axios.put('/api/manage/profile', profile);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile.');
      }
    }
);

export const verifyProfile = createAsyncThunk(
  'profile/verifyProfile',
  async (request, { rejectWithValue }) => {
    try {       
      const response = await axios.put('/api/manage/verify', request);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send verification request.');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
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
  },
  extraReducers: (builder) => {
    builder
       //FETCH PROFILE
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;        
        if(action.payload.message) state.info = action.payload.message;   
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.profile = action.payload.profile; 
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) 
      //RESEND VERIFY LINK ON PROFILE
      .addCase(verifyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;         
      })
      .addCase(verifyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })      
  },
});

export const { clearError, clearSuccess, clearInfo } = profileSlice.actions;

export default profileSlice.reducer;