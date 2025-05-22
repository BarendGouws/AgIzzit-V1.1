import { toast } from "react-toastify";

const defaultOptions = {
  position: 'top-right',
  hideProgressBar: true,
  theme: 'colored'
};

export const showToast = (message, type = 'default', callback = null, autoClose = 3000) => {
  const options = {
    ...defaultOptions,
    autoClose,
    onClose: callback, // Invokes the callback (like clearError) when the toast closes
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

// Specific toast types
export const successToast = (message, autoClose = 3000, callback = null) =>
  showToast(message, 'success', autoClose, callback);

export const errorToast = (message, autoClose = 5000, callback = null) =>
  showToast(message, 'error', autoClose, callback);

export const infoToast = (message, autoClose = 3000, callback = null) =>
  showToast(message, 'info', autoClose, callback);
