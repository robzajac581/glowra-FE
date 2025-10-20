import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { procedure } from "../../components/Icons";
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
import WorkingHours from "./components/WorkingHours";
import { useClinicData } from "../../hooks/useClinicData";
// import SpecialOffers from "./components/SpecialOffers";

const API_BASE_URL = 'http://localhost:3001';

const Clinic = () => {
	const { id: clinicId } = useParams();
	const [selectedData, setSelectedData] = useState([]);
	const [clinicInfo, setClinicInfo] = useState(null);
	const [providers, setProviders] = useState([]);
	const [requiresConsultRequest, setRequiresConsultRequest] = useState(false);
	const [consultMessage, setConsultMessage] = useState(null);
	const [procedures, setProcedures] = useState({});
	const [photos, setPhotos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Parse Google Places data efficiently with memoization
	const { 
		workingHours, 
		isOpenNow, 
		closingTime,
		logo 
	} = useClinicData(clinicInfo);

	// Fetch clinic data on component mount
	useEffect(() => {
		const fetchClinicData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Fetch clinic info, providers, procedures, and photos in parallel
				const [clinicResponse, providersResponse, proceduresResponse, photosResponse] = await Promise.all([
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}`),
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}/providers`),
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}/procedures`),
					fetch(`${API_BASE_URL}/api/clinics/${clinicId}/photos`)
				]);

				// Check for response errors
				if (!clinicResponse.ok || !providersResponse.ok || !proceduresResponse.ok) {
					throw new Error('Failed to fetch clinic data');
				}

				// Parse JSON responses
				const clinicData = await clinicResponse.json();
				const providersData = await providersResponse.json();
				const proceduresData = await proceduresResponse.json();
				
				// Parse photos response (don't fail if photos endpoint has issues)
				let photosData = { photos: [] };
				if (photosResponse.ok) {
					photosData = await photosResponse.json();
				}

				// Update state with fetched data
				setClinicInfo(clinicData);
				// Handle new provider API response structure
				setProviders(providersData.providers || []);
				setRequiresConsultRequest(providersData.requiresConsultRequest || false);
				setConsultMessage(providersData.message || null);
				setProcedures(proceduresData);
				setPhotos(photosData.photos || []);
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
								requiresConsultRequest={requiresConsultRequest}
								consultMessage={consultMessage}
								logo={logo}
								isOpenNow={isOpenNow}
								closingTime={closingTime}
							/>
							<Gallery 
								photos={photos}
								clinicName={clinicInfo?.ClinicName}
							/>
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
								<About 
									description={clinicInfo?.Description}
									clinicName={clinicInfo?.ClinicName}
								/>
							<WorkingHours 
								workingHours={workingHours}
								isOpenNow={isOpenNow}
							/>
							<ReviewsForCosmetics 
								reviews={clinicInfo?.GoogleReviewsJSON}
								clinicName={clinicInfo?.ClinicName}
								totalReviewCount={clinicInfo?.GoogleReviewCount}
							/>
							<Location clinicInfo={clinicInfo} />
								<InstagramPosts />
								<AboutProviders /> 
								{/* TODO: Add providers data or remove this */}
								<Faqs />
								{/* Visit Website Button */}
								{clinicInfo?.Website && (
									<div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
										<a 
											href={clinicInfo.Website.startsWith('http') ? clinicInfo.Website : `https://${clinicInfo.Website}`} 
											target="_blank" 
											rel="noopener noreferrer"
											className="btn"
										>
											Visit Clinic Website {procedure.arrowLink}
										</a>
									</div>
								)}
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