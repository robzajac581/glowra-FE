import { Option, Select } from "@material-tailwind/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img2 from "../../../assets/img/banner/DarkenedImage3.png";
import img1 from "../../../assets/img/banner/banner-mobile.png";
import { icons } from "../../../components/Icons";
import useScreen from "../../../hooks/useScreen";
const Banner = () => {
	const [type, setType] = useState("Botox");
	const [price, setPrice] = useState("$3500");
	const [country, setCountry] = useState("Australia");
	const screen = useScreen();
	const navigate = useNavigate();
	const handleSubmit = (e) => {
		e.preventDefault();
		navigate("/procedures");
	};
	return (
		<section
			className="banner-section border-none"
			style={{
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
						<div className="select-item-2">
							{icons.searchicon}
							<label className="text-text">Procedure Type:</label>
							<Select
								className="border-none rounded-xl"
								containerProps={{
									className: "!min-w-20 w-full select-4",
								}}
								labelProps={{
									className: "hidden",
								}}
								value={type}
								onChange={setType}
							>
								<Option value="Botox">Botox</Option>
								<Option value="Belax">Belax</Option>
								<Option value="Troops">Troops</Option>
								<Option value="Angular">Angular</Option>
								<Option value="Svelte">Svelte</Option>
							</Select>
						</div>
						<div className="divider-1"></div>
						<div className="select-item-2">
							{icons.mapmarker}
							<label className="text-text">Select Locations:</label>
							<Select
								className="border-none rounded-xl"
								containerProps={{
									className: "!min-w-20 w-full select-4",
								}}
								labelProps={{
									className: "hidden",
								}}
								value={country}
								onChange={setCountry}
							>
								<Option value="Australia">Australia</Option>
								<Option value="Bangladesh">Bangladesh</Option>
								<Option value="India">India</Option>
								<Option value="England">England</Option>
								<Option value="Germany">Germany</Option>
							</Select>
						</div>
						<div className="divider-1"></div>
						<div className="select-item-2">
							{icons.dollar}
							<label className="text-text">Price Range:</label>
							<Select
								className="border-none rounded-xl"
								containerProps={{
									className: "!min-w-20 w-full select-4",
								}}
								labelProps={{
									className: "hidden",
								}}
								value={price}
								onChange={setPrice}
							>
								<Option value="$3500">$3500</Option>
								<Option value="$4500">$4500</Option>
								<Option value="$5500">$5500</Option>
								<Option value="$6500">$6500</Option>
							</Select>
						</div>
						<button type="submit" className="submit-btn-1">
							Search {icons.searchicon2}
						</button>
					</div>
				</form>
				<div className="hidden lg:block text-center font-medium mt-[33px] text-white">
					Search by Condition, Select Locations, or Category.{" "}
					<span className="font-extrabold text-primary">Learn More</span>
				</div>
			</div>
		</section>
	);
};

export default Banner;
