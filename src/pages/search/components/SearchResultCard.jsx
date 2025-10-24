import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { procedure } from "../../../components/Icons";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Clinic Card component for search results
 * Displays clinic information with relevant procedures
 */
const SearchResultCard = ({ clinic, searchQuery }) => {
	const location = useLocation();
	
	// Format price to USD currency string
	const formatPrice = (price) => {
		if (!price || price === 0) return 'Price on request';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	// Use displayProcedures (pre-computed in Search.jsx) or fallback to first 5 procedures
	const displayProcedures = clinic.displayProcedures || clinic.procedures.slice(0, 5);

	// Base clinic URL
	const clinicUrl = `/clinic/${clinic.clinicId}`;
	
	// Check if clinic has valid rating
	const hasRating = clinic.rating && clinic.rating > 0;
	
	// Check if we have a valid photo URL from database
	const hasPhotoURL = clinic.photoURL && clinic.photoURL.trim() !== '';
	
	// Primary photo source: Backend proxy endpoint
	const proxyPhotoUrl = `${API_BASE_URL}/api/photos/clinic/${clinic.clinicId}`;
	
	// Fallback photo source: Direct Google URL (will have rate limiting)
	const fallbackPhotoUrl = clinic.photoURL;
	
	// State to track image loading
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [useFallback, setUseFallback] = useState(false);

	// Handle image error with fallback strategy
	const handleImageError = () => {
		if (!useFallback && hasPhotoURL) {
			// First error: Try fallback to direct Google URL
			setUseFallback(true);
			setImageLoaded(false);
		} else {
			// Second error or no fallback available: Show placeholder
			setImageError(true);
		}
	};

	// Determine which photo URL to use
	const getPhotoUrl = () => {
		if (useFallback && hasPhotoURL) {
			return fallbackPhotoUrl;
		}
		return proxyPhotoUrl;
	};

	// Check if we should attempt to show an image
	const shouldShowImage = !imageError;

	return (
		<div className="procedure-card group h-full flex flex-col">
			{/* Clinic Image or No Photo Placeholder */}
			<div className="procedure-card-top flex-shrink-0 relative" style={{ minHeight: shouldShowImage ? 'auto' : '210px' }}>
				{shouldShowImage ? (
					<>
						<img 
							src={getPhotoUrl()} 
							alt={clinic.clinicName} 
							className="object-cover w-full h-full transition-opacity duration-300"
							style={{ opacity: imageLoaded ? 1 : 0 }}
							loading="lazy"
							referrerPolicy="no-referrer"
							onLoad={() => setImageLoaded(true)}
							onError={handleImageError}
						/>
						{/* Loading placeholder */}
						{!imageLoaded && (
							<div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
								<div className="animate-pulse text-gray-400">Loading...</div>
							</div>
						)}
					</>
				) : (
					<div className="w-full h-[210px] bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-t-[10px]">
						<svg 
							className="w-16 h-16 text-gray-400 mb-2" 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path 
								strokeLinecap="round" 
								strokeLinejoin="round" 
								strokeWidth={1.5} 
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
							/>
						</svg>
						<span className="text-gray-500 text-sm font-medium">No Photo Available</span>
					</div>
				)}
				
				{/* Rating Display */}
				{hasRating ? (
					<>
						<div className="rating">
							<span className="translate-y-[1px]">{clinic.rating.toFixed(1)}</span> {procedure.star}
						</div>
						<div className="reviews">
							{procedure.reviews}
							<span className="translate-y-[1px]">{clinic.reviewCount} Reviews</span>
						</div>
					</>
				) : (
					<div className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs py-1 px-3 rounded-full font-medium">
						No reviews yet
					</div>
				)}
				
				{/* Clinic Category Badge */}
				{clinic.clinicCategory && (
					<div className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded-full font-medium">
						{clinic.clinicCategory}
					</div>
				)}
			</div>

			{/* Clinic Info */}
			<div className="p-4 flex-1 flex flex-col">
				{/* Clinic Name */}
				<div className="mb-3">
					<Link 
						to={clinicUrl}
						className="hover:text-primary transition-colors"
					>
						<h5 className="name text-lg leading-tight line-clamp-2 font-bold">
							{clinic.clinicName}
						</h5>
					</Link>
				</div>
				
				{/* Location */}
				<div className="location text-xs flex items-center mb-3">
					<strong className="mr-1">{procedure.mapmarker2}</strong>
					<span>
						{clinic.city || "Location unavailable"}
						{clinic.state && `, `}
						{clinic.state && (
							<strong className="text-primary font-black">
								{clinic.state}
							</strong>
						)}
					</span>
				</div>

				{/* Procedures List */}
				<div className="flex-1 mb-3">
					<div className="text-xs font-bold mb-2 text-gray-700">
						Featured Procedures:
					</div>
					<div className="space-y-1.5">
						{displayProcedures.map((proc) => (
							<Link
								key={proc.procedureId}
								to={`${clinicUrl}?openCategory=${encodeURIComponent(proc.category)}`}
								className="flex justify-between items-center text-xs hover:bg-gray-50 p-1.5 rounded transition-colors group/proc"
								onClick={(e) => e.stopPropagation()}
							>
								<span className="font-medium text-gray-800 group-hover/proc:text-primary truncate flex-1 pr-2">
									{proc.procedureName}
								</span>
								<span className="text-primary font-bold whitespace-nowrap">
									{formatPrice(proc.price)}
								</span>
							</Link>
						))}
					</div>
				</div>

				{/* View Clinic Button */}
				<div className="mt-auto">
					<Link 
						className="btn btn-sm w-full text-xs py-2 flex items-center justify-center gap-1" 
						to={clinicUrl}
					>
						View Clinic {procedure.arrowLink}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SearchResultCard;

