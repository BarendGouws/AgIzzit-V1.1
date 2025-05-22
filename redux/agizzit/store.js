import { configureStore } from '@reduxjs/toolkit';

import themeReducer from '@/redux/agizzit/theme/reducer';

import businessSignupSlice from '@/redux/agizzit/slices/business-signup';

const store = configureStore({
  reducer: {    
    businessSignup: businessSignupSlice,
    theme: themeReducer,
  },
});

export default store;