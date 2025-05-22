import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { errorToast, successToast, infoToast } from "@/components/partials/Toast";
import Loader from "@/components/partials/Loader";

// Action Mappings for Different Slices
import { clearError as clearDocumentsError, clearSuccess as clearDocumentsSuccess, clearInfo as clearDocumentsInfo } from '@/redux/manage/slices/documents';
import { clearError as clearTemplatesError, clearSuccess as clearTemplatesSuccess, clearInfo as clearTemplatesInfo } from '@/redux/manage/slices/templates';
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
  // Add other slices here...
};

const StateHandler = ({ children, slice, id }) => { console.log('slice',slice,id);

  const { loading, error, success, info } = useSelector(state => state[slice]);
  
  const dispatch = useDispatch();
  const clearActions = actionMappings[slice];
  const toastShown = useRef({ error: false, success: false, info: false });

  useEffect(() => {
    if (clearActions) {
      if (error) errorToast(error, () => { dispatch(clearActions.clearError()) });
      if (success) successToast(success, () => { dispatch(clearActions.clearSuccess()) });
      if (info) infoToast(info, () => { dispatch(clearActions.clearInfo()) });
    }
  }, [error, success, info, dispatch, clearActions]);

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  );
};

export default StateHandler;
