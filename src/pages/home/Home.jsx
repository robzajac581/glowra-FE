import React from "react";
import Layout from "../../components/Layout";
import Banner from "./components/Banner";
import Cta from "./components/Cta";
import FindCosmetics from "./components/FindCosmetics";
import LocalDoctors from "./components/LocalDoctors";

const Home = () => {
	return (
		<Layout headerFixed={true}>
			<Banner />
			<LocalDoctors />
			<FindCosmetics />
			<Cta />
		</Layout>
	);
};

export default Home;
