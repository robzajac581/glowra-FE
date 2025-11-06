import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { icons } from "../../../components/Icons";
import { Next, Prev } from "../../../components/Slidericons";
import AccordionCard from "./AccordionCard";

/**
 * ReviewsForCosmetics Component
 * Displays Google reviews for a clinic in a carousel
 */
const ReviewsForCosmetics = ({ reviews, clinicName, totalReviewCount, reviewsLink }) => {
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
		<AccordionCard id="reviews" className="px-0" title={`Reviews for ${clinicName || 'This Clinic'}`}>
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
		{totalReviewCount && totalReviewCount > 5 && reviewsLink && (
			<div className="mt-6 text-center px-5">
				<a 
					href={reviewsLink}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-black font-medium rounded-lg border border-black transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
					</svg>
					See more reviews on Google
				</a>
			</div>
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
