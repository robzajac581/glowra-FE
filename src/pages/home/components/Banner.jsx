import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img2 from "../../../assets/img/banner/DarkenedImage3.png";
import { icons } from "../../../components/Icons";
import useScreen from "../../../hooks/useScreen";

const Banner = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [locationQuery, setLocationQuery] = useState("");
	const screen = useScreen();
	const navigate = useNavigate();
	
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
								<label className="search-dual-label">Add location</label>
								<input
									type="text"
									placeholder="City, state or zip"
									className="search-dual-field"
									value={locationQuery}
									onChange={(e) => setLocationQuery(e.target.value)}
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
