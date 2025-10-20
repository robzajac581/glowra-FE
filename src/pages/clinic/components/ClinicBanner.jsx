// ClinicBanner.jsx
import React, { useRef, useState } from "react";
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
 * Helper function to resolve photo URLs for development environment
 * In production, relative URLs work fine. In dev, we need to prepend the API base URL.
 */
const resolvePhotoURL = (photoURL) => {
	if (!photoURL) return null;
	
	// If it's already an absolute URL, return as-is
	if (photoURL.startsWith('http://') || photoURL.startsWith('https://')) {
		return photoURL;
	}
	
	// In development, prepend the API base URL
	// In production, relative URLs work fine (both FE and BE on same domain: Glowra.com)
	if (process.env.NODE_ENV === 'development' && photoURL.startsWith('/api/')) {
		return `http://localhost:3001${photoURL}`;
	}
	
	return photoURL;
};

/**
 * Helper function to get initials from provider name
 */
const getInitials = (name) => {
	if (!name) return '?';
	
	// Remove "Dr." prefix and split by space
	const cleanName = name.replace(/^Dr\.?\s*/i, '').trim();
	const parts = cleanName.split(/\s+/);
	
	if (parts.length >= 2) {
		// First and last name initials
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	
	// Single name - return first letter
	return cleanName[0]?.toUpperCase() || '?';
};

/**
 * Placeholder component for providers without photos
 */
const ProviderPhotoPlaceholder = ({ name }) => {
	const initials = getInitials(name);
	
	return (
		<div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-300">
			<span className="text-2xl font-bold text-blue-700">
				{initials}
			</span>
		</div>
	);
};

/**
 * Individual provider card component with photo/placeholder
 */
const ProviderCard = ({ provider, photoURL, hasValidPhoto }) => {
	const [imageError, setImageError] = useState(false);
	const showPlaceholder = !hasValidPhoto || imageError;
	
	return (
		<div className="flex-shrink-0 w-[160px] text-center">
			<div className="mb-3 flex justify-center">
				{showPlaceholder ? (
					<ProviderPhotoPlaceholder name={provider.ProviderName} />
				) : (
					<img 
						src={photoURL} 
						className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" 
						alt={`${provider.ProviderName} - ${provider.Specialty}`}
						loading="lazy"
						referrerPolicy="no-referrer"
						onError={() => setImageError(true)}
					/>
				)}
			</div>
			<div>
				<h5 className="text-sm font-black font-Avenir text-dark mb-1">
					{provider.ProviderName}
				</h5>
				<div className="text-xs text-black text-opacity-70">
					{provider.Specialty}
				</div>
				{hasValidPhoto && !imageError && (
					<span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
						✓ Verified
					</span>
				)}
			</div>
		</div>
	);
};

/**
 * ClinicBanner Component
 * Displays clinic header with logo, name, address, rating, verified badge, category, and open/closed status
 */
const ClinicBanner = ({ clinicInfo, providers, requiresConsultRequest, consultMessage, logo, isOpenNow, closingTime }) => {
	const carouselRef = useRef(null);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(true);

	if (!clinicInfo) {
		return <div>Loading clinic information...</div>;
	}

	// Use Google Places logo or fallback to placeholder
	const displayLogo = logo || "/img/clinic-logo.png";
	
	// Normalize clinic name to title case
	const displayName = toTitleCase(clinicInfo.ClinicName);
	
	// Use Google rating data
	const rating = clinicInfo.GoogleRating || 0;
	const reviewCount = clinicInfo.GoogleReviewCount || 0;

	// Carousel navigation functions
	const scroll = (direction) => {
		if (carouselRef.current) {
			const scrollAmount = 200; // Reduced for smaller cards
			const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
			carouselRef.current.scrollTo({
				left: newScrollLeft,
				behavior: 'smooth'
			});
		}
	};

	const handleScroll = () => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setShowLeftArrow(scrollLeft > 0);
			setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
		}
	};

	return (
		<div className="">
			<div className="clinic-banner">
				<div className="clinic-banner-media">
					<img 
						src={displayLogo} 
						className="img" 
						alt={`${clinicInfo.ClinicName} logo`}
						referrerPolicy="no-referrer"
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = "/img/clinic-logo.png";
						}}
					/>
					<div className="w-0 flex-grow">
						<div className="flex items-center gap-2 mb-2">
							<h1 className="text-4xl">{displayName}</h1>
						</div>
						
						{/* Badges Row */}
						<div className="flex items-center gap-2 mb-2">
							{/* Google Verified Badge */}
							{clinicInfo.Verified && (
								<span 
									className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-300 shadow-sm"
									title="Verified by Google"
									aria-label="Verified by Google"
								>
									<svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Google Verified
								</span>
							)}
							
							{/* Category Badge */}
							{clinicInfo.Category && (
								<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
									{clinicInfo.Category}
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
			
			{/* Handle consult-only clinics */}
			{requiresConsultRequest ? (
				consultMessage && (
					<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800 text-center">
							{consultMessage}
						</p>
					</div>
				)
			) : (
				/* Show providers section for normal clinics */
				providers && providers.length > 0 && (
					<>
						<h5 className="text-lg mb-[22px]">
							Doctors who work at {displayName}:
						</h5>
						<div className="relative">
							{/* Left Navigation Arrow */}
							{showLeftArrow && (
								<button
									onClick={() => scroll('left')}
									className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition-colors"
									aria-label="Scroll left"
								>
									<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
							)}
							
							{/* Carousel Container */}
							<div 
								ref={carouselRef}
								onScroll={handleScroll}
								className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
								style={{ 
									scrollbarWidth: 'none', 
									msOverflowStyle: 'none',
									WebkitOverflowScrolling: 'touch'
								}}
							>
							{providers.map((item, index) => {
								// Resolve photo URL for development/production
								const photoURL = resolvePhotoURL(item.PhotoURL);
								const hasValidPhoto = item.hasPhoto && photoURL;
								
								return (
									<ProviderCard 
										key={index}
										provider={item}
										photoURL={photoURL}
										hasValidPhoto={hasValidPhoto}
									/>
								);
							})}
							</div>
							
							{/* Right Navigation Arrow */}
							{showRightArrow && (
								<button
									onClick={() => scroll('right')}
									className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition-colors"
									aria-label="Scroll right"
								>
									<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							)}
						</div>
					</>
				)
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