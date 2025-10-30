import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { icons } from "../../../components/Icons";
import SearchResultCard from "../../search/components/SearchResultCard";
import API_BASE_URL from "../../../config/api";

// Default location: Chicago, IL
const DEFAULT_LOCATION = {
	lat: 41.8781,
	lng: -87.6298,
	city: "Chicago",
	state: "IL"
};

const FindCosmetics = () => {
	const [clinics, setClinics] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [userLocation, setUserLocation] = useState(null);
	const [locationLoading, setLocationLoading] = useState(true);

	// Get user's location
	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					});
					setLocationLoading(false);
				},
				(error) => {
					console.log("Location access denied or unavailable, using default (Chicago):", error.message);
					// Fallback to Chicago
					setUserLocation(DEFAULT_LOCATION);
					setLocationLoading(false);
				},
				{
					enableHighAccuracy: false,
					timeout: 5000,
					maximumAge: 300000 // Cache for 5 minutes
				}
			);
		} else {
			console.log("Geolocation not supported, using default location (Chicago)");
			setUserLocation(DEFAULT_LOCATION);
			setLocationLoading(false);
		}
	}, []);

	// Fetch clinics based on location once we have it
	useEffect(() => {
		if (!userLocation || locationLoading) return;

		const fetchClinics = async () => {
			try {
				setLoading(true);
				setError(null);

				// Helper function to check if a clinic is open
				const isClinicOpen = (clinic) => {
					if (clinic.businessStatus && clinic.businessStatus !== 'OPERATIONAL') {
						return false;
					}
					if (clinic.clinicName && clinic.clinicName.toLowerCase().includes('(closed)')) {
						return false;
					}
					return true;
				};

				// Helper function to calculate distance between two points
				const calculateDistance = (lat1, lng1, lat2, lng2) => {
					const R = 3959; // Earth's radius in miles
					const dLat = (lat2 - lat1) * Math.PI / 180;
					const dLng = (lng2 - lng1) * Math.PI / 180;
					const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
						Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
						Math.sin(dLng / 2) * Math.sin(dLng / 2);
					const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
					return R * c;
				};

				// Fetch all clinics from search-index (includes procedures)
				const allClinicsUrl = `${API_BASE_URL}/api/clinics/search-index`;
				const allClinicsResponse = await fetch(allClinicsUrl);

				if (!allClinicsResponse.ok) {
					throw new Error('Failed to fetch clinics');
				}

				const allClinicsData = await allClinicsResponse.json();
				
				// Filter out closed clinics
				let openClinics = allClinicsData.clinics.filter(isClinicOpen);

				// Calculate distance for each clinic and sort by distance
				openClinics = openClinics.map(clinic => ({
					...clinic,
					distance: calculateDistance(
						userLocation.lat,
						userLocation.lng,
						clinic.latitude || 0,
						clinic.longitude || 0
					)
				})).sort((a, b) => a.distance - b.distance);

				// Take first 6 clinics
				setClinics(openClinics.slice(0, 6));
			} catch (err) {
				console.error('Error fetching clinics:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchClinics();
	}, [userLocation, locationLoading]);

	return (
		<section className="find-cosmetic">
			<div className="container">
				{/* Header with title and See All button side by side */}
				<div className="flex justify-between items-center mb-[19px] md:mb-5">
					<h2 className="find-cosmetic-title mb-0">
						Find Your Cosmetic Procedure
					</h2>
					<Link to="/search" className="find-cosmetic-btn">
						<span className="hidden md:block">See All</span>{" "}
						{icons.rightArrow}
					</Link>
				</div>
				
				{/* Clinic cards grid */}
				<div className="products-grid mt-[34px] md:mt-[63px]">
					{loading || locationLoading ? (
						// Show skeleton loaders when loading
						Array(6).fill(0).map((_, idx) => (
							<div key={idx} className="procedure-card animate-pulse">
								<div className="procedure-card-top bg-gray-200 h-48"></div>
								<div className="p-5">
									<div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
									<div className="h-10 bg-gray-200 rounded w-full"></div>
								</div>
							</div>
						))
					) : error ? (
						// Error state
						<div className="col-span-3 py-8 text-center">
							<p className="text-gray-600">Unable to load clinics at this time.</p>
							<p className="text-sm text-gray-500 mt-2">Please try again later.</p>
						</div>
					) : (
						// Display clinic cards
						clinics.map((clinic) => (
							<div className="procedure-card-wrapper" key={clinic.clinicId}>
								<SearchResultCard 
									clinic={clinic}
									searchQuery=""
								/>
							</div>
						))
					)}
				</div>
			</div>
			<div className="start-search-btn">
				<Link to="/search" className="btn w-full max-w-[297px]">
					Start Your Search
				</Link>
			</div>
		</section>
	);
};

export default FindCosmetics;