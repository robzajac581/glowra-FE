import React from "react";
import { Link } from "react-router-dom";
import { icons } from "../../../components/Icons";

/**
 * LocalDoctorsCard Component
 * Displays a clinic card with rating, review, and consultation CTA
 * Used in the "Book with Local Doctors" section on the homepage
 */
const LocalDoctorsCard = ({ clinic }) => {
	if (!clinic) return null;

	const {
		clinicId,
		clinicName,
		city,
		state,
		rating,
		reviewCount,
		photoURL,
		featuredReview,
		review // Fallback in case the API uses 'review' instead of 'featuredReview'
	} = clinic;

	// Use either featuredReview or review field
	const displayReview = featuredReview || review;

	// Construct clinic URL
	const clinicUrl = `/clinic/${clinicId}`;

	// Format location display
	const locationDisplay = [city, state].filter(Boolean).join(", ");

	/**
	 * Normalize clinic name capitalization
	 * - Keep acronyms with periods (like R.A.M) all caps
	 * - Convert other all-caps words to title case (JOSEPH -> Joseph)
	 */
	const normalizeClinicName = (name) => {
		if (!name) return "";
		
		return name.split(' ').map(word => {
			// If word contains periods, it's likely an acronym - keep it as is
			if (word.includes('.')) {
				return word;
			}
			
			// If word is all caps and longer than 1 character, convert to title case
			if (word === word.toUpperCase() && word.length > 1) {
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}
			
			// Otherwise keep as is
			return word;
		}).join(' ');
	};

	const displayName = normalizeClinicName(clinicName);

	// Render star rating
	const renderStars = () => {
		const fullStars = Math.floor(rating);
		return [...Array(5)].map((_, i) => (
			<span key={i} className={`inline-flex ${i < fullStars ? '' : 'opacity-30'}`}>
				{icons.star}
			</span>
		));
	};

	// Use clinic photo or fallback to placeholder
	const displayPhoto = photoURL || "/img/client/1.png";

	// Truncate review text to fit card (approximately 250 chars for ~5 lines)
	const truncateText = (text, maxLength = 250) => {
		if (!text) return "";
		if (text.length <= maxLength) return text;
		// Find the last space before maxLength to avoid cutting words
		const truncated = text.substring(0, maxLength);
		const lastSpace = truncated.lastIndexOf(' ');
		return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength).trim() + " ...";
	};

	return (
		<div className="client-card flex flex-col h-full">
			<div className="flex items-center gap-4 mb-4">
				<img
					src={displayPhoto}
					alt={displayName}
					className="w-[76px] h-[76px] rounded-full object-cover flex-shrink-0"
					onError={(e) => {
						// Fallback to placeholder if image fails to load
						e.target.src = "/img/client/1.png";
					}}
				/>
				<div className="flex-grow min-w-0">
					<h3 className="text-[26px] mb-[3px] leading-tight line-clamp-2 min-h-[60px]">
						{displayName}
					</h3>
					<p className="text-base text-dark text-opacity-70 mb-[3px]">
						Medical Aesthetics Clinic
					</p>
					{locationDisplay && (
						<p className="text-base text-dark text-opacity-40 font-light">
							{locationDisplay}
						</p>
					)}
				</div>
			</div>
			
			<div className="client-card-rating !mt-4">
				{rating.toFixed(2)}{" "}
				<div className="flex items-center gap-[2px]">
					{renderStars()}
				</div>{" "}
				({reviewCount?.toLocaleString() || 0} reviews)
			</div>
			
			{/* Review text with fixed height for alignment */}
			<div className="flex-grow mb-4 min-h-[120px]">
				{displayReview && displayReview.text ? (
					<p className="client-quote line-clamp-5">
						{truncateText(displayReview.text, 250)}
					</p>
				) : (
					<p className="client-quote text-opacity-50">
						Highly rated clinic with exceptional service.
					</p>
				)}
			</div>
			
			{/* Push this section to bottom */}
			<div className="mt-auto">
				<div className="client-schedule mb-4">
					{icons.calendar}{" "}
					<span className="w-0 flex-grow self-center">
						Appointments Available
					</span>
				</div>
				
				<Link to={clinicUrl} className="btn w-full px-2">
					Request a Consultation
				</Link>
			</div>
		</div>
	);
};

export default LocalDoctorsCard;

