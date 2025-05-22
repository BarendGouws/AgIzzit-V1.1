import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  organization: null, 
  extras: [],
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//ORGANIZATION
export const fetchOrganization = createAsyncThunk(
  'organization/fetchOrganization',
  async (_, { rejectWithValue }) => {
    try { 
      const response = await axios.get('/api/manage/organization');    
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateOrganization = createAsyncThunk(
    'organization/updateOrganization',
    async (organization, { rejectWithValue }) => { console.log(123,organization)
      try {       
        const response = await axios.put('/api/manage/organization', organization);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update organization.');
      }
    }
);

export const verifyVatNr = createAsyncThunk(
  'organization/verifyVatNr',
  async ({vatNumber, accountantEmail, accountantName}, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/manage/organization/verify-vat', {
        vatNumber,
        accountantEmail,
        accountantName
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const uploadLogo = createAsyncThunk(
  'organization/uploadLogo',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        return rejectWithValue('Please upload an image file');
      }
 
      if (file.size > 5 * 1024 * 1024) {
        return rejectWithValue('File size should be less than 5MB');
      }
 
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await axios.post('/api/manage/organization/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const verifyBankDetails = createAsyncThunk(
  'organization/verifyBankDetails',
  async (newAccount, { rejectWithValue }) => { console.log('newAccount',newAccount)
    try {
      const response = await axios.post('/api/manage/verify-bank', newAccount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteBankAccount = createAsyncThunk(
  'organization/deleteBankAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/verify-bank`, {
        params: { accountId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting bank account');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'organization/updateLocation',
  async (location, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/manage/organization/locations', location);
      return response.data;     
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating location');
    }
  }
);

export const createLocation = createAsyncThunk(
  'organization/createLocation',
  async (location, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/manage/organization/locations', location);
      return response.data;     
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating location');
    }
  }
);

//SALE EXTRAS
export const createExtra = createAsyncThunk(
  'organization/createExtra',
  async (extraData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/manage/organization/extras', extraData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating extra');
    }
  }
);

export const updateExtra = createAsyncThunk(
  'organization/updateExtra',
  async (extraData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/manage/organization/extras/${extraData._id}`, extraData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating extra');
    }
  }
);

export const deleteExtra = createAsyncThunk(
  'organization/deleteExtra',
  async (extraId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/organization/extras/${extraId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting extra');
    }
  }
);

const organizationSlice = createSlice({
  name: 'organization',
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
       //FETCH ORGANIZATION
      .addCase(fetchOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organization = action.payload.organization;         
        state.extras = action.payload.extras;       
        if(action.payload.message) state.info = action.payload.message;   
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //UPDATE ORGANIZATION
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.organization = action.payload.organization; 
        state.extras = action.payload.extras;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })   
      //VERIFY VAT NR
      .addCase(verifyVatNr.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyVatNr.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.organization = action.payload.organization; 
      })
      .addCase(verifyVatNr.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })  
      //UPLOAD LOGO 
      .addCase(uploadLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Logo uploaded successfully';
        state.organization = action.payload.organization;
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //VERIFY BANKING DETAILS
      .addCase(verifyBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.organization = action.payload.organization; 
      })
      .addCase(verifyBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      }) 
      //DELETE BANK ACCOUNT
      .addCase(deleteBankAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.organization = action.payload.organization; 
      })
      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })   
      //UPDATE LOCATION
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.organization = action.payload.organization; 
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })
      //CREATE LOCATION
      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.organization = action.payload.organization; 
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })
      // CREATE EXTRA
      .addCase(createExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createExtra.fulfilled, (state, action) => {
        state.extras = [...state.extras, action.payload.extra];
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(createExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      // UPDATE EXTRA
      .addCase(updateExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateExtra.fulfilled, (state, action) => {
        state.extras = state.extras.map((extra) => extra._id === action.payload.extra._id ? action.payload.extra : extra);
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(updateExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
      // DELETE EXTRA
      .addCase(deleteExtra.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteExtra.fulfilled, (state, action) => {
        state.extras = state.extras.filter((extra) => extra._id !== action.payload.extraId);
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(deleteExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })
  },
});

export const { clearError, clearSuccess, clearInfo } = organizationSlice.actions;

export default organizationSlice.reducer;