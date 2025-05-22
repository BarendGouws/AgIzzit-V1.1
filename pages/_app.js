import "../styles/globals.scss";
import "../public/fonts/font.css";
import { SessionProvider } from 'next-auth/react';
import ErrorBoundary from './_error';
import AgIzzitLayout from "@/layouts/AgIzzitLayout"
import ManageLayout from "@/layouts/ManageLayout";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const layouts = {
	AgIzzitLayout: AgIzzitLayout,
	ManageLayout: ManageLayout
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) { 

	//IMPORTANT: IMPLIMENT AUTH FIRST

	//const Layout = pageProps.isLoggedIn ? layouts[Component.layout] || ((pageProps) => <Component>{pageProps}</Component>) : AgIzzitLayout

	const Layout = layouts[Component.layout] || ((pageProps) => <Component>{pageProps}</Component>);

	return (
		<ErrorBoundary>
		  <SessionProvider session={session}>
			<Layout>
				<Component {...pageProps} />		
			</Layout>
		   </SessionProvider>
		</ErrorBoundary>
	);
}

export default MyApp;