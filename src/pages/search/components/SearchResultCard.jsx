import React from "react";
import { Link } from "react-router-dom";
import { procedure } from "../../../components/Icons";

/**
 * Enhanced ProcedureCard component optimized for search results
 */
const SearchResultCard = ({ item }) => {
	// Format price to USD currency string
	const formatPrice = (price) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	return (
		<div className="procedure-card group h-full flex flex-col">
			<Link 
				to={`/clinic/${item.clinicId}`} 
				className="absolute z-[1] inset-0" 
			/>
			<div className="procedure-card-top flex-shrink-0">
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
			<div className="p-4 flex-1 flex flex-col">
				{/* Fixed height title area to accommodate 1-2 lines consistently */}
				<div className="h-16 mb-3 flex items-start">
					<h5 className="name text-base leading-tight line-clamp-2">
						{item.name}
					</h5>
				</div>
				
				{/* Content area with consistent spacing */}
				<div className="text-sm flex-1 flex flex-col justify-between">
					<div className="space-y-2">
						<div className="procedure-card-doc-info">
							<span>{item.doctor}</span>
							{item.specialty && (
								<span className="ml-1 text-gray-500">({item.specialty})</span>
							)}
						</div>
						<div className="clinic-name font-medium text-xs">
							{item.doctorInfo}
						</div>
						<div className="location text-xs flex items-center">
							<strong className="mr-1">{procedure.mapmarker2}</strong>
							<span>
								{item.City || "Location unavailable"},{" "}
								<strong className="text-primary font-black">
									{item.State}
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
					
					{/* Button area - always at bottom */}
					<div className="mt-1">
						<Link 
							className="btn btn-sm w-full text-xs py-2" 
							to={`/clinic/${item.clinicId}`}
						>
							View Details {procedure.arrowLink}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SearchResultCard;

