import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { icons } from "../../../components/Icons";
import { Next, Prev } from "../../../components/Slidericons";
import AccordionCard from "./AccordionCard";

/**
 * ReviewsForCosmetics Component
 * Displays Google reviews for a clinic in a carousel
 */
const ReviewsForCosmetics = ({ reviews, clinicName, totalReviewCount }) => {
	const [swiper, setSwiper] = useState(null);
	const [active, setActive] = useState(0);
	
	const slidePrev = () => swiper?.slidePrev();
	const slideNext = () => swiper?.slideNext();

	// Parse reviews if it's a JSON string
	const parsedReviews = React.useMemo(() => {
		if (!reviews) return [];
		if (typeof reviews === 'string') {
			try {
				return JSON.parse(reviews);
			} catch (error) {
				console.error('Error parsing reviews:', error);
				return [];
			}
		}
		return Array.isArray(reviews) ? reviews : [];
	}, [reviews]);

	// Don't render if no reviews
	if (parsedReviews.length === 0) {
		return null;
	}

	// Show first 5 reviews
	const displayReviews = parsedReviews.slice(0, 5);

	return (
		<AccordionCard className="px-0" title={`Reviews for ${clinicName || 'This Clinic'}`}>
			<div className="slider--wrapper mx-0">
				<div className="px-5 relative">
					<Swiper
						onSwiper={setSwiper}
						onSlideChange={(swiper) => setActive(swiper.activeIndex)}
						breakpoints={{
							0: {
								slidesPerView: 1,
								spaceBetween: 12,
							},
							768: {
								slidesPerView: 2,
								spaceBetween: 16,
							},
							1024: {
								slidesPerView: 3,
								spaceBetween: 24,
							},
						}}
					>
						{displayReviews.map((review, index) => (
							<SwiperSlide key={`${review.author}-${index}`}>
								<ReviewCard review={review} />
							</SwiperSlide>
						))}
					</Swiper>
					{active !== 0 && (
						<button
							type="button"
							className="slide-btn left-4"
							onClick={slidePrev}
							aria-label="Previous review"
						>
							<Prev />
						</button>
					)}
					{displayReviews.length > 1 && active < displayReviews.length - 1 && (
						<button
							type="button"
							className="slide-btn right-4"
							onClick={slideNext}
							aria-label="Next review"
						>
							<Next />
						</button>
					)}
				</div>
			</div>
			{totalReviewCount && totalReviewCount > 5 && (
				<p className="text-sm text-gray-600 mt-4 text-center px-5">
					Showing {displayReviews.length} of {totalReviewCount.toLocaleString()} reviews
				</p>
			)}
		</AccordionCard>
	);
};

/**
 * ReviewCard Component
 * Displays a single review
 */
const ReviewCard = ({ review }) => {
	const { author, rating, text, relativeTime } = review;

	// Truncate text to fit the card - increased to show more content
	const maxLength = 250;
	const displayText = text && text.length > maxLength
		? text.substring(0, maxLength) + '...' 
		: text;

	// Generate stars based on rating
	const renderStars = () => {
		return [...Array(5)].map((_, i) => (
			<span key={i} className={i < rating ? '' : 'opacity-30'}>
				{icons.star}
			</span>
		));
	};

	return (
		<div className="review-card h-full flex flex-col">
			<div className="mb-2">
				<h3 className="name mb-[3px]">{author}</h3>
				<p className="text text-opacity-40 font-light text-[9.5px]">{relativeTime}</p>
			</div>
			<div className="review-card-bottom">
				{rating.toFixed(1)}{" "}
				<div className="flex items-center gap-[2px] svg-sm">
					{renderStars()}
				</div>
			</div>
			<p className="review-card-quote flex-grow text-sm leading-relaxed">
				{displayText}
			</p>
		</div>
	);
};

export default ReviewsForCosmetics;
