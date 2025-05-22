import React, { Fragment, useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useSession } from 'next-auth/react'
import { ToastContainer } from 'react-toastify';
import TabToTop from "@/components/layout/TabToTop";
import Header from "@/components/layout/manage/Header";
import Footer from "@/components/layout/manage/Footer";
import Sidebar from "@/components/layout/manage/Sidebar";
import Switcher from "@/components/layout/manage/Switcher";
import StateLoader from "@/components/layout/manage/StateLoader";
import dynamic from 'next/dynamic';
import store from "@/redux/manage/store";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "@/components/layout/universal/Loader";
const Auth = dynamic(() => import("@/components/layout/manage/Auth"), { ssr: false });
const AuthReset = dynamic(() => import("@/components/layout/manage/AuthReset"), { ssr: false });
import { useRouter } from 'next/router';

//NOTE: MAKE SURE TOAST IS UNDER CHILDREN FOR IT TO WORK
const ManageLayout = ({ children }) => { 	

	const { status, data: session } = useSession(); 

	const router = useRouter();

	const [lateLoad, setlateLoad] = useState(false);	

	useEffect(() => { setlateLoad(true) });		

	const remove = () => {

		if (document.querySelector(".card.search-result") != null) {
			document.querySelector(".card.search-result")?.classList.add("d-none");
		}

	};

	if (router.pathname === '/manage/forgot-password' || 
		router.pathname === '/manage/reset-password' || 
		router.pathname === '/manage/verify-vat') {
		return (
		  <Fragment>
			<Provider store={store}>
			  <Switcher />
			  {children}
			</Provider>
		  </Fragment>
		);
    }

	if(status === 'loading'){ 

		return (
			<Fragment>			
				<Provider store={store}>
					 <Loader/> 
				</Provider>
	    	</Fragment>)

	}else if(status === 'unauthenticated'){	  
		
	  return (
		<Fragment>			
			<Provider store={store}>
				<Switcher/>
				<Auth/>	
			</Provider>
		</Fragment>)

	}else if(status === 'authenticated' && session?.user?.isTempPassword){
		
		return (
		  <Fragment>			
			  <Provider store={store}>
				  <Switcher/>
				  <AuthReset session={session}/>	
			  </Provider>
		  </Fragment>)
  
	}else return (
		<Fragment>			
			<Provider store={store}>
				{/* fire universal state loading */}
				<StateLoader status={status}/>
				<div style={{ display: `${lateLoad ? "block" : "none"}` }}>
					<Switcher />				
					<div className="page">						
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

export default ManageLayout;