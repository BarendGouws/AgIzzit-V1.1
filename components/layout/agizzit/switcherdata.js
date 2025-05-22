import { useState } from "react";
import store from "@/redux/manage/store";

const MENUITEMS = [
	{
		menutitle: "Main",
	},
	{
		title: "Dashboards",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="side-menu__icon"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z" />
			</svg>
		),
		type: "sub",
		selected: false,
		active: false,
		children: [
			{
				path: "/components/dashboards/dashboard1",
				type: "link",
				active: false,
				selected: false,
				title: "Dashboard-1",
			},
			
		],
	},

	{
		menutitle: "PAGES",
	},
	{
		title: "Pages",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="side-menu__icon"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path d="M22 7.999a1 1 0 0 0-.516-.874l-9.022-5a1.003 1.003 0 0 0-.968 0l-8.978 4.96a1 1 0 0 0-.003 1.748l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5A1 1 0 0 0 22 7.999zm-9.977 3.855L5.06 7.965l6.917-3.822 6.964 3.859-6.918 3.852z" />
				<path d="M20.515 11.126 12 15.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.97-1.748z" />
				<path d="M20.515 15.126 12 19.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.97-1.748z" />
			</svg>
		),
		type: "sub",
		selected: false,
		active: false,
		children: [
			{
				title: "Authentication",
				type: "sub",
				selected: false,
				active: false,
				children: [
					
					{
						path: "/components/pages/authentication/404",
						title: "404 Error",
						type: "link",
						active: false,
						selected: false,
					},
				
				],
			},
		]
	},
	{
		menutitle: "DOCUMENTS",
	},
	{
		title: "Documents",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="side-menu__icon"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				>
				<path d="M6 2h9l5 5v14c0 1.103-.897 2-2 2H6c-1.103 0-2-.897-2-2V4c0-1.103.897-2 2-2zm9 7V3.5L18.5 9H15zM6 20h12v-9h-5V4H6v16z" />
		   </svg>

		),
		type: "link",
		selected: false,
		path:"/documents",
	},
	{
		title: "Templates",
		icon: (
			<svg
			xmlns="http://www.w3.org/2000/svg"
			className="side-menu__icon"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			>
			<path d="M6 2h9l5 5v14c0 1.103-.897 2-2 2H6c-1.103 0-2-.897-2-2V4c0-1.103.897-2 2-2zm9 7V3.5L18.5 9H15zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
			</svg>

		),
		type: "link",
		selected: false,
		path:"/templates",
	},
	
];

const saveThemeToDatabase = (theme) => {
	console.log("Saving theme to database:", theme);
	// Implement your database saving logic here
};
  
export function Dark(actionfunction) {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataThemeMode": "dark",
		  "dataHeaderStyles": "dark",
		  "dataMenuStyles": "dark",
		  "bodyBg1": "",
		  "bodyBg": "",
		  "darkBg": "",
		  "Light": "",
		  "inputBorder": "",
	  });
	  saveThemeToDatabase(theme);
}
  
export function Light(actionfunction) {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataThemeMode": "light",
		  "dataHeaderStyles": "light",
		  "bodyBg1": "",
		  "bodyBg": "",
		  "darkBg": "",
		  "Light": "",
		  "inputBorder": "",
		  "dataMenuStyles": "light",
	  });
	  saveThemeToDatabase(theme);
}
  
export function Ltr(actionfunction) {
	  const { theme } = store.getState();
	  actionfunction({ ...theme, dir: "ltr" });
	  saveThemeToDatabase(theme);
}
  
export function Rtl(actionfunction) {
	  const { theme } = store.getState();
	  actionfunction({ ...theme, dir: "rtl" });
	  saveThemeToDatabase(theme);
}
  
export const HorizontalClick = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "horizontal",	
		  "dataVerticalStyle": "",
		  "dataNavStyle": "menu-click"
	  });
	  saveThemeToDatabase(theme);
};
  
export const Vertical = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "vertical",
		  "dataVerticalStyle": "overlay",
		  "toggled": "",
		  "dataNavStyle": ""
	  });
	  saveThemeToDatabase(theme);
};
  
export const Menuclick = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavStyle": "menu-click",
		  "dataVerticalStyle": "",
		  "toggled": "menu-click-closed",
	  });
	  saveThemeToDatabase(theme);
	  const Sidebar = document.querySelector(".main-menu");
	  if (Sidebar) {
		  Sidebar.style.marginInline = "0px";
	  }
};
  
export const MenuHover = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavStyle": "menu-hover",
		  "dataVerticalStyle": "",
		  "toggled": "menu-hover-closed",
		  "horStyle": ""
	  });
	  saveThemeToDatabase(theme);
	  const Sidebar = document.querySelector(".main-menu");
	  if (Sidebar) {
		  Sidebar.style.marginInline = "0px";
	  }
};
  
export const IconClick = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavStyle": "icon-click",
		  "dataVerticalStyle": "",
		  "toggled": "icon-click-closed",
	  });
	  saveThemeToDatabase(theme);
	  const Sidebar = document.querySelector(".main-menu");
	  if (Sidebar) {
		  Sidebar.style.marginInline = "0px";
	  }
};
  
function closeMenuFn() {
	  const closeMenuRecursively = (items) => {
		  items?.forEach((item) => {
			  item.active = false;
			  closeMenuRecursively(item.children);
		  });
	  };
	  closeMenuRecursively(MENUITEMS);
}
  
export const IconHover = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavStyle": "icon-hover",
		  "dataVerticalStyle": "",
		  "toggled": "icon-hover-closed"
	  });
	  saveThemeToDatabase(theme);
	  const Sidebar = document.querySelector(".main-menu");
	  if (Sidebar) {
		  Sidebar.style.marginInline = "0px";
	  }
	  closeMenuFn();
};
  
export const Fullwidth = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataWidth": "fullwidth",
	  });
	  saveThemeToDatabase(theme);
};
  
export const Boxed = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataWidth": "boxed",
	  });
	  saveThemeToDatabase(theme);
};
  
export const FixedMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuPosition": "fixed",
	  });
	  saveThemeToDatabase(theme);
};
  
export const scrollMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuPosition": "scrollable",
	  });
	  saveThemeToDatabase(theme);
};
  
export const Headerpostionfixed = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataHeaderPosition": "fixed",
	  });
	  saveThemeToDatabase(theme);
};
  
export const Headerpostionscroll = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataHeaderPosition": "scrollable",
	  });
	  saveThemeToDatabase(theme);
};
  
export const Regular = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataPageStyle": "regular"
	  });
	  saveThemeToDatabase(theme);
};
  
export const Classic = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataPageStyle": "classic",
	  });
	  saveThemeToDatabase(theme);
};
  
export const Modern = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataPageStyle": "modern",
	  });
	  saveThemeToDatabase(theme);
};
  
export const Defaultmenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataVerticalStyle": "overlay",
		  "dataNavLayout": "vertical",
		  "toggled": ""
	  });
	  saveThemeToDatabase(theme);
	  const icon = document.getElementById("switcher-default-menu");
	  if (icon) {
		  icon.checked = true;
	  }
};
  
export const Closedmenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "vertical",
		  "dataVerticalStyle": "closed",
		  "toggled": "close-menu-close"
	  });
	  saveThemeToDatabase(theme);
};
  
function icontextOpenFn() {
	  let html = document.documentElement;
	  if (html.getAttribute("data-toggled") === "icon-text-close") {
		  html.setAttribute("data-icon-text", "open");
	  }
}
  
function icontextCloseFn() {
	  let html = document.documentElement;
	  if (html.getAttribute("data-toggled") === "icon-text-close") {
		  html.removeAttribute("data-icon-text");
	  }
}
  
export const iconTextfn = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "vertical",
		  "dataVerticalStyle": "icontext",
		  "toggled": "icon-text-close"
	  });
	  saveThemeToDatabase(theme);
	  const MainContent = document.querySelector(".main-content");
	  const appSidebar = document.querySelector(".app-sidebar");
  
	  appSidebar?.addEventListener("click", () => {
		  icontextOpenFn();
	  });
	  MainContent?.addEventListener("click", () => {
		  icontextCloseFn();
	  });
};
  
export const iconOverayFn = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "vertical",
		  "dataVerticalStyle": "overlay",
		  "toggled": "icon-overlay-close",
	  });
	  saveThemeToDatabase(theme);
	  const icon = document.getElementById("switcher-icon-overlay");
	  if (icon) {
		  icon.checked = true;
	  }
	  const MainContent = document.querySelector(".main-content");
	  const appSidebar = document.querySelector(".app-sidebar");
	  appSidebar?.addEventListener("click", () => {
		  DetachedOpenFn();
	  });
	  MainContent?.addEventListener("click", () => {
		  DetachedCloseFn();
	  });
};
  
function DetachedOpenFn() {
	  if (window.innerWidth > 992) {
		  let html = document.documentElement;
		  if (html.getAttribute("data-toggled") === "detached-close" || html.getAttribute("data-toggled") === "icon-overlay-close") {
			  html.setAttribute("icon-overlay", "open");
		  }
	  }
}
  
function DetachedCloseFn() {
	  if (window.innerWidth > 992) {
		  let html = document.documentElement;
		  if (html.getAttribute("data-toggled") === "detached-close" || html.getAttribute("data-toggled") === "icon-overlay-close") {
			  html.removeAttribute("icon-overlay");
		  }
	  }
}
  
export const DetachedFn = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "vertical",
		  "dataVerticalStyle": "detached",
		  "toggled": "detached-close",
	  });
	  saveThemeToDatabase(theme);
	  const MainContent = document.querySelector(".main-content");
	  const appSidebar = document.querySelector(".app-sidebar");
  
	  appSidebar?.addEventListener("click", () => {
		  DetachedOpenFn();
	  });
	  MainContent?.addEventListener("click", () => {
		  DetachedCloseFn();
	  });
};
  
export const DoubletFn = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataNavLayout": "vertical",
		  "dataVerticalStyle": "doublemenu",
		  "dataNavStyle": "",
		  "toggled": "double-menu-open",
	  });
	  saveThemeToDatabase(theme);
  
	  setTimeout(() => {
		  if (!document.querySelectorAll(".main-menu .slide.active")[0].querySelector("ul")) {
			  const { theme } = store.getState();
			  actionfunction(
				  {
					  ...theme,
					  "toggled": "double-menu-close",
				  }
			  );
			  saveThemeToDatabase(theme);
		  }
	  }, 100);
};
  
export const bgImage1 = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "bgImg": "bgimg1"
	  });
	  saveThemeToDatabase(theme);
};
  
export const bgImage2 = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "bgImg": "bgimg2"
	  });
	  saveThemeToDatabase(theme);
};
  
export const bgImage3 = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "bgImg": "bgimg3"
	  });
	  saveThemeToDatabase(theme);
};
  
export const bgImage4 = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "bgImg": "bgimg4"
	  });
	  saveThemeToDatabase(theme);
};
  
export const bgImage5 = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "bgImg": "bgimg5"
	  });
	  saveThemeToDatabase(theme);
};
  
export const colorMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuStyles": "color",
	  });
	  saveThemeToDatabase(theme);
};
  
export const lightMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuStyles": "light",
	  });
	  saveThemeToDatabase(theme);
};
  
export const darkMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuStyles": "dark",
	  });
	  saveThemeToDatabase(theme);
};
  
export const gradientMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuStyles": "gradient",
	  });
	  saveThemeToDatabase(theme);
};
  
export const transparentMenu = (actionfunction) => {
	  const { theme } = store.getState();
	  actionfunction({
		  ...theme,
		  "dataMenuStyles": "transparent",
	  });
	  saveThemeToDatabase(theme);
};

export const lightHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"dataHeaderStyles": "light",
	});
	saveThemeToDatabase(theme);
};

export const darkHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"dataHeaderStyles": "dark",
	});
	saveThemeToDatabase(theme);
};

export const colorHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"dataHeaderStyles": "color",
	});
	saveThemeToDatabase(theme);
};

export const gradientHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"dataHeaderStyles": "gradient",
	});
	saveThemeToDatabase(theme);
};

export const transparentHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"dataHeaderStyles": "transparent",
	});
	saveThemeToDatabase(theme);
};

export const primaryColor1 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "58, 88, 146",
	});
	saveThemeToDatabase(theme);
};

export const primaryColor2 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "92, 144, 163",
	});
	saveThemeToDatabase(theme);
};

export const primaryColor3 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "161, 90, 223",
	});
	saveThemeToDatabase(theme);
};

export const primaryColor4 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "78, 172, 76",
	});
	saveThemeToDatabase(theme);
};

export const primaryColor5 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"colorPrimaryRgb": "223, 90, 90",
	});
	saveThemeToDatabase(theme);
};

export const backgroundColor1 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "20, 30, 96",
		"bodyBg1":"25, 38, 101",
		"Light": "25, 38, 101",
		"darkBg": "25, 38, 101",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles":  "dark",
	});
	saveThemeToDatabase(theme);
};

export const backgroundColor2 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "8, 78, 115",
		"bodyBg1":"13, 86, 120",
		"Light": "13, 86, 120",
		"darkBg": "13, 86, 120",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark"
	});
	saveThemeToDatabase(theme);
};

export const backgroundColor3 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "90, 37, 135",
		"bodyBg1":"95, 45, 140",
		"Light": "95, 45, 140",
		"darkBg": "95, 45, 140",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark"
	});
	saveThemeToDatabase(theme);
};

export const backgroundColor4 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "24, 101, 51",
		"bodyBg1":"29, 109, 56",
		"Light": "29, 109, 56",
		"darkBg": "29, 109, 56",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark"
	});
	saveThemeToDatabase(theme);
};

export const backgroundColor5 = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"bodyBg": "120, 66, 20",
		"bodyBg1":"125, 74,25",
		"Light": "125, 74,25",
		"darkBg": "125, 74, 25",
		"inputBorder": "255, 255, 255, 0.1",
		"dataThemeMode": "dark",
		"dataMenuStyles": "dark",
		"dataHeaderStyles": "dark"
	});
	saveThemeToDatabase(theme);
};

const ColorPicker = (props) => {
	return (
		<div className="color-picker-input">
			<input type="color" {...props} />
		</div>
	);
};

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

const Themeprimarycolor = ({ actionfunction }) => {
	const { theme } = store.getState();
	const [state, updateState] = useState("#FFFFFF");

	const handleInput = (e) => {
		const rgb = hexToRgb(e.target.value);

		if (rgb !== null) {
			const { r, g, b } = rgb;
			updateState(e.target.value);
			actionfunction({
				...theme,
				"colorPrimaryRgb": `${r} , ${g} , ${b}`,
			});
			saveThemeToDatabase({...theme, colorPrimaryRgb: `${r} , ${g} , ${b}`});
		}
	};

	return (
		<div className="Themeprimarycolor theme-container-primary pickr-container-primary">
			<ColorPicker onChange={handleInput} value={state} />
		</div>
	);
};

export default Themeprimarycolor;

export const Themebackgroundcolor = ({ actionfunction }) => {
	const { theme } = store.getState();
	const [state, updateState] = useState("#FFFFFF");
	const handleInput = (e) => {
		const { r, g, b } = hexToRgb(e.target.value);
		updateState(e.target.value);
		const updatedTheme = {
			...theme,
			"bodyBg": `${r}, ${g}, ${b}`,
			"bodyBg1": `${r + 19}, ${g + 19}, ${b + 19}`,
			"Light": `${r + 19}, ${g + 19}, ${b + 19}`,
			"darkBg": `${r + 19}, ${g + 19}, ${b + 19}`,
			"inputBorder": "255, 255, 255, 0.1",
			"dataThemeMode": "dark",
			"dataHeaderStyles": "dark",
			"dataMenuStyles": "dark"
		};
		actionfunction(updatedTheme);
		saveThemeToDatabase(updatedTheme);
	};
	return (
		<div className="Themebackgroundcolor">
			<ColorPicker onChange={handleInput} value={state} />
		</div>
	);
};

export const Reset = (actionfunction) => {
	const defaultTheme = {
		lang: "en",
		dir: "ltr",
		dataThemeMode: "light",
		dataMenuStyles: "light",
		dataNavLayout: "vertical",
		dataHeaderStyles: "light",
		dataVerticalStyle: "overlay",
		StylebodyBg: "107 64 64",
		StyleDarkBg: "93 50 50",
		toggled: "",
		dataNavStyle: "",
		horStyle: "",
		dataPageStyle: "regular",
		dataWidth: "fullwidth",
		dataMenuPosition: "fixed",
		dataHeaderPosition: "fixed",
		loader: "disable",
		iconOverlay: "",
		colorPrimaryRgb: "",
		bodyBg1: "",
		bodyBg: "",
		Light: "",
		darkBg: "",
		inputBorder: "",
		bgImg: "",
		iconText: "",
		body: {
			class: ""
		}
	};
	
	actionfunction(defaultTheme);
	saveThemeToDatabase(defaultTheme);
	const icon = document.getElementById("switcher-default-menu");
	if(icon){
		icon.checked = true;
	}
};

//TODO 
export const loadThemeFromDatabase = async (actionfunction) => {
	try {
		// Placeholder for database load operation
		// const theme = await fetchThemeFromDatabase();
		// if (theme) {
		//     actionfunction(theme);
		// } else {
		//     Reset(actionfunction);
		// }
		console.log("Loading theme from database");
		// For now, we'll just use the Reset function
		Reset(actionfunction);
	} catch (error) {
		console.error("Error loading theme from database:", error);
		Reset(actionfunction);
	}
};

export const defaultlightHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "light",
		"dataHeaderStyles": "",
	});
	saveThemeToDatabase(theme);
};

export const defaultdarkHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "dark",
		"dataHeaderStyles": "",
	});
	saveThemeToDatabase(theme);
};

export const defaultcolorHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "color",
		"dataHeaderStyles": "",
	});
	saveThemeToDatabase(theme);
};

export const defaultgradientHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "gradient",
		"dataHeaderStyles": "",
	});
	saveThemeToDatabase(theme);
};

export const defaulttransparentHeader = (actionfunction) => {
	const { theme } = store.getState();
	actionfunction({
		...theme,
		"defaultHeaderStyles": "transparent",
		"dataHeaderStyles": "",
	});
	saveThemeToDatabase(theme);
};
