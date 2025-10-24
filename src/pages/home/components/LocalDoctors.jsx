import React, { useState, useEffect } from "react";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import useScreen from "../../../hooks/useScreen";
import LocalDoctorsCard from "./LocalDoctorsCard";

const API_BASE_URL = 'http://localhost:3001';

// Default location: Chicago, IL
const DEFAULT_LOCATION = {
	lat: 41.8781,
	lng: -87.6298,
	city: "Chicago"
};

const LocalDoctors = () => {
	const screen = useScreen();
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

	// Fetch nearby top-rated clinics once we have location
	useEffect(() => {
		if (!userLocation || locationLoading) return;

		const fetchNearbyClinics = async () => {
			try {
				setLoading(true);
				setError(null);

				const url = `${API_BASE_URL}/api/clinics/nearby-top-rated?lat=${userLocation.lat}&lng=${userLocation.lng}&limit=3`;

				const response = await fetch(url);

				if (!response.ok) {
					const errorText = await response.text();
					console.error('Error response:', errorText);
					throw new Error(`Backend error: ${response.status}`);
				}

				const data = await response.json();
				
				if (data.clinics && data.clinics.length > 0) {
					setClinics(data.clinics);
				} else {
					setClinics([]);
				}
			} catch (err) {
				console.error('Error fetching nearby clinics:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchNearbyClinics();
	}, [userLocation, locationLoading]);

	// Loading state
	if (loading || locationLoading) {
		return (
			<section className="local-doctor">
				<div className="container">
					<h2 className="local-doctor-title">Book with Local Doctors</h2>
					<div className="local-doctor-text">
						Top-rated medical aesthetics clinics with 90% of patients giving them
						5-star ratings
						<span className="hidden md:inline">
							. Known for their exceptional service, attentive care, and
							medical expertise, they are highly recommended for outstanding
							medical care.
						</span>
					</div>
					<div className="flex justify-center items-center py-16">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-gray-600">Finding top-rated clinics near you...</p>
						</div>
					</div>
				</div>
				<img src="/img/client/left-shape.png" className="shape-1" alt="" />
				<img src="/img/client/right-shape.png" className="shape-2" alt="" />
			</section>
		);
	}

	// Error state
	if (error || clinics.length === 0) {
		return (
			<section className="local-doctor">
				<div className="container">
					<h2 className="local-doctor-title">Book with Local Doctors</h2>
					<div className="local-doctor-text">
						Top-rated medical aesthetics clinics with 90% of patients giving them
						5-star ratings
						<span className="hidden md:inline">
							. Known for their exceptional service, attentive care, and
							medical expertise, they are highly recommended for outstanding
							medical care.
						</span>
					</div>
					<div className="flex justify-center items-center py-16">
						<div className="text-center">
							<p className="text-gray-600">
								{error ? "Unable to load clinics at this time." : "No clinics found in your area."}
							</p>
							<p className="text-sm text-gray-500 mt-2">Please try again later.</p>
						</div>
					</div>
				</div>
				<img src="/img/client/left-shape.png" className="shape-1" alt="" />
				<img src="/img/client/right-shape.png" className="shape-2" alt="" />
			</section>
		);
	}

	// Success state with clinics
	return (
		<section className="local-doctor">
			<div className="container">
				<h2 className="local-doctor-title">Book with Local Doctors</h2>
				<div className="local-doctor-text">
					Top-rated medical aesthetics clinics with 90% of patients giving them
					5-star ratings
					<span className="hidden md:inline">
						. Known for their exceptional service, attentive care, and
						medical expertise, they are highly recommended for outstanding
						medical care.
					</span>
				</div>
				{screen >= 1024 ? (
					<div className="grid grid-cols-3 gap-5 xl:gap-10 items-stretch">
						{clinics.map((clinic) => (
							<div key={clinic.clinicId} className="flex">
								<LocalDoctorsCard clinic={clinic} />
							</div>
						))}
					</div>
				) : (
					<div className="drop-shadow-md">
						<Swiper
							spaceBetween={40}
							modules={[Pagination, A11y]}
							pagination={{ clickable: true }}
						>
							{clinics.map((clinic) => (
								<SwiperSlide key={clinic.clinicId} className="h-auto">
									<div className="h-full">
										<LocalDoctorsCard clinic={clinic} />
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				)}
			</div>
			<img src="/img/client/left-shape.png" className="shape-1" alt="" />
			<img src="/img/client/right-shape.png" className="shape-2" alt="" />
		</section>
	);
};

export default LocalDoctors;
