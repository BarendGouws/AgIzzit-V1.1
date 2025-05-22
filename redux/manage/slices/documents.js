import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  //DOCUMENTS
  templates: [],
  documents: [],
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
  //DOCUMENT
  document: null,
  signatures: [],
  status: null,
  activeUser: null,
  //UI
  loading: false,
  error: null,
  success: null,
  info: null
};

//DOCUMENTS
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async ({ page = 1, searchTerm = '', statusFilter = '' }, { rejectWithValue }) => {
    try {
      let url = `/api/documents?page=${page}&limit=10&sort=-updatedAt`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (statusFilter) url += `&status=${statusFilter}`;      
      const response = await axios.get(url);
      return response.data;
    } catch (error) { 
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const generateDocument = createAsyncThunk(
  'documents/generateDocument',
  async ({ templateId, signerEmails, senderFields }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/documents', {
        templateId,
        signerEmails,
        senderFields,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

//DOCUMENT
export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (docId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/documents/${docId}`);
      console.log('hello',response.data);
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveUser: (state, action) => { 
      const userId = action.payload;
      const document = state.document; // Access the document from the current state  
      if (!document) {
        state.activeUser = null;
        return;
      }

      const userActions = document.auditTrail.filter((action) => action.user._id === userId);
      const latestAction = userActions.length > 0 ? userActions[userActions.length - 1] : null;
      const userProfile = document.signatures.find((sig) => sig.user._id === userId)?.user || null;
      const signatureCount = document.signatures.filter((sig) => sig.user._id === userId).length;
      const signaturesCompleted = document.signatures.filter((sig) => sig.user._id === userId && sig.completed).length;

      // Safely modify userProfile
      if (userProfile) {
        userProfile.latestAction = latestAction;
        userProfile.signatureCount = signatureCount;
        userProfile.signaturesCompleted = signaturesCompleted;
      }

      // Set the active user in the state
      state.activeUser = { ...userProfile };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearInfo: (state) => {
      state.info = null;
    }
  },
  extraReducers: (builder) => {
    builder
      //FETCH DOCUMENTS
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.documents = action.payload.documents;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //GENERATE DOCUMENT
      .addCase(generateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateDocument.fulfilled, (state, action) => {
        state.loading = false;
        //TODO
      })
      .addCase(generateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //GET DOCUMENT
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => { 

        const document = action.payload;

        console.log('document', document);

        const status = analyzeDocumentStatus(document);
        const signatures = uniqueOrderedSignatures(document);

        const userId = signatures[0]?.user._id;
        const userActions = document.auditTrail.filter((action) => action.user?._id === userId);
        const latestAction = userActions.length > 0 ? userActions[userActions.length - 1] : null; 
        const userProfile = document.signatures.find((sig) => sig.user._id === userId)?.user || null; 
        const signatureCount = document.signatures.filter((sig) => sig.user._id === userId).length; 
        const signaturesCompleted = document.signatures.filter((sig) => sig.user._id === userId && sig.completed).length; 

        if (userProfile) {
          userProfile.latestAction = latestAction;
          userProfile.signatureCount = signatureCount;
          userProfile.signaturesCompleted = signaturesCompleted;
        }

        state.loading = false;
        state.document = document
        state.signatures = signatures;
        state.status = status;
        state.activeUser = { ...userProfile };
        
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })      
  },
});

export const { setActiveUser, clearError, clearSuccess, clearInfo } = documentSlice.actions;

export default documentSlice.reducer;

//FETCH SINGLE DOCUMENT
export const analyzeDocumentStatus = (document) => {
  // Check if all fields are filled
  const allFieldsFilled = document.fields.every(field => field.value && field.value.trim() !== '');

  if (!allFieldsFilled) {
    // Find the role of the user who needs to fill the form
    const incompleteField = document.fields.find(field => !field.value || field.value.trim() === '');
    const recipientRole = incompleteField ? incompleteField.role : 'Recipient';
    return {
      waiting: true,
      user: recipientRole,
      action: 'Complete the document request',
      message: `Waiting for ${recipientRole} to complete the document request`
    };
  }

  // If all fields are filled, check for incomplete signatures
  const incompleteSignature = document.signatures.find(sig => !sig.completed);    
  if (incompleteSignature) {   
    const userName = incompleteSignature.user?.fullNames || incompleteSignature.user.email;
    return {
      waiting: true,
      user: userName,
      action: 'sign the document',
      message: `Waiting for ${userName} to view and sign the document`
    };
  }

  // If all signatures are complete
  return {
    waiting: false,
    user: null,
    action: null,
    message: 'Document is fully signed and completed'
  };
};

export const uniqueOrderedSignatures = (document) => {
  if (!document || !document.signatures) return [];

  const userMap = new Map();

  // First pass: count signatures for each user and extract all user data
  document.signatures.forEach((sig) => {
    const userId = sig.user._id;
    if (!userMap.has(userId)) {
      // Extract all keys from the user object
      const userData = { ...sig.user };

      userMap.set(userId, {
        role: sig.role,
        user: userData,
        signatureCount: 1,
        order: sig.order,
      });
    } else {
      userMap.get(userId).signatureCount += 1;
      // Update the role if this signature has a lower order
      if (sig.order < userMap.get(userId).order) {
        userMap.get(userId).role = sig.role;
        userMap.get(userId).order = sig.order;
      }
    }
  });

  // Convert map to array and sort by order
  const uniqueArray = Array.from(userMap.values()).sort(
    (a, b) => a.order - b.order
  );

  // Remove the order property from the final output
  return uniqueArray.map(({ order, ...rest }) => rest);
};


