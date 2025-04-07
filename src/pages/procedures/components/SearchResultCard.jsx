import React from "react";
import { Link } from "react-router-dom";
import { procedure } from "../../../components/Icons";

/**
 * Enhanced ProcedureCard component optimized for search results
 * Highlights search terms in the title and displays improved information
 */
const SearchResultCard = ({ item, searchQuery }) => {
	// Format price to USD currency string
	const formatPrice = (price) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	// Highlight search term in text if present (title, location, etc.)
	const highlightSearchTerm = (text, term) => {
		if (!term || !text) return text;
		
		// Case insensitive search
		const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		
		// Skip highlighting if no match
		if (!regex.test(text)) return text;
		
		// Split by the regex and then map the parts, adding highlight to matches
		const parts = text.split(regex);
		
		return (
			<>
				{parts.map((part, i) => 
					regex.test(part) ? (
						<mark key={i} className="bg-yellow-100 px-[1px] rounded">
							{part}
						</mark>
					) : (
						part
					)
				)}
			</>
		);
	};

	return (
		<div className="procedure-card group h-full">
			<Link 
				to={`/clinic/${item.clinicId}`} 
				className="absolute z-[1] inset-0" 
			/>
			<div className="procedure-card-top">
				<img src={item.img} alt={item.name} className="object-cover w-full h-full" />
				<div className="rating">
					<span className="translate-y-[1px]">4.8</span> {procedure.star}
				</div>
				<div className="reviews">
					{procedure.reviews}
					<span className="translate-y-[1px]">Reviews</span>
				</div>
				{/* Category tag */}
				{item.category && (
					<div className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded-full">
						{item.category}
					</div>
				)}
			</div>
			<div className="p-4">
				<h5 className="name text-base leading-tight mb-2">
					{searchQuery ? highlightSearchTerm(item.name, searchQuery) : item.name}
				</h5>
				<div className="text-sm">
					<div className="procedure-card-doc-info">
						<span>{searchQuery ? highlightSearchTerm(item.doctor, searchQuery) : item.doctor}</span>
						{item.specialty && (
							<span className="ml-1 text-gray-500">({searchQuery ? highlightSearchTerm(item.specialty, searchQuery) : item.specialty})</span>
						)}
					</div>
					<div className="mb-[10px] clinic-name font-medium text-xs">
						{searchQuery ? highlightSearchTerm(item.doctorInfo, searchQuery) : item.doctorInfo}
					</div>
					<div className="location mb-[10px] text-xs flex items-center">
						<strong className="mr-1">{procedure.mapmarker2}</strong>
						<span>
							{searchQuery && item.City ? highlightSearchTerm(item.City, searchQuery) : (item.City || "Location unavailable")},{" "}
							<strong className="text-primary font-black">
								{searchQuery && item.State ? highlightSearchTerm(item.State, searchQuery) : item.State}
							</strong>
						</span>
					</div>
					<div className="location text-xs flex items-center">
						<strong className="mr-1">{procedure.dollar2}</strong>
						<span>
							Starting at{" "}
							<strong className="text-primary font-black">
								{formatPrice(item.price)}
							</strong>
						</span>
					</div>
				</div>
				<Link 
					className="btn btn-sm w-full mt-3 text-xs py-2" 
					to={`/clinic/${item.clinicId}`}
				>
					View Details {procedure.arrowLink}
				</Link>
			</div>
		</div>
	);
};

export default SearchResultCard;