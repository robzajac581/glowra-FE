import React from "react";
import Layout from "../../components/Layout";
import Banner from "./components/Banner";
import Hero from "./components/Hero";
import Mission from "./components/Mission";
import FAQ from "./components/FAQ";
import CTASection from "./components/CTASection";

const AboutUs = () => {
	return (
		<Layout headerFixed={false}>
			<Banner />
			<Hero />
			<Mission />
			<FAQ />
			<CTASection />
		</Layout>
	);
};

export default AboutUs;

