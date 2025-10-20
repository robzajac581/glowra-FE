import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img2 from "../../../assets/img/banner/DarkenedImage3.png";
import { icons } from "../../../components/Icons";
import useScreen from "../../../hooks/useScreen";

const Banner = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const screen = useScreen();
	const navigate = useNavigate();
	
	const handleSubmit = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?searchQuery=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			navigate("/search");
		}
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
						<div className="search-input-container">
							{icons.searchicon}
							<input
								type="text"
								placeholder={
									screen < 768
										? "Search locations, procedures..."
										: "Search by city, state, procedure, doctor, or clinic"
								}
								className="banner-search-input"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<button type="submit" className="submit-btn-1">
							Search {icons.searchicon2}
						</button>
					</div>
				</form>
				<div className="hidden lg:block text-center font-medium mt-[33px] text-white">
					Search by Condition, Select Locations, or Category.{" "}
					{/* <span className="font-extrabold text-primary">Learn More</span> */}
				</div>
			</div>
		</section>
	);
};

export default Banner;
