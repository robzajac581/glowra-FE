import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import img2 from "../../../assets/img/banner/DarkenedImage3.png";
import { icons } from "../../../components/Icons";
import useScreen from "../../../hooks/useScreen";
import LocationAutocompleteInput from "../../../components/LocationAutocompleteInput";
import { DEFAULT_CLINIC_SEARCH_RADIUS_MILES } from "../../../config/api";

const Banner = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [locationQuery, setLocationQuery] = useState("");
	const [locationGeoPending, setLocationGeoPending] = useState(null);
	const screen = useScreen();
	const navigate = useNavigate();

	const handleLocationResolved = useCallback(({ lat, lng, formattedAddress }) => {
		setLocationGeoPending({ lat, lng, label: formattedAddress });
		setLocationQuery(formattedAddress);
	}, []);

	const handleLocationInputChange = (e) => {
		const v = e.target.value;
		setLocationQuery(v);
		if (locationGeoPending && v.trim() !== locationGeoPending.label) {
			setLocationGeoPending(null);
		}
	};
	
	const handleSubmit = (e) => {
		e.preventDefault();
		const procedureValue = searchQuery.trim();
		const locationValue = locationQuery.trim();

		if (!procedureValue && !locationValue) {
			navigate("/search");
			return;
		}

		const params = new URLSearchParams();
		if (procedureValue) {
			params.set("searchQuery", procedureValue);
		}
		if (locationValue) {
			params.set("locationQuery", locationValue);
		}
		const pendingMatches =
			locationGeoPending && locationValue === locationGeoPending.label;
		if (pendingMatches) {
			params.set("locationLat", String(locationGeoPending.lat));
			params.set("locationLng", String(locationGeoPending.lng));
			params.set("locationRadius", String(DEFAULT_CLINIC_SEARCH_RADIUS_MILES));
		}

		navigate(`/search?${params.toString()}`);
	};
	return (
		<section
			className="banner-section border-none"
			style={{
				// TODO: add mobile image for this ternary
				background: `url(${
					screen < 768 ? img2 : img2
				}) no-repeat center center / cover`,
			}}
		>
			<div className="container">
				<div className="banner-content">
					<h1 className="banner-title">
						Discover & Book Your Next Cosmetic Procedure
					</h1>
					<p className="banner-text">
						Find the Right Procedure: Explore options, compare doctors &
						clinics, book your consultation - all in one place.
					</p>
				</div>
				<form onSubmit={handleSubmit}>
					<div className="banner-form">
						<div className="search-dual-input banner-dual-input">
							<div className="search-dual-section search-dual-section-primary">
								<label className="search-dual-label">Search</label>
								<input
									type="text"
									placeholder={
										screen < 768
											? "Procedure or doctor"
											: "Procedure or doctor name"
									}
									className="search-dual-field"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<div className="search-dual-divider" />
							<div className="search-dual-section search-dual-section-location">
								<label className="search-dual-label" htmlFor="banner-location-input">
									Add location
								</label>
								<LocationAutocompleteInput
									id="banner-location-input"
									placeholder="City, state or zip"
									className="search-dual-field"
									value={locationQuery}
									onChange={handleLocationInputChange}
									onPlaceResolved={handleLocationResolved}
								/>
							</div>
						</div>
						<button type="submit" className="submit-btn-1">
							Search {icons.searchicon2}
						</button>
					</div>
				</form>
				<div className="hidden lg:block text-center font-medium mt-[33px] text-white">
					Search by Procedure, Doctor, Location, or Category.{" "}
					{/* <span className="font-extrabold text-primary">Learn More</span> */}
				</div>
			</div>
		</section>
	);
};

export default Banner;
