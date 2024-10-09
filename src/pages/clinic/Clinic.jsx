import React, { useState } from "react";
import Layout from "../../components/Layout";
import About from "./components/About";
import AboutProviders from "./components/AboutProviders";
import ClinicBanner from "./components/ClinicBanner";
import ClinicProcedures from "./components/ClinicProcedures";
import ClinicRightSidebar from "./components/ClinicRightSidebar";
import Faqs from "./components/Faqs";
import Gallery from "./components/Gallery";
import Highlights from "./components/Highlights";
import InstagramPosts from "./components/InstagramPosts";
import Location from "./components/Location";
import PaymentAccepted from "./components/PaymentAccepted";
import ReviewsForCosmetics from "./components/ReviewsForCosmetics";
import SpecialOffers from "./components/SpecialOffers";

const Clinic = () => {
	const [selectedData, setSelectedData] = useState([]);
	return (
		<Layout>
			<section className="py-10">
				<div className="container">
					<div className="flex flex-wrap gap-10">
						<div className="w-full lg:w-1/2 flex-grow">
							<div className="flex flex-col gap-6">
								<ClinicBanner />
								<Gallery />
								<ClinicProcedures
									selectedData={selectedData}
									setSelectedData={setSelectedData}
								/>
								<SpecialOffers
									selectedData={selectedData}
									setSelectedData={setSelectedData}
								/>
								<Highlights />
								<ReviewsForCosmetics />
								<Location />
								<InstagramPosts />
								<About />
								<AboutProviders />
								<PaymentAccepted />
								<Faqs />
							</div>
						</div>
						<div className="w-full lg:w-1/4 flex-grow xl:max-w-[400px]">
							<ClinicRightSidebar selectedData={selectedData} />
						</div>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export default Clinic;
