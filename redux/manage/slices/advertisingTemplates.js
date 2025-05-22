import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  //TEMPLATES
  templates: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  }, 
  //TEMPLATE
  aspectRatio: '4:3',
  images: [],
  texts: {},
  template: {
    name: '',
    designSize: "1:1",
    layers: [],
  },
  //UI
  loading: false,
  error: null,
  success: null,
  info: null 
};

//TEMPLATES
export const fetchAdvertisingTemplates = createAsyncThunk(
  'fetchAdvertisingTemplates/fetch',
  async ({ page = 1, searchTerm = '', limit = 10 }, { rejectWithValue }) => {
    try { 
      let url = `/api/manage/advertising-templates?page=${page}&limit=${limit}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

//TEMPLATE
export const fetchAdvertisingTemplate = createAsyncThunk(
  'advertisingTemplate/fetch',
  async (id, { rejectWithValue }) => {
    try { 
        const response = await axios.get(`/api/manage/advertising-templates/${id}`);
        return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveAdvertisingTemplate = createAsyncThunk(
  'advertisingTemplate/save',
  async ({ id, template }, { rejectWithValue }) => {
    try {  

      console.log('templateId',id);
      
        if(id === 'new'){
          const response = await axios.post(`/api/manage/advertising-templates`, template);
          return response.data;
        }

        const response = await axios.put(`/api/manage/advertising-templates/${id}`, template);
        return response.data;
        
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAdvertisingTemplate = createAsyncThunk(
  'advertisingTemplate/delete',
  async (id, { rejectWithValue }) => {
    try {        

        const response = await axios.delete(`/api/manage/advertising-templates/${id}`);
        return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const advertisingTemplateSlice = createSlice({
  name: 'advertisingTemplate',
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
    setError: (state, action) => { 
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
       //FETCH ADVERTISING TEMPLATES
      .addCase(fetchAdvertisingTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdvertisingTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch templates';
      })
       //FETCH ADVERTISING TEMPLATE
      .addCase(fetchAdvertisingTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisingTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.template = action.payload.template;
        state.aspectRatio = action.payload.aspectRatio;
        state.images = action.payload.images;
        state.texts = action.payload.texts;
      })
      .addCase(fetchAdvertisingTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch template';
      })
       //SAVE ADVERTISING TEMPLATE
      .addCase(saveAdvertisingTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAdvertisingTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.template = action.payload.template;
        state.success = action.payload.message;
      })
      .addCase(saveAdvertisingTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save template';
      }) 
      //DELETE ADVERTISING TEMPLATE
      .addCase(deleteAdvertisingTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvertisingTemplate.fulfilled, (state) => {
        state.loading = false;
        state.template = null; // Reset template state
        state.success = 'Template deleted successfully';
      })
      .addCase(deleteAdvertisingTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete template';
      });      
  },
});

export const { clearError, clearSuccess, clearInfo, setError } = advertisingTemplateSlice.actions;

export default advertisingTemplateSlice.reducer;