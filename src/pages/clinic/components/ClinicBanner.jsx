// ClinicBanner.jsx
import React from "react";
import { procedure } from "../../../components/Icons";
import { cn } from "../../../utils/cn";

/**
 * Convert clinic name to title case (first letter of each word capitalized)
 */
const toTitleCase = (str) => {
	if (!str) return '';
	return str
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

/**
 * ClinicBanner Component
 * Displays clinic header with logo, name, address, rating, verified badge, and open/closed status
 */
const ClinicBanner = ({ clinicInfo, providers, logo, isOpenNow, closingTime }) => {
	if (!clinicInfo) {
		return <div>Loading clinic information...</div>;
	}

	// Use Google Places logo or fallback to placeholder
	const displayLogo = logo || "/img/clinic-logo.png";
	
	// DEBUG: Log logo information
	console.log('=== CLINIC BANNER LOGO DEBUG ===');
	console.log('Logo prop received:', logo);
	console.log('Display logo (with fallback):', displayLogo);
	console.log('================================');
	
	// Normalize clinic name to title case
	const displayName = toTitleCase(clinicInfo.ClinicName);
	
	// Use Google rating data
	const rating = clinicInfo.GoogleRating || 0;
	const reviewCount = clinicInfo.GoogleReviewCount || 0;

	return (
		<div className="">
			<div className="clinic-banner">
				<div className="clinic-banner-media">
					<img 
						src={displayLogo} 
						className="img" 
						alt={`${clinicInfo.ClinicName} logo`}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = "/img/clinic-logo.png";
						}}
					/>
					<div className="w-0 flex-grow">
						<div className="flex items-center gap-2 mb-3">
							<h1 className="text-4xl">{displayName}</h1>
							{clinicInfo.Verified && (
								<span 
									className="text-blue-500 text-xl" 
									title="Verified by Google"
									aria-label="Verified by Google"
								>
									✓
								</span>
							)}
						</div>
						<div className="text-black text-opacity-70">
							<div className="mb-1">
								{clinicInfo.Address}
							</div>
							{isOpenNow !== null && (
								<div className="flex items-center text-xs text-black">
									{isOpenNow ? (
										<>
											<span className="text-[#1DAE57]">Open now</span>
											{closingTime && (
												<>
													<span className="close-dot"></span>
													<span>Closes {closingTime}</span>
												</>
											)}
										</>
									) : (
										<span className="text-red-500">Closed</span>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
				<Rating 
					className="hidden md:flex" 
					rating={rating} 
					reviewCount={reviewCount} 
				/>
			</div>
			
			{providers && providers.length > 0 && (
				<>
					<h5 className="text-lg mb-[22px]">
						Doctors who work at {displayName}:
					</h5>
					<div className="doc-list">
						{providers.map((item, index) => (
							<div className="item" key={index}>
								<img 
									src={item.img || "/img/provider/1.png"} 
									className="img" 
									alt={item.ProviderName}
									loading="lazy"
									onError={(e) => {
										e.target.onerror = null;
										e.target.src = "/img/provider/1.png";
									}}
								/>
								<div>
									<h5 className="name">{item.ProviderName}</h5>
									<div className="designation">{item.Specialty}</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
			
			<Rating 
				className="md:hidden" 
				rating={rating} 
				reviewCount={reviewCount} 
			/>
		</div>
	);
};

const Rating = React.memo(({ className, rating = 0, reviewCount = 0 }) => {
	// Generate stars based on rating
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	
	return (
		<>
			<div
				className={cn("flex items-center text-dark text-sm rating mt-5", {
					[className]: className,
				})}
			>
				<span className="mr-1">{rating.toFixed(1)}</span>
				
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
				
				<span className="ml-1">({reviewCount.toLocaleString()} reviews)</span>
			</div>
		</>
	);
});

Rating.displayName = 'Rating';

export default React.memo(ClinicBanner);