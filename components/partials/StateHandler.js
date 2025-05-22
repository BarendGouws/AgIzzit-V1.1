import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from "@/components/partials/Loader";
import { toast } from "react-toastify";

// Action Mappings for Different Slices
import { clearError as clearDocumentsError, clearSuccess as clearDocumentsSuccess, clearInfo as clearDocumentsInfo } from '@/redux/manage/slices/documents';
import { clearError as clearTemplatesError, clearSuccess as clearTemplatesSuccess, clearInfo as clearTemplatesInfo } from '@/redux/manage/slices/templates';
import { clearError as clearOrganizationError, clearSuccess as clearOrganizationSuccess, clearInfo as clearOrganizationInfo } from '@/redux/manage/slices/organization';
import { clearError as clearProfileError, clearSuccess as clearProfileSuccess, clearInfo as clearProfileInfo } from '@/redux/manage/slices/profile';
import { clearError as clearStaffError, clearSuccess as clearStaffSuccess, clearInfo as clearStaffInfo } from '@/redux/manage/slices/staff';
import { clearError as clearAdvertisingTemplateError, clearSuccess as clearAdvertisingTemplateSuccess, clearInfo as clearAdvertisingTemplateInfo } from '@/redux/manage/slices/advertisingTemplates';
import { clearError as clearInventoryError, clearSuccess as clearInventorySuccess, clearInfo as clearInventoryInfo } from '@/redux/manage/slices/inventory';
import { clearError as clearAdvertisingError, clearSuccess as clearAdvertisingSuccess, clearInfo as clearAdvertisingInfo } from '@/redux/manage/slices/advertising';
// Add imports for other slices as needed...

const actionMappings = {
  documents: {
    clearError: clearDocumentsError,
    clearSuccess: clearDocumentsSuccess,
    clearInfo: clearDocumentsInfo,
  },
  templates: {
    clearError: clearTemplatesError,
    clearSuccess: clearTemplatesSuccess,
    clearInfo: clearTemplatesInfo,
  },
  organization: {
    clearError: clearOrganizationError,
    clearSuccess: clearOrganizationSuccess,
    clearInfo: clearOrganizationInfo,
  },
  profile: {
    clearError: clearProfileError,
    clearSuccess: clearProfileSuccess,
    clearInfo: clearProfileInfo,
  },
  staff: {
    clearError: clearStaffError,
    clearSuccess: clearStaffSuccess,
    clearInfo: clearStaffInfo,
  },
  advertisingTemplate: {
    clearError: clearAdvertisingTemplateError,
    clearSuccess: clearAdvertisingTemplateSuccess,
    clearInfo: clearAdvertisingTemplateInfo,
  },
  inventory: {
    clearError: clearInventoryError,
    clearSuccess: clearInventorySuccess,
    clearInfo: clearInventoryInfo,
  },  
  advertising: {
    clearError: clearAdvertisingError,
    clearSuccess: clearAdvertisingSuccess,
    clearInfo: clearAdvertisingInfo,
  },
  // Add other slices here...
};

const defaultOptions = {
  position: 'top-right',
  hideProgressBar: true,
  theme: 'colored'
};

const StateHandler = ({ children, slice, id }) => { 
  // Add null check to prevent errors when slice doesn't exist
  const sliceState = useSelector(state => state[slice] || {});
  const { loading, error, success, info } = sliceState;
  const dispatch = useDispatch();
  const clearActions = actionMappings[slice];

  // Clear messages on component mount to prevent lingering messages
  useEffect(() => {
    if (clearActions) {
      // Clear any lingering success/error/info messages when component mounts
      if (success) dispatch(clearActions.clearSuccess());
      if (error) dispatch(clearActions.clearError());
      if (info) dispatch(clearActions.clearInfo());
    }
  }, []);  // Empty dependency array means this runs once on mount

  const showToast = (message, type = 'default', callback = null, autoClose = 3000) => {
    // Skip if message is empty
    if (!message) return;
    
    // Create a unique ID based on the type and message
    const toastId = `${type}-${message}`;

    // Check if there's already an active toast with this exact type and message
    const existingToast = toast.isActive(toastId);
    if (existingToast) {
      // Update the existing toast instead of creating a new one
      toast.update(toastId, {
        render: message,
        type: type,
        ...defaultOptions,
        autoClose: autoClose,
      });
      return;
    }

    const options = {
      ...defaultOptions,
      toastId: toastId, // Use the unique ID as the toastId
      autoClose,
      onClose: callback,
    };

    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  // Handle messages when they change
  useEffect(() => {
    if (clearActions) { 
      if (error) {
        // Fix: Call the action creator by adding ()
        showToast(error, 'error', () => dispatch(clearActions.clearError()), 5000);
      }
      if (success) {
        // Fix: Call the action creator by adding () 
        showToast(success, 'success', () => dispatch(clearActions.clearSuccess()), 2000);
      }
      if (info) {
        // Fix: Call the action creator by adding ()
        showToast(info, 'info', () => dispatch(clearActions.clearInfo()), 3000);
      }
    }
  }, [error, success, info, dispatch, clearActions]);

  return (
    <>
      {loading && <Loader slice={slice} />}
      {children}
    </>
  );
};

export default StateHandler;