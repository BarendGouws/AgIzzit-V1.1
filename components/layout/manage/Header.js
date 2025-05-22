
import Link from "next/link";
import { Fragment, useEffect, useState, useRef } from "react";
import { Button, Card, Dropdown, Form, ListGroup, Nav, Offcanvas, Tab } from "react-bootstrap";
import { ThemeChanger } from "@/redux/agizzit/theme/action";
import SimpleBar from "simplebar-react";
import { connect } from "react-redux";
import { basePath } from "@/next.config";
import { useSession,  signOut, } from 'next-auth/react'

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
const cartProduct = [
	{
		id: 1,
		src: "/assets/images/ecommerce/19.jpg",
		name: "Lence Camera",
		quantity: "1* $189.00",

	},
	{
		id: 2,
		src: "/assets/images/ecommerce/16.jpg",
		name: "White Earbuds",
		quantity: "3* $59.00",

	},
	{
		id: 3,
		src: "/assets/images/ecommerce/12.jpg",
		name: "Branded Black Headeset",
		quantity: "2* $39.99",
	},
	{
		id: 4,
		src: "/assets/images/ecommerce/6.jpg",
		name: "Glass Decor Item",
		quantity: "5* $5.99",
	},
	{
		id: 5,
		src: "/assets/images/ecommerce/4.jpg",
		name: "Pink Teddy Bear",
		quantity: "1* $10.00",

	},
];
const initialNotifications = [
	{ id: 1, icon: "far fa-folder-open text-fixed-white fs-18", name: "New Files available", time: "10 hours ago", avatarcolor: "pink", },
	{ id: 2, icon: "fab fa-delicious text-fixed-white fs-18", name: "Updates available", time: "2 days ago", avatarcolor: "purple", },
	{ id: 3, icon: "fa fa-cart-plus text-fixed-white fs-18", name: "New order received", time: "1 hours ago", avatarcolor: "success", },
	{ id: 4, icon: "far fa-envelope-open text-fixed-white fs-18", name: "New review received", time: "1 day ago", avatarcolor: "warning", },
	{ id: 5, icon: "fab fa-wpforms text-fixed-white fs-18", name: "22 verified registrations", time: "2 hours ago", avatarcolor: "danger", },
	{ id: 6, icon: "far fa-check-square text-fixed-white fs-18", name: "Project approved", time: "4 hours ago", avatarcolor: "success", },
];
const pane1 = [
	{ id: 1, avatar: "CH", title: "New Websites is Created", time: "30 mins ago" },
	{ id: 2, avatar: "N", title: "Prepare For the Next Project", time: "2 hours ago" },
	{ id: 3, avatar: "S", title: "Decide the live Discussion", time: "3 hours ago" },
	{ id: 4, avatar: "K", title: "Meeting at 3:00 pm", time: "4 hours ago" },
	{ id: 5, avatar: "R", title: "Prepare for Presentation", time: "1 days ago" },
	{ id: 6, avatar: "MS", title: "Prepare for Presentation", time: "1 days ago" },
	{ id: 7, avatar: "L", title: "Prepare for Presentation", time: "45 minutes ago" },
	{ id: 8, avatar: "U", title: "Prepare for Presentation", time: "2 days ago" }
];
const pane2 = [
	{ name: "Madeleine", message: "Hey! there I' am available....", time: "3 hours ago", image: "/assets/images/faces/12.jpg" },
	{ name: "Anthony", message: "New product Launching...", time: "5 hours ago", image: "/assets/images/faces/1.jpg" },
	{ name: "Olivia", message: "New Schedule Release......", time: "45 minutes ago", image: "/assets/images/faces/2.jpg" },
	{ name: "Madeleine", message: "Hey! there I' am available....", time: "3 hours ago", image: "/assets/images/faces/8.jpg" },
	{ name: "Anthony", message: "New product Launching...", time: "5 hours ago", image: "/assets/images/faces/11.jpg" },
	{ name: "Olivia", message: "New Schedule Release......", time: "45 minutes ago", image: "/assets/images/faces/6.jpg" },
	{ name: "Olivia", message: "Hey! there I' am available....", time: "12 minutes ago", image: "/assets/images/faces/9.jpg" }
];
const pane3 = [
	{ id: 1, name: "Mozelle Belt", imgSrc: "/assets/images/faces/9.jpg" },
	{ id: 2, name: "Florinda Carasco", imgSrc: "/assets/images/faces/11.jpg" },
	{ id: 3, name: "Alina Bernier", imgSrc: "/assets/images/faces/10.jpg" },
	{ id: 4, name: "Zula Mclaughin", imgSrc: "/assets/images/faces/2.jpg" },
	{ id: 5, name: "Isidro Heide", imgSrc: "/assets/images/faces/13.jpg" },
	{ id: 6, name: "Mozelle Belt", imgSrc: "/assets/images/faces/12.jpg" },
	{ id: 7, name: "Florinda Carasco", imgSrc: "/assets/images/faces/4.jpg" },
	{ id: 8, name: "Alina Bernier", imgSrc: "/assets/images/faces/7.jpg" },
	{ id: 9, name: "Zula Mclaughin", imgSrc: "/assets/images/faces/2.jpg" },
	{ id: 10, name: "Isidro Heide", imgSrc: "/assets/images/faces/14.jpg" },
	{ id: 11, name: "Alina Bernier", imgSrc: "/assets/images/faces/11.jpg" },
	{ id: 12, name: "Zula Mclaughin", imgSrc: "/assets/images/faces/5.jpg" },
	{ id: 13, name: "Isidro Heide", imgSrc: "/assets/images/faces/4.jpg" },
];

function Header({ theme, ThemeChanger }) {

	const { data: session, status } = useSession(); 
    
	// FullScreen
	const [fullScreen, setFullScreen] = useState(false);

	const toggleFullScreen = () => {
		const elem = document.documentElement;

		if (!document.fullscreenElement) {
			elem.requestFullscreen().then(() => setFullScreen(true));
		} else {
			document.exitFullscreen().then(() => setFullScreen(false));
		}
	};

	const handleFullscreenChange = () => {
		setFullScreen(!!document.fullscreenElement);
	};

	useEffect(() => {
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);
	
	const searchRef = useRef(null);

	const handleClick = (event) => {
		const searchInput = searchRef.current;

		if (searchInput && (searchInput === event.target || searchInput.contains(event.target))) {
			document.querySelector(".header-search").classList.add("searchdrop");
		} else {
			document.querySelector(".header-search").classList.remove("searchdrop");
		}
	};

	//// search Functionality
	const [showa, setShowa] = useState(false);
	const [InputValue, setInputValue] = useState("");
	const [show2, setShow2] = useState(false);
	const [searchcolor, setsearchcolor] = useState("text-dark");
	const [searchval, setsearchval] = useState("Type something");
	const [NavData, setNavData] = useState([]);

	const myfunction = (inputvalue) => {
		document.querySelector(".search-result")?.classList.remove("d-none");

		const i = [];
		const allElement2 = [];

		MENUITEMS.forEach((mainLevel) => {
			if (mainLevel.children) {
				setShowa(true);
				mainLevel.children.forEach((subLevel) => {
					i.push(subLevel);
					if (subLevel.children) {
						subLevel.children.forEach((subLevel1) => {
							i.push(subLevel1);
							if (subLevel1.children) {
								subLevel1.children.forEach((subLevel2) => {
									i.push(subLevel2);
								});
							}
						});
					}
				});
			}
		});

		for (const allElement of i) {
			if (allElement.title.toLowerCase().includes(inputvalue.toLowerCase())) {
				if (allElement.title.toLowerCase().startsWith(inputvalue.toLowerCase())) {
					setShow2(true);

					// Check if the element has a path and doesn't already exist in allElement2 before pushing
					if (allElement.path && !allElement2.some((el) => el.title === allElement.title)) {
						allElement2.push(allElement);
					}
				}
			}
		}

		if (!allElement2.length || inputvalue === "") {
			if (inputvalue === "") {
				setShow2(false);
				setsearchval("Type something");
				setsearchcolor("text-dark");
			}
			if (!allElement2.length) {
				setShow2(false);
				setsearchcolor("text-danger");
				setsearchval("There is no component with this name");
			}
		}
		setNavData(allElement2);

	};
	function menuClose() {		
		ThemeChanger({ ...theme, "toggled": "close" });
	}
	const swichermainright = () => {
		document.querySelector(".offcanvas-end")?.classList.toggle("show");
		if (document.querySelector(".switcher-backdrop")?.classList.contains("d-none")) {
			document.querySelector(".switcher-backdrop")?.classList.add("d-block");
			document.querySelector(".switcher-backdrop")?.classList.remove("d-none");
		}
	};
	const toggleSidebar = () => {	
		const sidemenuType = theme.dataNavLayout;
		if (window.innerWidth >= 992) {
			if (sidemenuType === "vertical") {
				const verticalStyle = theme.dataVerticalStyle;
				const navStyle = theme.dataNavStyle;
				switch (verticalStyle) {
				// closed
				case "closed":
					ThemeChanger({ ...theme, "dataNavStyle": "" });
					if (theme.toggled === "close-menu-close") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						ThemeChanger({ ...theme, "toggled": "close-menu-close" });
					}
					break;
					// icon-overlay
				case "overlay":
					ThemeChanger({ ...theme, "dataNavStyle": "" });
					if (theme.toggled === "icon-overlay-close") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						if (window.innerWidth >= 992) {
							ThemeChanger({ ...theme, "toggled": "icon-overlay-close" });
						}
					}
					break;
					// icon-text
				case "icontext":
					ThemeChanger({ ...theme, "dataNavStyle": "" });
					if (theme.toggled === "icon-text-close") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						ThemeChanger({ ...theme, "toggled": "icon-text-close" });
					}
					break;
					// doublemenu
				case "doublemenu":
					ThemeChanger({ ...theme, "dataNavStyle": "" });
					if (theme.toggled === "double-menu-open") {
						ThemeChanger({ ...theme, "toggled": "double-menu-close" });
					} else {
						const sidemenu = document.querySelector(".side-menu__item.active");
						if (sidemenu) {
							if (sidemenu.nextElementSibling) {
								sidemenu.nextElementSibling.classList.add("double-menu-active");
								ThemeChanger({ ...theme, "toggled": "double-menu-open" });
							} else {

								ThemeChanger({ ...theme, "toggled": "double-menu-close" });
							}
						}
					}

					break;
					// detached
				case "detached":
					if (theme.toggled === "detached-close") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						ThemeChanger({ ...theme, "toggled": "detached-close" });
					}
					break;
					// default
				case "default":
					ThemeChanger({ ...theme, "toggled": "" });
				}
				switch (navStyle) {
				case "menu-click":
					if (theme.toggled === "menu-click-closed") {
						ThemeChanger({ ...theme, "toggled": "" });
					}
					else {
						ThemeChanger({ ...theme, "toggled": "menu-click-closed" });
					}
					break;
					// icon-overlay
				case "menu-hover":
					if (theme.toggled === "menu-hover-closed") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						ThemeChanger({ ...theme, "toggled": "menu-hover-closed" });
					}
					break;
				case "icon-click":
					if (theme.toggled === "icon-click-closed") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						ThemeChanger({ ...theme, "toggled": "icon-click-closed" });
					}
					break;
				case "icon-hover":
					if (theme.toggled === "icon-hover-closed") {
						ThemeChanger({ ...theme, "toggled": "" });
					} else {
						ThemeChanger({ ...theme, "toggled": "icon-hover-closed" });
					}
					break;
				}
			}
		}
		else {
			if (theme.toggled === "close") {
				ThemeChanger({ ...theme, "toggled": "open" });
				setTimeout(() => {
					if (theme.toggled == "open") {
						const overlay = document.querySelector("#responsive-overlay");
						if (overlay) {
							overlay.classList.add("active");
							overlay.addEventListener("click", () => {
								const overlay = document.querySelector("#responsive-overlay");
								if (overlay) {
									overlay.classList.remove("active");
									menuClose();
								}
							});
						}
					}
					window.addEventListener("resize", () => {
						if (window.screen.width >= 992) {
							const overlay = document.querySelector("#responsive-overlay");
							if (overlay) {
								overlay.classList.remove("active");
							}
						}
					});
				}, 100);
			} else {
				ThemeChanger({ ...theme, "toggled": "close" });
			}
		}
	};

	const [cartItems, setCartItems] = useState([...cartProduct]);
	const [cartItemCount, setCartItemCount] = useState(cartProduct.length);

	const handleRemove = (itemId) => {
		const updatedCart = cartItems.filter((item) => item.id !== itemId);
		setCartItems(updatedCart);
		setCartItemCount(updatedCart.length);
	};

	const [notifications, setNotifications] = useState([...initialNotifications]);

	const handleNotificationClose = (index) => {
		// Create a copy of the notifications array and remove the item at the specified index
		const updatedNotifications = [...notifications];
		updatedNotifications.splice(index, 1);
		setNotifications(updatedNotifications);

	};
	const [show1, setShow1] = useState(false);

	const handleClose1 = () => setShow1(false);
	const handleShow1 = () => setShow1(true);	

	return (
		<Fragment>
			<header className="app-header">

				<div className="main-header-container container-fluid">

					<div className="header-content-left align-items-center">

						{/* Toggle icon sidebar */}
						<div className="header-element">
							<Link aria-label="Hide Sidebar" onClick={() => toggleSidebar()} className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle" data-bs-toggle="sidebar" href="#!"><span></span></Link>
						</div>

						{/* logo */}
						<div className="header-element">
							<div className="horizontal-logo">
								<Link className="header-logo active" href="/">							
									<img src={theme?.logoWhite} alt="desktop-logo" className="desktop-logo" />
									<img src={theme?.logoWhite} alt="desktop-white" className="desktop-white" />
									<img src={theme?.logoDark} alt="desktop-dark" className="desktop-dark" />
									<img src={theme?.logoWhite} alt="toggle-logo2" className="toggle-logo" />						 
									<img src={theme?.logoDark} alt="toggle-dark" className="toggle-dark" />						 
									<img src={theme?.logoDark} alt="toggle-white" className="toggle-white" />							
								</Link>
							</div>
						</div>

						{/* Search field */}
						<div className="main-header-center ms-4 d-sm-none d-md-none d-lg-block form-group">
							<Form.Control
								type="text"
								className=" "
								id="typehead"
								placeholder="Search for results..."
								onClick={() => { }}
								autoComplete="off"
								ref={searchRef}
								defaultValue={InputValue}
								onChange={(ele => { myfunction(ele.target.value); setInputValue(ele.target.value); })}
							/>
							<Button variant="" className="btn"><i className="fas fa-search"></i></Button>
							{showa ?
								<Card className=" search-result position-relative z-index-9 search-fix  border mt-1 ">
									<Card.Header className="">
										<Card.Title as="h6" className="">Search result of {InputValue}</Card.Title>
									</Card.Header>
									<ListGroup className='my-2 search_drop'>
										{show2 ?
											NavData.map((e) =>
												<ListGroup.Item key={Math.random()} className="">
													<Link href={`${e.path}/`} className='search-result-item' onClick={() => { setShow1(false), setInputValue(""); }}><i className="fe fe-chevron-right me-2 d-inline-block"></i>{e.title}</Link>
												</ListGroup.Item>
											)
											: <b className={`${searchcolor} list-group-item`}>{searchval}</b>}
									</ListGroup>
								</Card>
								: ""}
						</div>

					</div>
					
					<div className="header-content-right">
						{/* Search field in small screen */}
						<div className="header-element header-search d-block d-sm-none">
							<Dropdown className="header_searchbar" autoClose="outside" >
								<Dropdown.Toggle as="a" href="#!" className="header-link dropdown-toggle" data-bs-toggle="dropdown">
									<svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
								</Dropdown.Toggle>

								<Dropdown.Menu as="ul" className="main-header-dropdown dropdown-menu dropdown-menu-end" data-popper-placement="none">
									<li>
										<Dropdown.Item as="span" className=" d-flex align-items-center" >
											<span className="input-group">
												<input type="text" className="form-control" placeholder="Search..." aria-label="Search input" aria-describedby="button-addon2" />
												{/* <button className="btn btn-primary" type="button" id="button-addon2">Search</button>*/}

												<button className="btn btn-primary" type="button" id="button-addon2">Search</button>
											</span>
										</Dropdown.Item>
									</li>
								</Dropdown.Menu>
							</Dropdown>
						</div>

						{/* Shopping cart */}
						<Dropdown className="header-element cart-dropdown" autoClose="outside">
							<Dropdown.Toggle as="a" href='#!' role='button' className="header-link dropdown-toggle" data-bs-auto-close="outside" data-bs-toggle="dropdown">
								<svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" width="24" height="24" viewBox="0 0 24 24"><path d="M21.822 7.431A1 1 0 0 0 21 7H7.333L6.179 4.23A1.994 1.994 0 0 0 4.333 3H2v2h2.333l4.744 11.385A1 1 0 0 0 10 17h8c.417 0 .79-.259.937-.648l3-8a1 1 0 0 0-.115-.921zM17.307 15h-6.64l-2.5-6h11.39l-2.25 6z" /><circle cx="10.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /></svg>
								<span className="badge bg-warning rounded-pill header-icon-badge" id="cart-icon-badge">{cartItemCount}</span>
							</Dropdown.Toggle>

							<Dropdown.Menu as="ul" className="main-header-dropdown dropdown-menu dropdown-menu-end" data-popper-placement="none" placement="bottom-start"> 
								<div className="p-3">
									<div className="d-flex align-items-center justify-content-between">
										<p className="mb-0 fs-15 fw-semibold">Shopping Cart</p>
										<span className="badge bg-indigo" id="cart-data">Items {cartItemCount} {cartItemCount !== 1 ? "" : ""}</span>
									</div>
								</div>
								<div><hr className="dropdown-divider" /></div>
								<ul className="list-unstyled mb-0" id="header-cart-items-scroll">
									{cartItems.map((idx) => (
										<Dropdown.Item as="li" key={Math.random()}>
											<div className="d-flex align-items-start cart-dropdown-item">
												<span className="avatar avatar-rounded br-5 me-3">
													<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}${idx.src}`} alt="" />
												</span>
												<div className="flex-grow-1">
													<div className="d-flex align-items-center justify-content-between mb-0">
														<div className="mb-0">
															<Link className="text-muted fs-13" href="#!">{idx.name}</Link>
															<div className="fw-semibold text-dark fs-12">{idx.quantity}</div>
														</div>
														<div>
															<Link href="#!" className="header-cart-remove float-end dropdown-item-close me-2" onClick={() => handleRemove(idx.id)}><i className="fe fe-trash-2 text-danger"></i></Link>
														</div>
													</div>
												</div>
											</div>
										</Dropdown.Item>
									))}
								</ul>
								<div className={`p-2 bg-primary-transparent d-flex justify-content-between align-items-center empty-header-item border-top ${cartItemCount === 0 ? "d-none" : "d-block"}`}>

									<div className="">
										<Link href="#!" className="btn btn-sm btn-primary btn-w-xs">checkout</Link>
									</div>
									<div>
										<span className="text-dark fw-semibold">Sub Total : $ 485.93</span>
									</div>
								</div>
								<div className={`p-5 empty-item  ${cartItemCount === 0 ? "d-block" : "d-none"}`}>
									<div className="text-center">
										<span className="avatar avatar-xl avatar-rounded bg-warning-transparent">
											<i className="ri-shopping-cart-2-line fs-2"></i>
										</span>
										<h6 className="fw-bold mb-1 mt-3">Your Cart is Empty</h6>
										<span className="mb-3 fw-normal fs-13 d-block">Add some items to make me happy :)</span>
										<Link href="#!" className="btn btn-primary btn-wave btn-sm m-1" data-abc="true">continue shopping <i className="bi bi-arrow-right ms-1"></i></Link>
									</div>
								</div>

							</Dropdown.Menu>
						</Dropdown>

						{/* notifiation */}
						<Dropdown className="header-element notifications-dropdown" autoClose="outside">
							<Dropdown.Toggle as="a" href='#!' role='button' className="header-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" id="messageDropdown" aria-expanded="false">
								<svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" /></svg>
								<span className="badge bg-secondary rounded-pill header-icon-badge pulse pulse-secondary" id="notification-icon-badge">{notifications.length}</span>
							</Dropdown.Toggle>
							<Dropdown.Menu className="main-header-dropdown dropdown-menu dropdown-menu-start" data-popper-placement="none">
								<div className="p-3">
									<div className="d-flex align-items-center justify-content-between">
										<p className="mb-0 fs-17 fw-semibold">Notifications</p>
										<span className="badge bg-secondary-transparent" id="notifiation-data">{`${notifications.length} Unread`}</span>
									</div>
								</div>
								<div className="dropdown-divider"></div>
								<ul className="list-unstyled mb-0" id="header-notification-scroll">
									<SimpleBar id="header-notification-scroll">
										{notifications.map((notification, index) => (
											<Dropdown.Item as="li" key={index} className="p-3">

												<div className="d-flex align-items-start">
													<div className="pe-3">
														<span className={`avatar bg-${notification.avatarcolor} rounded-3`}><i className={notification.icon}></i></span>
													</div>
													<div className="flex-grow-1 d-flex align-items-center justify-content-between">
														<div>
															<p className="mb-0 fw-semibold"><Link href="#!" >{notification.name}</Link></p>
															<span className="text-muted fw-normal fs-12 header-notification-text">{notification.time}</span>
														</div>
														<div>
															<Link href="#!" className="min-w-fit-content text-muted me-1 dropdown-item-close1" onClick={() => handleNotificationClose(index)}><i className="ti ti-x fs-16"></i></Link>
														</div>
													</div>
												</div>
											</Dropdown.Item>
										))}
									</SimpleBar>

								</ul>
								<div className={`p-2 empty-header-item1 border-top ${notifications.length === 0 ? "d-none" : "d-block"}`}>
									<div className="d-grid">
										<Link href="#!" className="btn btn-primary btn-sm">View All</Link>
									</div>
								</div>
								<div className={`p-5 empty-item1 ${notifications.length === 0 ? "d-block" : "d-none"}`}>
									<div className="text-center">
										<span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
											<i className="ri-notification-off-line fs-2"></i>
										</span>
										<h6 className="fw-semibold mt-3">No New Notifications</h6>
									</div>
								</div>
							</Dropdown.Menu>
						</Dropdown>

						{/* related apps */}
						<Dropdown className="header-element header-shortcuts-dropdown d-md-block d-none">
							<Dropdown.Toggle variant='' href="#!" className="header-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" id="notificationDropdown" aria-expanded="false">
								<svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" /></svg>
							</Dropdown.Toggle>
							<Dropdown.Menu as="ul" className="main-header-dropdown header-shortcuts-dropdown dropdown-menu pb-0 dropdown-menu-end" aria-labelledby="notificationDropdown">
								<div className="p-3">
									<div className="d-flex align-items-center justify-content-between">
										<p className="mb-0 fs-17 fw-semibold">Related Apps</p>
									</div>
								</div>
								<div className="dropdown-divider mb-0"></div>
								<div className="main-header-shortcuts p-2" id="header-shortcut-scroll">
									<div className="row g-2">
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/figma.png`} alt="" />
													</span>
													<span className="d-block fs-12">Figma</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/microsoft-powerpoint.png`} alt="" />
													</span>
													<span className="d-block fs-12">Power Point</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/microsoft-word.png`} alt="" />
													</span>
													<span className="d-block fs-12">MS Word</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/calender.png`} alt="" />
													</span>
													<span className="d-block fs-12">Calendar</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/sketch.png`} alt="" />
													</span>
													<span className="d-block fs-12">Sketch</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/google-docs.png`} alt="" />
													</span>
													<span className="d-block fs-12">Docs</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/google.png`} alt="" />
													</span>
													<span className="d-block fs-12">Google</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/translate.png`} alt="" />
													</span>
													<span className="d-block fs-12">Translate</span>
												</div>
											</Link>
										</div>
										<div className="col-4">
											<Link href="#!">
												<div className="text-center p-3 related-app">
													<span className="avatar avatar-sm avatar-rounded">
														<img src={`${process.env.NODE_ENV === "production" ? basePath : ""}/assets/images/apps/google-sheets.png`} alt="" />
													</span>
													<span className="d-block fs-12">Sheets</span>
												</div>
											</Link>
										</div>
									</div>
								</div>
								<div className="p-3 border-top">
									<div className="d-grid">
										<Link href="#!" className="btn btn-primary">View All</Link>
									</div>
								</div>
							</Dropdown.Menu>
						</Dropdown>

						{/* Fullscreen icon */}
						<div className="header-element header-fullscreen">

							<Link onClick={toggleFullScreen} href="#!" className="header-link">
								{fullScreen ? (
									<i className="bx bx-exit-fullscreen full-screen-close header-link-icon"></i>
								) : (

									<i className="bx bx-fullscreen full-screen-open header-link-icon"></i>
								)}
							</Link>

						</div>

						{/* Right sidebar */}
						<div className="header-element d-md-block d-none" onClick={handleShow1}>
							<Link href="#!" className="header-link" data-bs-toggle="offcanvas" data-bs-target="#sidebar-canvas">
								<svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" width="24" height="24" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm4 5h12v2H8zm5 5h7v2h-7z" /></svg>
							</Link>
						</div>

						{/* Profile */}
						<Dropdown className="header-element">
							<Dropdown.Toggle variant='' href="#!" className="header-link dropdown-toggle" id="mainHeaderProfile" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
							<div className="d-flex align-items-center">
								<div className="me-sm-2 me-0">
									<img
									src={session?.user?.image}
									alt="img"
									width="32"
									height="32"
									className="rounded-circle"
									/>
								</div>
								<div className="d-xl-block d-none" style={{ textAlign: 'left' }}>
									<p className="fw-semibold mb-0 lh-1">{session?.user?.name}</p>
									<span className="op-7 fw-normal d-block fs-11">{session?.user?.organization?.registeredName}</span>
								</div>
							</div>
							</Dropdown.Toggle>
							<Dropdown.Menu as="ul" className="main-header-dropdown dropdown-menu pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end" aria-labelledby="mainHeaderProfile">
								<li><Link className="dropdown-item d-flex border-bottom" href="#!"><i className="far fa-user-circle fs-16 me-2 op-7"></i>Profile</Link></li>
								<li><Link className="dropdown-item d-flex border-bottom" href="#!"><i className="far fa-smile fs-16 me-2 op-7"></i>Chat</Link></li>
								<li><Link className="dropdown-item d-flex border-bottom" href="#!"><i className="far fa-envelope  fs-16 me-2 op-7"></i>Inbox <span className="badge bg-success-transparent ms-auto">25</span></Link></li>
								<li><Link className="dropdown-item d-flex border-bottom border-block-end" href="#!"><i className="far fa-comment-dots fs-16 me-2 op-7"></i>Messages</Link></li>
								<li><Link className="dropdown-item d-flex border-bottom" href="#!"><i className="far fa-sun fs-16 me-2 op-7"></i>Settings</Link></li>
								<li><Link className="dropdown-item d-flex" href="#"  onClick={() => signOut({ redirect: false })}><i className="far fa-arrow-alt-circle-left fs-16 me-2 op-7"></i>Sign Out</Link></li>
							</Dropdown.Menu>
						</Dropdown>

						{/* Switcher */}
						<div className="header-element">
							<Link onClick={() => swichermainright()} href="#!" className="header-link switcher-icon" data-bs-toggle="offcanvas" data-bs-target="#switcher-canvas">
								<svg xmlns="http://www.w3.org/2000/svg" className="header-link-icon" width="24" height="24" viewBox="0 0 24 24"><path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z" /><path d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z" /></svg>
							</Link>
						</div>
					</div>

				</div>
			</header>
			<Offcanvas placement='end' show={show1} onHide={handleClose1} className="sidebar offcanvas offcanvas-end" tabIndex={-1} id="sidebar-right">
				<Tab.Container defaultActiveKey="first">
					<Offcanvas.Header closeButton className="offcanvas-header border-bottom bg-light">
						<h6 className="offcanvas-title text-default" id="offcanvasRightLabel22">NOTIFICATIONS</h6>

					</Offcanvas.Header>
					<Offcanvas.Body className="offcanvas-body p-0">
						<div className="panel-body tabs-menu-body p-0 border-0">

							<div className="tabs-menu p-3">
								<Nav variant="tabs" className="panel-tabs" defaultActiveKey="first">
									<Nav.Item>
										<Nav.Link eventKey="first"><svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" /></svg>Chat</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="second"><svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" className="side-menu__icon" height="24" viewBox="0 0 24 24" width="24"><g><path d="M0,0h24v24H0V0z" fill="none" /></g><g><path d="M12,18.5c0.83,0,1.5-0.67,1.5-1.5h-3C10.5,17.83,11.17,18.5,12,18.5z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10 c5.52,0,10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8c4.41,0,8,3.59,8,8S16.41,20,12,20z M16,11.39 c0-2.11-1.03-3.92-3-4.39V6.5c0-0.57-0.43-1-1-1s-1,0.43-1,1V7c-1.97,0.47-3,2.27-3,4.39V14H7v2h10v-2h-1V11.39z M14,14h-4v-3 c0-1.1,0.9-2,2-2s2,0.9,2,2V14z" /></g></svg>Notifications</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link eventKey="third"><svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" height="24" version="1.1" width="24" viewBox="0 0 24 24"><path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11C11.17,11 10.5,10.33 10.5,9.5C10.5,8.67 11.17,8 12,8C12.83,8 13.5,8.67 13.5,9.5C13.5,10.33 12.83,11 12,11Z" /></svg> Friends</Nav.Link>
									</Nav.Item>

								</Nav>
							</div>

							<Tab.Content>
								<Tab.Pane className='p-0 border-0' eventKey="first">
									{pane1.map((item, index) => (
										<div key={index} className={`list d-flex align-items-center border-bottom ${item} p-3`}>
											<div className="">
												<span className={`avatar bg-${item.id == 1 ? "primary" :
													item.id == 2 ? "danger" :
														item.id == 3 ? "info" :
															item.id == 4 ? "warning" :
																item.id == 5 ? "success" :
																	item.id == 6 ? "pink" :
																		item.id == 7 ? "purple" : "secondary"} rounded-circle avatar-md`}>
													{item.avatar} </span>
											</div>
											<Link className="wrapper w-100 ms-3" href="#!">
												<p className="mb-0 d-flex">
													<b>{item.title}</b>
												</p>
												<div className="d-flex justify-content-between align-items-center">
													<div className="d-flex align-items-center">
														<i className="mdi mdi-clock text-muted me-1 fs-11"></i>
														<small className="text-muted ms-auto">{item.time}</small>
														<p className="mb-0"></p>
													</div>
												</div>
											</Link>
										</div>
									))}
								</Tab.Pane>
								<Tab.Pane className='p-0 border-0' eventKey="second">
									<ListGroup variant="flush">
										{pane2.map((message, index) => (
											<ListGroup.Item key={index} className="d-flex align-items-center border-0">
												<div className="me-3">
													<img className="avatar avatar-md rounded-circle cover-image" src={`${process.env.NODE_ENV === "production" ? basePath : ""}${message.image}`} alt="img" />
												</div>
												<div>
													<strong>{message.name}</strong> {message.message}
													<div className="small text-muted">
														{message.time}
													</div>
												</div>
											</ListGroup.Item>
										))}
									</ListGroup>
								</Tab.Pane>
								<Tab.Pane className='p-0 border-0' eventKey="third">
									<ListGroup variant="flush">
										{pane3.map(item => (
											<ListGroup.Item className="d-flex align-items-center border-0" key={item.id}>
												<div className="me-2">
													<img className="avatar avatar-md rounded-circle cover-image" src={`${process.env.NODE_ENV === "production" ? basePath : ""}${item.imgSrc}`} alt="img" />
												</div>
												<div>
													<div className="fw-semibold">{item.name}</div>
												</div>
												<div className="ms-auto">
													<Link href="#!" className="btn btn-sm btn-outline-light btn-rounded">
														<i className="fe fe-message-square fs-16"></i>
													</Link>
												</div>
											</ListGroup.Item>
										))}
									</ListGroup>
								</Tab.Pane>
							</Tab.Content>
						</div>
					</Offcanvas.Body>
				</Tab.Container>
			</Offcanvas>
		</Fragment>
	);
}

const mapStateToProps = (state) => ({ 
	theme: state.theme
});

export default connect(mapStateToProps, { ThemeChanger })( Header );
