import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  //INVENTORY
  inventory: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  }, 
  stats: {
    totalItems: 0,          // total quantity of all items on hand
    distinctProducts: 0,     // unique SKUs or product types
    lowStockItems: 0,        // count of items below re-order threshold
    totalInventoryValue: 0  // total dollar value of all items
  },
  //INVENTORY
  item: null,
  extras: [],
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//INVENTORY
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async ({ page = 1, searchTerm = '', statusFilter = '' }, { rejectWithValue }) => {
    try { 
      let url = `/api/manage/inventory?page=${page}&limit=10&sort=-updatedAt`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (statusFilter) url += `&status=${statusFilter}`;     
      const response = await axios.get(url);
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
});

export const createInventory = createAsyncThunk(
    'inventory/createInventory',
    async (inventoryItem , { rejectWithValue }) => {
      try { 
        const response = await axios.post('/api/manage/inventory', inventoryItem);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create inventory item.');
      }
});

//INVENTORY ITEM
export const fetchInventoryItem = createAsyncThunk(
  'inventory/fetchInventoryItem',
  async (id, { rejectWithValue }) => {
    try {        
        const response = await axios.get(`/api/manage/inventory/${id}`);  
        return response.data;     
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load inventory item.');
    }
});

export const saveInventoryItem = createAsyncThunk(
  'inventory/saveInventoryItem',
  async ({ inventoryItem, id }, { rejectWithValue }) => {
    try { 
      const response = await axios.put(`/api/manage/inventory/${id}`, inventoryItem);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save inventory item.');
    }
});

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (itemId, { rejectWithValue }) => {
     try { 
        const response = await axios.delete(`/api/manage/inventory/${itemId}`);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete inventory item.');
      }
});

//IMAGES
export const uploadImages = createAsyncThunk(
  'organization/uploadImages',
  async ({ files, itemId, cropData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();    
      files.forEach((file, index) => {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${index + 1}: Please upload an image file`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${index + 1}: File size should be less than 5MB`);
        }

        formData.append('images', file);
      });

      // Add crop data if available
      if (cropData) {
        formData.append('cropData', JSON.stringify(cropData));
      }

      const response = await axios.post(`/api/manage/inventory/${itemId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteImage = createAsyncThunk(
  'inventory/deleteImage',
  async ({ itemId, imageId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/inventory/${itemId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

//DOCUMENTS
export const uploadDocuments = createAsyncThunk(
  'inventory/uploadDocuments',
  async ({ files, itemId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await axios.post(`/api/manage/inventory/${itemId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'inventory/deleteDocument',
  async ({ itemId, documentId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/inventory/${itemId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

//VIDEOS
export const uploadVideo = createAsyncThunk(
  'inventory/uploadVideo',
  async ({ itemId, videoId, url, caption }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/manage/inventory/${itemId}/videos`, { videoId, url, caption }, {
        headers: { 'Content-Type': 'application/json'}
      });

      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'inventory/deleteVideo',
  async ({ itemId, videoId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/manage/inventory/${itemId}/videos/${videoId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

//AUCTION
export const bookAuction = createAsyncThunk(
  'inventory/bookAuction',
  async ({ payload, id }, { rejectWithValue }) => {
    try {
      // POST to /api/inventory/auctions
      const response = await axios.post(`/api/manage/inventory/${id}/auctions`, payload);
      return response.data; // returned as 'fulfilled' payload
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
)

export const deleteAuction = createAsyncThunk(
  'inventory/deleteAuction',
  async ({ auctionId, id}, { rejectWithValue }) => {
    try {
      // Assuming your DELETE route is /api/inventory/auctions/[auctionId]
      const response = await axios.delete(`/api/manage/inventory/${id}/auctions/${auctionId}`);
      return response.data; // e.g. { message: "Auction deleted", ... }
    } catch (error) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
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
       //FETCH INVENTORY
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.inventory;  
        state.pagination = action.payload.pagination;     
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //CREATE INVENTORY
      .addCase(createInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message; 
        state.inventory = action.payload.item;
        state.extras = action.payload.extras;
      })
      .addCase(createInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //FETCH INVENTORY ITEM
      .addCase(fetchInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItem.fulfilled, (state, action) => { 
        state.loading = false;
        state.item = action.payload.item; 
        state.extras = action.payload.extras;
      })
      .addCase(fetchInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //SAVE INVENTORY ITEM
      .addCase(saveInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveInventoryItem.fulfilled, (state, action) => { 
        state.loading = false;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(saveInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE INVENTORY ITEM
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state) => {
        state.loading = false;
        state.item = null;
        state.success = 'Inventory Item deleted successfully!';
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //UPLOAD IMAGE
      .addCase(uploadImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE IMAGE
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })      
      //UPLOAD DOCUMENT
      .addCase(uploadDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE DOCUMENT
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })   
      //UPLOAD VIDEO
      .addCase(uploadVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => { 
        state.loading = false;
        state.error = null;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE VIDEO
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.item = action.payload.item;
        state.success = action.payload.message;
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //BOOK AUCTION
      .addCase(bookAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAuction.fulfilled, (state, action) => { 
        state.loading = false;
        state.success = action.payload.message;
        state.item = action.payload.item;
      })
      .addCase(bookAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //DELETE AUCTION
      .addCase(deleteAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || "Auction deleted.";
        state.item = action.payload.item;
      })
      .addCase(deleteAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export const { clearError, clearSuccess, clearInfo } = inventorySlice.actions;

export default inventorySlice.reducer;