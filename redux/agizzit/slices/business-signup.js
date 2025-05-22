import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {  
  organization: null,
  showModal: false,
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//BUSINESS SIGNUP
export const fetchBusinessSignUp = createAsyncThunk(
  'business-signup/fetchBusinessSignUp',
  async (_, { rejectWithValue }) => {
    try { 
      const response = await axios.get('/api/business-signup');
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createBusinessSignUp = createAsyncThunk(
    'business-signup/createBusinessSignUp',
    async (companyInfo, { rejectWithValue }) => {
      try {    
        console.log('redux companyInfo',companyInfo);
        const response = await axios.post('/api/business-signup', companyInfo);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to signup business.');
      }
    }
);

export const updateBusinessSignUp = createAsyncThunk(
    'business-signup/updateBusinessSignUp',
    async ({ category, verification, _id }, { rejectWithValue }) => {
      try {    
        const response = await axios.put('/api/business-signup', { category, verification, _id });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to signup business.');
      }
    }
);

const businessSignUpSlice = createSlice({
  name: 'businessSignUp',
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
    showVerification: (state) => {
      state.showModal = true;    
    },
    hideVerification: (state) => {
      state.showModal = false;
    }
  },
  extraReducers: (builder) => {
    builder
       //FETCH BUSINESS SIGNUP
      .addCase(fetchBusinessSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessSignUp.fulfilled, (state, action) => {
        state.loading = false;
        state.organization = action.payload;   
      })
      .addCase(fetchBusinessSignUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //CREATE BUSINESS SIGNUP
      .addCase(createBusinessSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusinessSignUp.fulfilled, (state, action) => {
        state.loading = false;    
        state.organization = action.payload
      })
      .addCase(createBusinessSignUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //UPDATE BUSINESS SIGNUP
      .addCase(updateBusinessSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBusinessSignUp.fulfilled, (state, action) => { 
        state.loading = false;
        state.organization = action.payload; 
        state.showVerification = false
      })
      .addCase(updateBusinessSignUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })    
  },
});

export const { clearError, clearSuccess, clearInfo, showVerification, hideVerification } = businessSignUpSlice.actions;

export default businessSignUpSlice.reducer;