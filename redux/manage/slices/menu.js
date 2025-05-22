import { createSlice } from '@reduxjs/toolkit';

const initialState = [
    {
      path: '/manage/dashboard',
      iconName: "dashboard",
      type: "link",
      selected: false,
      active: false,
      title: "Dashboard",
    },
    {
      path: '/manage/organization',
      iconName: "organization",
      type: "link",
      selected: false,
      active: false,
      title: "Organization",
    },
    {
      path: '/manage/inventory',
      iconName: "inventory",
      type: "link",
      selected: false,
      active: false,
      title: "Inventory",
    },    
    {
      path: '/manage/advertising',
      iconName: "advertising",
      type: "link",
      selected: false,
      active: false,
      title: "Advertising",
    },
    {
      path: '/manage/sales',
      iconName: "sales",
      type: "link",
      selected: false,
      active: false,
      title: "Sales",
    },
    {
      path: '/manage/accounts',
      iconName: "accounts",
      type: "link",
      selected: false,
      active: false,
      title: "Accounts",
    },
    {
      path: '/manage/staff',
      iconName: "staff",
      type: "link",
      selected: false,
      active: false,
      title: "Staff",
    },
    {
      path: "/manage/documents",
      iconName: "documents",
      type: "link",
      selected: false,
      active: false,
      title: "Documents",
    },
    {
      path: "/manage/templates",
      iconName: "templates",
      type: "link",
      selected: false,
      active: false,
      title: "Templates",
    },
]
  
  const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
      setSubMenu: (state, action) => {

            const { targetPath, ctrlKey } = action.payload;
      
            if (!ctrlKey) {
              const updateMenuItems = (items) => { 
                return items.map(item => {
                  if (item.path === targetPath) {
                    return {
                      ...item,
                      active: true,
                      selected: true,
                      children: item.children ? updateMenuItems(item.children) : item.children
                    };
                  } else {

                    const updatedItem = {
                      ...item,
                      active: false,
                      selected: false,
                      children: item.children ? updateMenuItems(item.children) : item.children
                    };
      
                    // Check if this item is an ancestor of the target
                    if (targetPath.startsWith(item.path + '/')) {
                      updatedItem.active = true;
                    }
      
                    return updatedItem;
                  }
                });
              };
      
              return updateMenuItems(state);
            }
      
            return state;
      },
      setSelectedMenuItem: (state, action) => { 
        return state.map(item => ({
          ...item,
          selected: item.path === action.payload,
          active: item.path === action.payload
        }));
      },
      toggleMenuItem: (state, action) => { 
        return state.map(item =>
          item.path === action.payload
            ? { ...item, active: !item.active }
            : item
        );
      },
    },
  });
  
  export const { setSelectedMenuItem, toggleMenuItem, setSubMenu } = menuSlice.actions;
  
  export default menuSlice.reducer;
  
  