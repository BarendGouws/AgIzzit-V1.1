import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  //STAFF
  accounts: [],
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
  member: null,
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

export const createStaff = createAsyncThunk(
    'staff/createStaff',
    async ({ file }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append('file', file);  
        const response = await axios.post('/api/manage/staff', formData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload file.');
      }
    }
);

//STAFF MEMBER
export const fetchMember = createAsyncThunk(
  'staff/fetchMember',
  async (docId, { rejectWithValue }) => {
    try {
        const response = await axios.get(`/api/manahe/${docId}`);  
        return response.data;     
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load staff member.');
    }
  }
);

export const saveMember = createAsyncThunk(
  'staff/saveMember',
  async (template, { rejectWithValue }) => {
    try {
      const preparedTemplate = {
        ...template,
        placeholders: template.placeholders.map((placeholder) => {
          if (placeholder._id && !mongoose.Types.ObjectId.isValid(placeholder._id)) {
            const { _id, ...rest } = placeholder;
            return rest;
          }
          return placeholder;
        }),
      };

      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedTemplate),
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const deleteMember = createAsyncThunk(
  'staff/deleteMember',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return templateId;
      } else {
        const data = await response.json();
        return rejectWithValue(data.message);
      }
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
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
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Member generated successfully.'; 
        state.staff = action.payload
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //FETCH MEMBER
      .addCase(fetchMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMember.fulfilled, (state, action) => { 
        state.loading = false;
        state.member = action.payload.template; 
      })
      .addCase(fetchMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //SAVE MEMBER
      .addCase(saveMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveMember.fulfilled, (state, action) => { 
        state.loading = false;
        state.member = action.payload.data;
        state.success = action.payload.message;
      })
      .addCase(saveMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE MEMBER
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state) => {
        state.loading = false;
        state.member = null;
        state.success = 'Member deleted successfully!';
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }); 
  },
});

export const { clearError, clearSuccess, clearInfo } = accountsSlice.actions;

export default accountsSlice.reducer;