const initialState = {
	
	lang: "en",
	dir: "ltr",
	dataThemeMode: "light",
	dataMenuStyles: "light",
	dataNavLayout: "vertical",
	dataHeaderStyles: "color",
	dataVerticalStyle: "overlay",
	StylebodyBg:"107 64 64",
	StyleDarkBg:"93 50 50",
	toggled:"",
	dataNavStyle:"",
	horStyle:"",
	dataPageStyle:"regular",
	dataWidth:"fullwidth",
	dataMenuPosition:"fixed",
	dataHeaderPosition:"fixed",
	iconOverlay:"",
	colorPrimaryRgb: '92 , 56 , 166',
	colorPrimary: '100, 61, 179',
	bodyBg1:"",
	bodyBg:"",
	darkBg:"",
	Light:"",
	inputBorder:"",
	bgImg:"",
	iconText:"",
	body:{
		class:""
	},
	logoWhite:"/images/logo.png",
	logoDark:"/images/logo-white.png",
	logoIconWhite:"/images/icon.png",
	logoIconDark:"/images/icon-white.png",
};

export default function themeReducer(state = initialState, action) { 

	const { type, payload } = action;
  
	switch (type) {
	  case "ThemeChanger":
		return { ...state, ...payload };
	  default:
		return state;
	}
}
