import { Collapse, Option, Select } from "@material-tailwind/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { icons } from "../../../components/Icons";
import ProcedureCard from "../../../components/ProcedureCard";
import useScreen from "../../../hooks/useScreen";

const FindCosmetics = () => {
	const [open, setOpen] = useState(false);
	const screen = useScreen();

	return (
		<section className="find-cosmetic">
			<div className="container">
				<h2 className="find-cosmetic-title">
					Find Your Cosmetic Procedure
				</h2>
				<form action="">
					<div className="flex md:gap-[30px] mb-[13px] md:mb-[30px]">
						<div className="w-0 flex-grow relative -mr-4 md:mr-0">
							<input
								type="text"
								placeholder={
									screen < 768
										? "Search procedure"
										: "Type the procedure you want here"
								}
								className="find-cosmetic-input"
							/>
							<button type="submit" className="find-cosmetic-search-btn">
								<span>Search {icons.searchIcon3}</span>
							</button>
						</div>
						<Link to="" className="find-cosmetic-btn">
							<span className="hidden md:block">See All</span>{" "}
							{icons.rightArrow}
						</Link>
					</div>
				</form>
				{screen >= 1024 ? (
					<AdvancedFilter />
				) : (
					<Collapse open={open}>
						<AdvancedFilter />
					</Collapse>
				)}
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className={`text-black flex gap-3 lg:hidden ${
						open ? "mt-3" : ""
					}`}
				>
					{icons.filter}
					Advanced filters
				</button>
				<div className="products-grid">
					{products
						?.map((item, index) => (
							<ProcedureCard item={item} key={item.id} />
						))
						.slice(0, screen < 1024 ? (screen < 640 ? 3 : 4) : 6)}
				</div>
			</div>
			<div className="start-search-btn">
				<Link to="/procedures" className="btn w-full max-w-[297px]">
					Start Your Search
				</Link>
			</div>
		</section>
	);
};

const AdvancedFilter = () => {
	const [search, setSearch] = useState("Botox");
	const [type, setType] = useState("Botox");
	const [country, setCountry] = useState("Australia");
	// Replace single price state with minPrice and maxPrice
	const [minPrice, setMinPrice] = useState("$3,500");
	const [maxPrice, setMaxPrice] = useState("$8,000");
	const [doctor, setDoctor] = useState("Surgeon");
	return (
		<div className="advanced-search-flex">
			<div className="select-item">
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
			<div className="select-item">
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
			{/* Replace single price dropdown with min price */}
			<div className="select-item">
				{icons.dollar}
				<label className="text-text">Price Min:</label>
				<Select
					className="border-none rounded-xl"
					containerProps={{
						className: "!min-w-20 w-full select-4",
					}}
					labelProps={{
						className: "hidden",
					}}
					value={minPrice}
					onChange={setMinPrice}
				>
					<Option value="$1,000">$1,000</Option>
					<Option value="$2,000">$2,000</Option>
					<Option value="$3,500">$3,500</Option>
					<Option value="$5,000">$5,000</Option>
					<Option value="$7,500">$7,500</Option>
				</Select>
			</div>
			{/* Add max price dropdown */}
			<div className="select-item">
				{icons.dollar}
				<label className="text-text">Price Max:</label>
				<Select
					className="border-none rounded-xl"
					containerProps={{
						className: "!min-w-20 w-full select-4",
					}}
					labelProps={{
						className: "hidden",
					}}
					value={maxPrice}
					onChange={setMaxPrice}
				>
					<Option value="$5,000">$5,000</Option>
					<Option value="$8,000">$8,000</Option>
					<Option value="$10,000">$10,000</Option>
					<Option value="$15,000">$15,000</Option>
					<Option value="$20,000">$20,000</Option>
				</Select>
			</div>
			<div className="select-item">
				{icons.doctor}
				<label className="text-text">Doctor:</label>
				<Select
					className="border-none rounded-xl"
					containerProps={{
						className: "!min-w-20 w-full select-4",
					}}
					labelProps={{
						className: "hidden",
					}}
					value={doctor}
					onChange={setDoctor}
				>
					<Option value="Surgeon">Surgeon</Option>
					<Option value="Medicine">Medicine</Option>
				</Select>
			</div>
		</div>
	);
};

export const products = [
	{
		id: "1",
		img: "/img/procedures/1.png",
		doctor: "Dr. Jane Smith",
		doctorInfo: "Board-Certified Dermatologist",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "2",
		img: "/img/procedures/2.png",
		doctor: "Dr. Jane Smith",
		doctorInfo: "Board-Certified Dermatologist",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "3",
		img: "/img/procedures/3.png",
		doctor: "Dr. Jane Smith",
		doctorInfo: "Board-Certified Dermatologist",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "4",
		img: "/img/procedures/4.png",
		doctor: "Dr. Jane Smith",
		doctorInfo: "Board-Certified Dermatologist",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "5",
		img: "/img/procedures/5.png",
		doctor: "Dr. Jane Smith",
		doctorInfo: "Board-Certified Dermatologist",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "6",
		img: "/img/procedures/6.png",
		doctor: "Dr. Jane Smith",
		doctorInfo: "Board-Certified Dermatologist",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
];

export default FindCosmetics;