import React from "react";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ headerFixed, children }) => {
	return (
		<>
			<Header fixed={headerFixed} />
			{children}
			<Footer />
		</>
	);
};

export default Layout;
