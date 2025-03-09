// ClinicBanner.jsx
import React from "react";
import { procedure } from "../../../components/Icons";
import { cn } from "../../../utils/cn";

const ClinicBanner = ({ clinicInfo, providers }) => {
	if (!clinicInfo) {
		return <div>Loading clinic information...</div>;
	}

	return (
		<div className="">
			<div className="clinic-banner">
				<div className="clinic-banner-media">
					<img src="/img/clinic-logo.png" className="img" alt={clinicInfo.ClinicName} />
					<div className="w-0 flex-grow">
						<h3 className="text-4xl mb-3">{clinicInfo.ClinicName}</h3>
						<div className="text-black text-opacity-70">
							<div className="mb-1">
								{clinicInfo.Address}
							</div>
							<div className="flex items-center text-xs text-black">
								{clinicInfo.isOpen ? (
									<>
										<span className="text-[#1DAE57]">Open now</span>{" "}
										<span className="close-dot"></span>
										<span>Close {clinicInfo.closeTime}</span>
									</>
								) : (
									<span className="text-red-500">Closed</span>
								)}
							</div>
						</div>
					</div>
				</div>
				<Rating 
					className="hidden md:flex" 
					rating={clinicInfo.rating} 
					reviewCount={clinicInfo.reviewCount} 
				/>
			</div>
			<h5 className="text-lg mb-[22px]">
				Doctors who work at {clinicInfo.ClinicName}:
			</h5>
			<div className="doc-list">
				{providers && providers.length > 0 ? (
					providers.map((item, index) => (
						<div className="item" key={index}>
							<img src={item.img} className="img" alt={item.ProviderName} />
							<div>
								<h5 className="name">{item.ProviderName}</h5>
								<div className="designation">{item.Specialty}</div>
							</div>
						</div>
					))
				) : (
					<div className="text-gray-500">No providers information available</div>
				)}
			</div>
			<Rating 
				className="md:hidden" 
				rating={clinicInfo.rating} 
				reviewCount={clinicInfo.reviewCount} 
			/>
			
			{clinicInfo.Website && (
				<div className="mt-4">
					<a 
						href={clinicInfo.Website.startsWith('http') ? clinicInfo.Website : `https://${clinicInfo.Website}`} 
						target="_blank" 
						rel="noopener noreferrer"
						className="btn"
					>
						Visit Website {procedure.arrowLink}
					</a>
				</div>
			)}
		</div>
	);
};

const Rating = ({ className, rating = 0, reviewCount = 0 }) => {
	// Generate stars based on rating
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	
	return (
		<>
			<div
				className={cn("flex text-dark text-sm rating mt-5", {
					[className]: className,
				})}
			>
				{/* Render full stars */}
				{[...Array(fullStars)].map((_, i) => (
					<span key={`star-${i}`}>{procedure.star}</span>
				))}
				
				{/* Render half star if needed */}
				{hasHalfStar && <span>{procedure.halfStar || procedure.star}</span>}
				
				{/* Render empty stars */}
				{[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
					<span key={`empty-${i}`} className="opacity-30">{procedure.star}</span>
				))}
				
				<span>({reviewCount.toLocaleString()} reviews)</span>
			</div>
		</>
	);
};

export default ClinicBanner;