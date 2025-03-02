// Clinic.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
	const navigate = useNavigate();
	const [selectedData, setSelectedData] = useState([]);
	const [clinicData, setClinicData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
			const fetchClinicData = async () => {
					try {
							const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}`);
							if (response.status === 404) {
									// Clinic not found, redirect to home page
									navigate('/', { replace: true });
									return;
							}
							if (!response.ok) throw new Error('Failed to fetch clinic data');
							
							const data = await response.json();
							setClinicData(data);
					} catch (err) {
							console.error('Error fetching clinic data:', err);
							setError(err.message);
					} finally {
							setLoading(false);
					}
			};

			if (clinicId) {
					fetchClinicData();
			} else {
					navigate('/', { replace: true });
			}
	}, [clinicId, navigate]);

	if (loading) {
			return (
					<Layout>
							<section className="py-10">
									<div className="container">
											<div>Loading clinic information...</div>
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
											<div>Error loading clinic: {error}</div>
									</div>
							</section>
					</Layout>
			);
	}

	if (!clinicData) {
			return (
					<Layout>
							<section className="py-10">
									<div className="container">
											<div>No clinic data found</div>
									</div>
							</section>
					</Layout>
			);
	}

    return (
        <Layout>
            <section className="py-10">
                <div className="container">
										<div className="mb-6">
											<Link 
												to="/procedures" 
												className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
											>
												<svg 
													xmlns="http://www.w3.org/2000/svg" 
													width="20" 
													height="20" 
													viewBox="0 0 24 24" 
													fill="none" 
													stroke="currentColor" 
													strokeWidth="2" 
													strokeLinecap="round" 
													strokeLinejoin="round"
												>
													<path d="m15 18-6-6 6-6"/>
												</svg>
												Back to Search
											</Link>
										</div>
                    <div className="flex flex-wrap gap-10">
                        <div className="w-full lg:w-1/2 flex-grow">
                            <div className="flex flex-col gap-6">
                                <ClinicBanner clinicId={clinicId} clinicData={clinicData} />
                                <Gallery />
                                <ClinicProcedures
                                    clinicId={clinicId}
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
                            <ClinicRightSidebar selectedData={selectedData} />
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Clinic;
