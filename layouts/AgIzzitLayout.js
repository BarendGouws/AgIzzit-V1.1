import React, { Fragment, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { useSession } from 'next-auth/react'
import { ToastContainer } from 'react-toastify';
import TabToTop from "@/components/layout/TabToTop";
import Header from "@/components/layout/agizzit/Header";
import Footer from "@/components/layout/agizzit/Footer";
import Sidebar from "@/components/layout/agizzit/Sidebar";
import Switcher from "@/components/layout/agizzit/Switcher";
import dynamic from 'next/dynamic';
import store from "@/redux/agizzit/store";
import 'react-toastify/dist/ReactToastify.css';
const Auth = dynamic(() => import("@/components/layout/Auth"), { ssr: false });

//NOTE: MAKE SURE TOAST IS UNDER CHILDREN FOR IT TO WORK
const AgIzzitLayout = ({ children }) => { //CHECK MANAGE LAYOUT CONFIGURATION AND MAKE SURE IT MATCHES THIS LAYOUT CONFIGURATION

	const { data: session, status } = useSession();

	const [lateLoad, setlateLoad] = useState(false);

	const daya = store.getState();

	useEffect(() => { setlateLoad(true) });
	
	const remove = () => {

		if (document.querySelector(".card.search-result") != null) {
			document.querySelector(".card.search-result")?.classList.add("d-none");
		}

	};

	return (
		<Fragment>			
			<Provider store={store}>
				<div style={{ display: `${lateLoad ? "block" : "none"}` }}>
					<Switcher />
					<div className="page">
						<Auth />
						<Header />
						<Sidebar />
						<div className="main-content app-content">
							<div className="container-fluid layout" onClick={() => remove()}>
								{children}
								<ToastContainer />
							</div>
						</div>
						<Footer />
					</div>
					<TabToTop />
				</div>
			</Provider>
		</Fragment>
	);
	
};

export default AgIzzitLayout;