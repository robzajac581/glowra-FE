import { Option, Radio, Select } from "@material-tailwind/react";
import React, { useState } from "react";
import { icons } from "../../components/Icons";
import Layout from "../../components/Layout";
import ProcedureCard from "../../components/ProcedureCard";
import useScreen from "../../hooks/useScreen";

const Procedures = () => {
	const screen = useScreen();
	const [search, setSearch] = useState("Botox");
	const [type, setType] = useState("Botox");
	const [country, setCountry] = useState("Australia");
	const [price, setPrice] = useState("$3500");
	const [doctor, setDoctor] = useState("Surgeon");
	const [rating, setRating] = useState("5 star");
	return (
		<Layout>
			<div className="single-procedure-card">
				<div className="container xl:max-w-[1226px]">
					<h1 className="title">Search results for “Botox”:</h1>
					<div className="subtitle">269 Doctors</div>
					<form action="">
						<div className="relative">
							<input
								type="text"
								placeholder={
									screen < 768
										? "Search procedure"
										: "Type the procedure you want here"
								}
								className="search-input"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<button type="submit" className="search-btn">
								<span>Search</span>
								{icons.searchIcon3}
							</button>
						</div>
					</form>
					<div className="search-grid">
						<div className="border bg-white rounded-md">
							<Select
								variant="static"
								className="border-none h-[52px] rounded-xl"
								label="Procedure Type"
								containerProps={{
									className: "!min-w-0 w-full select",
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
						<div className="border bg-white rounded-md">
							<Select
								variant="static"
								className="border-none h-[52px] rounded-xl"
								label="Locations"
								containerProps={{
									className: "!min-w-0 w-full select",
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
						<div className="border bg-white rounded-md">
							<Select
								variant="static"
								className="border-none h-[52px] rounded-xl"
								label="Price Range"
								containerProps={{
									className: "!min-w-0 w-full select",
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
						<div className="border bg-white rounded-md">
							<Select
								variant="static"
								className="border-none h-[52px] rounded-xl"
								label="Doctor"
								containerProps={{
									className: "!min-w-0 w-full select",
								}}
								value={doctor}
								onChange={setDoctor}
							>
								<Option value="Surgeon">Surgeon</Option>
								<Option value="Medicine">Medicine</Option>
							</Select>
						</div>
					</div>
					<div className="flex gap-8 mt-[34px] md:mt-[63px]">
						<div className="w-[208px] hidden xl:block">
							<div className="mb-8">
								<h5 className="font-medium mb-2 font-Avenir">
									Customer Rating
								</h5>
								<div className="flex flex-col gap-3">
									{ratingList?.map((item) => (
										<Radio
											name="terms"
											label={
												<div
													className={`font-medium ${
														item.name === rating
															? "text-black"
															: "text-text2"
													}`}
												>
													{item.name}
												</div>
											}
											containerProps={{
												className: "p-0 items-center radio",
											}}
											defaultChecked={item.name === rating}
											onChange={() => setRating(item.name)}
										/>
									))}
								</div>
							</div>
							<div className="mb-8">
								<h5 className="font-medium mb-2 font-Avenir">
									Nearest Locations
								</h5>
								<iframe
									src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7298.9601660514245!2d90.36501104466463!3d23.837080364445423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c14a3366b005%3A0x901b07016468944c!2sMirpur%20DOHS%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1721925768310!5m2!1sen!2sbd"
									height="250"
									style={{ border: "none", width: "100%" }}
								></iframe>
							</div>
							<button type="button" className="btn min-h-[47px] w-full">
								Apply Filters
							</button>
						</div>
						<div className="w-0 flex-grow">
							<div className="bottom-product-grid">
								{products
									?.map((item, index) => (
										<ProcedureCard search item={item} key={item.id} />
									))
									.slice(
										0,
										screen < 1024 ? (screen < 640 ? 3 : 4) : 6
									)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};
const ratingList = [
	{
		name: "5 star",
	},
	{
		name: "4 star (& above)",
	},
	{
		name: "3 star (& above)",
	},
	{
		name: "2 star (& above)",
	},
	{
		name: "1 star (& above)",
	},
];
export const products = [
	{
		id: "1",
		img: "/img/procedures/2.png",
		doctor: "Bayside Cosmetics",
		doctorInfo: "Board-Certified Dermatologist, Plastic Surgery, Xyz",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "2",
		img: "/img/procedures/2.png",
		doctor: "Bayside Cosmetics",
		doctorInfo: "Board-Certified Dermatologist, Plastic Surgery, Xyz",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "3",
		img: "/img/procedures/2.png",
		doctor: "Bayside Cosmetics",
		doctorInfo: "Board-Certified Dermatologist, Plastic Surgery, Xyz",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "4",
		img: "/img/procedures/2.png",
		doctor: "Bayside Cosmetics",
		doctorInfo: "Board-Certified Dermatologist, Plastic Surgery, Xyz",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "5",
		img: "/img/procedures/2.png",
		doctor: "Bayside Cosmetics",
		doctorInfo: "Board-Certified Dermatologist, Plastic Surgery, Xyz",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
	{
		id: "6",
		img: "/img/procedures/2.png",
		doctor: "Bayside Cosmetics",
		doctorInfo: "Board-Certified Dermatologist, Plastic Surgery, Xyz",
		name: "Botox Cosmetic RTASCX (Wrinkle Reduction)",
	},
];

export default Procedures;
