import { configureStore } from '@reduxjs/toolkit';

import themeReducer from '@/redux/manage/theme/reducer';

import menuSlice from '@/redux/manage/slices/menu';
import documentSlice from '@/redux/manage/slices/documents';
import templateSlice from '@/redux/manage/slices/templates';
import staffSlice from '@/redux/manage/slices/staff';
import accountsSlice from '@/redux/manage/slices/accounts';
import salesSlice from '@/redux/manage/slices/sales';
import advertisingSlice from '@/redux/manage/slices/advertising';
import inventorySlice from '@/redux/manage/slices/inventory';
import organizationSlice from '@/redux/manage/slices/organization';
import dashboardSlice from '@/redux/manage/slices/dashboard';
import profileSlice from '@/redux/manage/slices/profile';
import advertisingTemplateSlice from '@/redux/manage/slices/advertisingTemplates';

const store = configureStore({
  reducer: { 
    theme: themeReducer,
    dashboard: dashboardSlice,
    organization: organizationSlice,
    inventory: inventorySlice,
    advertising: advertisingSlice, // Using the advertisingSlice, removed duplicate
    sales: salesSlice,
    accounts: accountsSlice,
    staff: staffSlice,
    documents: documentSlice,
    templates: templateSlice, 
    menu: menuSlice,
    profile: profileSlice,
    advertisingTemplate: advertisingTemplateSlice,
  }
});

export default store;