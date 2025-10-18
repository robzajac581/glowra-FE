import { Collapse, Option, Select } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { icons } from "../../../components/Icons";
import ProcedureCard from "../../../components/ProcedureCard";
import useScreen from "../../../hooks/useScreen";
import useSearchState from "../../../hooks/useSearchState";

const API_BASE_URL = 'http://localhost:3001';

const FindCosmetics = () => {
	const [open, setOpen] = useState(false);
	const screen = useScreen();
	const [searchInput, setSearchInput] = useState('');
	const [featuredProcedures, setFeaturedProcedures] = useState([]);
	const [loading, setLoading] = useState(true);
	
	// Use our custom search hook
	const { 
		searchState, 
		updateSearchState, 
		navigateToSearch 
	} = useSearchState({
		searchQuery: "",
		category: "",
		minPrice: "",
		maxPrice: "",
		specialty: "",
		page: 1
	});

	// Fetch featured procedures on component mount
	useEffect(() => {
		const fetchFeaturedProcedures = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${API_BASE_URL}/api/procedures?limit=6`);
				
				if (!response.ok) {
					throw new Error('Failed to fetch featured procedures');
				}
				
				const data = await response.json();
				
				// Transform the data for our component format
				const transformedData = data.procedures.map(procedure => ({
					id: procedure.ProcedureID,
					clinicId: procedure.ClinicID || "1", // Fallback if not available
					img: `/img/procedures/${(procedure.ProcedureID % 6) + 1}.png`, // Cycle through available images
					doctor: procedure.ProviderName,
					doctorInfo: procedure.ClinicName,
					name: procedure.ProcedureName,
					price: procedure.AverageCost,
					City: procedure.City,
					State: procedure.State,
					website: procedure.Website
				}));
				
				setFeaturedProcedures(transformedData);
			} catch (error) {
				console.error('Error fetching featured procedures:', error);
				// Fallback to hardcoded data if API fails
				setFeaturedProcedures(products);
			} finally {
				setLoading(false);
			}
		};
		
		fetchFeaturedProcedures();
	}, []);

	// Handle search form submission
	const handleSearchSubmit = (e) => {
		e.preventDefault();
		
		// Update search state with input value
		updateSearchState('searchQuery', searchInput);
		
		// Navigate to search page with query
		navigateToSearch();
	};

	return (
		<section className="find-cosmetic">
			<div className="container">
				<h2 className="find-cosmetic-title">
					Find Your Cosmetic Procedure
				</h2>
				<form onSubmit={handleSearchSubmit}>
					<div className="flex md:gap-[30px] mb-[13px] md:mb-[30px]">
						<div className="w-0 flex-grow relative -mr-4 md:mr-0">
							<input
								type="text"
								placeholder={
									screen < 768
										? "Search procedure or location"
										: "Search by procedure name, city, state, or doctor"
								}
								className="find-cosmetic-input"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
							/>
							<button type="submit" className="find-cosmetic-search-btn">
								<span>Search {icons.searchIcon3}</span>
							</button>
						</div>
						<Link to="/search" className="find-cosmetic-btn">
							<span className="hidden md:block">See All</span>{" "}
							{icons.rightArrow}
						</Link>
					</div>
				</form>
				
				{/* Advanced filter section */}
				{screen >= 1024 ? (
					<AdvancedFilter 
						searchState={searchState}
						updateSearchState={updateSearchState}
					/>
				) : (
					<Collapse open={open}>
						<AdvancedFilter 
							searchState={searchState}
							updateSearchState={updateSearchState}
						/>
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
				
				{/* Featured procedures grid */}
				<div className="products-grid">
					{loading ? (
						// Show skeleton loaders when loading
						Array(screen < 1024 ? (screen < 640 ? 3 : 4) : 6).fill(0).map((_, idx) => (
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
					) : (
						featuredProcedures
							.slice(0, screen < 1024 ? (screen < 640 ? 3 : 4) : 6)
							.map((item) => (
								<ProcedureCard item={item} key={item.id} />
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

const AdvancedFilter = ({ searchState, updateSearchState }) => {
	const { 
		category = "", 
		minPrice = "", 
		maxPrice = "", 
		specialty = "" 
	} = searchState;
	
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
					value={category}
					onChange={(value) => updateSearchState('category', value)}
				>
					<Option value="">All Categories</Option>
					<Option value="Breast">Breast</Option>
					<Option value="Body">Body</Option>
					<Option value="Face">Face</Option>
					<Option value="Injectibles">Injectibles</Option>
					<Option value="Skin">Skin</Option>
				</Select>
			</div>
			{/* Location filter removed - now handled through search bar */}
			<div className="select-item">
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
					value={minPrice}
					onChange={(value) => updateSearchState('minPrice', value)}
				>
					<Option value="">Any Price</Option>
					<Option value="1000">From $1,000</Option>
					<Option value="3500">From $3,500</Option>
					<Option value="5000">From $5,000</Option>
					<Option value="7500">From $7,500</Option>
				</Select>
			</div>
			<div className="select-item">
				{icons.doctor}
				<label className="text-text">Specialty:</label>
				<Select
					className="border-none rounded-xl"
					containerProps={{
						className: "!min-w-20 w-full select-4",
					}}
					labelProps={{
						className: "hidden",
					}}
					value={specialty}
					onChange={(value) => updateSearchState('specialty', value)}
				>
					<Option value="">Any Specialty</Option>
					<Option value="Plastic Surgery">Plastic Surgery</Option>
					<Option value="Dermatology">Dermatology</Option>
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