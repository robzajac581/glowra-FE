import React from "react";
import { Link } from "react-router-dom";
import { procedure } from "./Icons";

const ProcedureCard = ({ item, search }) => {
	// Format price to USD currency string with tilde prefix
	const formatPrice = (price) => {
		return '~' + new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	// // Ensure website URL has proper format
	// const formatWebsiteUrl = (url) => {
	// 	if (!url) return null;
	// 	if (!url.startsWith('http://') && !url.startsWith('https://')) {
	// 		return `https://${url}`;
	// 	}
	// 	return url;
	// };

	return (
		<div className="procedure-card group h-full flex flex-col">
			<Link 
				to={`/clinic/${item.clinicId}`} 
				className="absolute z-[1] inset-0" 
			/>
			<div className="procedure-card-top flex-shrink-0">
				<img src={item.img} alt={item.name} />
				<div className="rating">
					<span className="translate-y-[1px]">4.8</span> {procedure.star}
				</div>
				<div className="reviews">
					{procedure.reviews}
					<span className="translate-y-[1px]">
						{search ? "Reviews" : "Review Snippet"}
					</span>
				</div>
			</div>
			<div className="p-5 flex-1 flex flex-col">
				{/* Fixed height title area to accommodate 1-2 lines consistently */}
				<div className="h-20 mb-4 flex items-start">
					<h5 className="name line-clamp-2">{item.name}</h5>
				</div>
				
				{/* Content area with consistent spacing */}
				<div className="text-sm flex-1 flex flex-col justify-between">
					<div className="space-y-3">
						<div className="procedure-card-doc-info">
							{/* <Link
								to={`/clinic/${item.id}`}
								className="text-primary font-extrabold relative z-10"
							>
								{item.doctor}
							</Link> */}
							<span>{item.doctorInfo}</span>
						</div>
						<div className="location">
							<strong>{procedure.mapmarker2}</strong>
							<span>
								{item.City || "Location unavailable"},{" "}
								<strong className="text-primary font-black">
									{item.State}
								</strong>
							</span>
						</div>
						<div className="location">
							<strong>{procedure.dollar2}</strong>
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
						{/*{item.website ? (
							<a 
								className="btn relative z-10" 
								href={formatWebsiteUrl(item.website)}
								target="_blank" 
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()} // Prevent triggering the card's link
							>
								Visit Website {procedure.arrowLink}
							</a>
						) : ( */}
							<Link 
								className="btn" 
								to={`/clinic/${item.clinicId}}`}
							>
								View Details {procedure.arrowLink}
							</Link>
						{/* )} */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProcedureCard;