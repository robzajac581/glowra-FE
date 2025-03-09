import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import ReviewsForCosmetics from "./components/ReviewsForCosmetics";
import SpecialOffers from "./components/SpecialOffers";

const API_BASE_URL = 'http://localhost:3001';

const Clinic = () => {
	const { id: clinicId } = useParams();
	const [selectedData, setSelectedData] = useState([]);
	const [clinicInfo, setClinicInfo] = useState(null);
	const [providers, setProviders] = useState([]);
	const [procedures, setProcedures] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch clinic data on component mount
	useEffect(() => {
		const fetchClinicData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Fetch clinic info, providers, and procedures in parallel
				const [clinicResponse, providersResponse, proceduresResponse] = await Promise.all([
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}`),
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}/providers`),
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}/procedures`)
				]);

				// Check for response errors
				if (!clinicResponse.ok || !providersResponse.ok || !proceduresResponse.ok) {
					throw new Error('Failed to fetch clinic data');
				}

				// Parse JSON responses
				const clinicData = await clinicResponse.json();
				const providersData = await providersResponse.json();
				const proceduresData = await proceduresResponse.json();

				// Update state with fetched data
				setClinicInfo(clinicData);
				setProviders(providersData);
				setProcedures(proceduresData);
			} catch (err) {
				console.error('Error fetching clinic data:', err);
				setError('Failed to load clinic data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		if (clinicId) {
			fetchClinicData();
		}
	}, [clinicId]);

	if (loading) {
		return (
			<Layout>
				<section className="py-10">
					<div className="container text-center">
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
						</div>
					</div>
				</section>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<section className="py-10">
					<div className="container">
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
							<strong className="font-bold">Error: </strong>
							<span className="block sm:inline">{error}</span>
						</div>
					</div>
				</section>
			</Layout>
		);
	}

	return (
		<Layout>
			<section className="py-10">
				<div className="container">
					<div className="flex flex-wrap gap-10">
						<div className="w-full lg:w-1/2 flex-grow">
							<div className="flex flex-col gap-6">
								<ClinicBanner 
									clinicInfo={clinicInfo} 
									providers={providers} 
								/>
								<Gallery />
								<ClinicProcedures
									procedures={procedures}
									selectedData={selectedData}
									setSelectedData={setSelectedData}
								/>
								{/* Removed temporarily: GLOW-22 */}
								{/* <SpecialOffers
									selectedData={selectedData}
									setSelectedData={setSelectedData}
								/> */}
								<Highlights />
								<ReviewsForCosmetics />
								<Location />
								<InstagramPosts />
								<About />
								<AboutProviders />
								<Faqs />
							</div>
						</div>
						<div className="w-full lg:w-1/4 flex-grow xl:max-w-[400px]">
							<ClinicRightSidebar 
								selectedData={selectedData} 
								clinicInfo={clinicInfo}
							/>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	);
};

export default Clinic;