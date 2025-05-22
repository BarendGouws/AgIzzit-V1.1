import Link from "next/link";
import React, { Fragment } from "react";

const Footer = () => {
	return (
		<Fragment>
			<footer className="footer mt-auto py-3 bg-white text-center">
				<div className="container">
					<span className="text-muted"> Copyright © <span id="year" className="me-2">2024</span> 
					<Link href="/" className="text-primary">
						AgIzzit.co.za
					</Link>
					</span>
				</div>
			</footer>
		</Fragment>
	);
};

export default Footer;
