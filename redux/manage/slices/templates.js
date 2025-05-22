import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { userKeysMap } from '@/utils/config';

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
  profilePlaceholders: [],
  //TEMPLATE
  template: null,
  placeholderInfo: null,
  activeKey: '0',
  showModal: false,
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//TEMPLATES
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async ({ page = 1, searchTerm = ''}, { rejectWithValue }) => {
    try { 
      let url = `/api/templates?page=${page}&limit=10`;
      if (searchTerm) url += `&search=${searchTerm}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const uploadTemplate = createAsyncThunk(
    'templates/uploadTemplate',
    async ({ file }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await axios.post('/api/templates', formData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload file.');
      }
    }
);

//TEMPLATE
export const fetchTemplate = createAsyncThunk(
  "templates/fetchTemplate",
  async (docId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/templates/${docId}`);

      if (response.status === 200) {
        console.log("Loaded template:", response.data);

        let placeholderInfo = null;
        let activeKey = "0";

        if (response.data?.fields?.length === 0) {
          activeKey = "1";
        } else if (!response.data.completed) {
          const templateFields = response.data?.fields;
          const presentTags = new Set(templateFields.map((field) => field.tag));

          const profilePlaceholders = Object.keys(userKeysMap).map((key) => ({
            tag: key,
            text: userKeysMap[key],
            isPresent: presentTags.has(key),
          }));

          const nonProfilePlaceholders = Array.from(presentTags)
            .filter((tag) => !userKeysMap[tag])
            .map((tag) => ({
              tag,
              text:
                templateFields.find((field) => field.tag === tag)?.text ||
                "No description available",
              isPresent: true,
            }));

          placeholderInfo = { profilePlaceholders, nonProfilePlaceholders };
        }

        return {
          template: response.data,
          placeholderInfo,
          activeKey,
          showModal: !!placeholderInfo,
        };
      } else {
        return rejectWithValue("Failed to load template");
      }
    } catch (error) {
      console.error("Error loading template:", error);
      return rejectWithValue(error.response?.data?.message || error.toString());
    }
  }
);

export const saveTemplate = createAsyncThunk(
  'templates/saveTemplate',
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
      const response = await axios.put(`/api/templates/${template._id}`, preparedTemplate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.toString());
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/templates/${templateId}`);
      return templateId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.toString());
    }
  }
);

const templateSlice = createSlice({
  name: 'templates',
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
    setActiveKey: (state, action) => {
      state.activeKey = action.payload;
    },
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      //FETCH TEMPLATES
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;  
        state.pagination = action.payload.pagination;     
        state.profilePlaceholders = action.payload.profilePlaceholders; 
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //GENERATE TEMPLATE
      .addCase(uploadTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Template generated successfully.'; 
        state.template = action.payload
      })
      .addCase(uploadTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //GET DOCUMENT
      .addCase(fetchTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => { 
        state.loading = false;
        state.template = action.payload.template;    
        state.placeholderInfo = action.payload.placeholderInfo;
        state.activeKey = action.payload.activeKey;
        state.showModal = action.payload.showModal;   
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //SAVE TEMPLATE
      .addCase(saveTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTemplate.fulfilled, (state, action) => { console.log('Saved template:', action.payload);
        state.loading = false;
        state.template = action.payload.data;
        state.success = action.payload.message;
      })
      .addCase(saveTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE TEMPLATE
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state) => {
        state.loading = false;
        state.template = null;
        state.success = 'Template deleted successfully!';
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }); 
  },
});

export const { clearError, clearSuccess, clearInfo, setActiveKey, setShowModal } = templateSlice.actions;

export default templateSlice.reducer;