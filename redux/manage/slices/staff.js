import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  //STAFF
  staff: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  }, 
  stats: {
    totalSignatures: 0,
    pendingSignatures: 0,
    completedSignatures: 0,
    inProgressSignatures: 0
  },
  //STAFF MEMBER
  staffMember: null,
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//STAFF
export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async ({ page = 1, searchTerm = '', statusFilter = '' }, { rejectWithValue }) => {
    try { 
      let url = `/api/manage/staff?page=${page}&limit=10&sort=-updatedAt`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (statusFilter) url += `&status=${statusFilter}`;     
      const response = await axios.get(url);
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

//STAFF MEMBER
export const createStaffMember = createAsyncThunk(
  'staff/createStaff',
  async ({ staffMember }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/manage/staff', staffMember);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload file.');
    }
  }
);

export const fetchStaffMember = createAsyncThunk(
  'staff/fetchStaffMember',
  async ({ staffId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/manage/staff/${staffId}`);  
      return response.data;     
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load staff member.');
    }
  }
);

export const saveStaffMember = createAsyncThunk(
  'staff/saveStaffMember',
  async ({ staffId, staff }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/manage/staff/${staffId}`, staff);  
      return response.data;     
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save staff member.');
    }
  }
);

export const deleteStaffMember = createAsyncThunk(
  'staff/deleteStaffMember',
  async ({ staffId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/staff/${staffId}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete staff member.');
    }
  }
);

//VERIFY DETAILS
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

const staffSlice = createSlice({
  name: 'staff',
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
       //FETCH STAFF
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload.staff;  
        state.pagination = action.payload.pagination;     
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //CREATE STAFF
      .addCase(createStaffMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Member generated successfully.'; 
        state.staff = action.payload.staffMember
      })
      .addCase(createStaffMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //FETCH MEMBER
      .addCase(fetchStaffMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffMember.fulfilled, (state, action) => { 
        state.loading = false;
        state.staffMember = action.payload.staffMember; 
      })
      .addCase(fetchStaffMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //SAVE MEMBER
      .addCase(saveStaffMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveStaffMember.fulfilled, (state, action) => { 
        state.loading = false;
        state.staffMember = action.payload.staffMember;
        state.success = action.payload.message;
      })
      .addCase(saveStaffMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE MEMBER
      .addCase(deleteStaffMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaffMember.fulfilled, (state) => {
        state.loading = false;
        state.staffMember = null;
        state.success = 'Member deleted successfully!';
      })
      .addCase(deleteStaffMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //VERIFY EMAIL AND PHONE
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

export const { clearError, clearSuccess, clearInfo } = staffSlice.actions;

export default staffSlice.reducer;