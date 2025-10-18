import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Next, Prev } from "../../../components/Slidericons";

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
 * Gallery Component
 * Displays clinic photos from new Photos API
 * Falls back to placeholder images if no photos available
 */
const Gallery = ({ photos, clinicName }) => {
	const [swiper, setSwiper] = useState(null);
	const [active, setActive] = useState(0);
	const slidePrev = () => swiper.slidePrev();
	const slideNext = () => swiper.slideNext();

	// Normalize clinic name to title case
	const displayName = toTitleCase(clinicName);

	// Use API photos or fallback to placeholder images
	const displayPhotos = photos && photos.length > 0 ? photos : null;
	const useFallback = !displayPhotos;

	// Don't render if no photos available
	if (!displayPhotos && !useFallback) {
		return null;
	}

	return (
		<div>
			<div className="slider--wrapper">
				<div className="px-3 md:px-0 relative">
					<Swiper
						onSwiper={setSwiper}
						onSlideChange={(swiper) => setActive(swiper.activeIndex)}
						onEnded={(swiper) => setActive((useFallback ? fallbackImages : displayPhotos).length - 1)}
						breakpoints={{
							0: {
								slidesPerView: 1.4,
								spaceBetween: 12,
							},
							500: {
								slidesPerView: 1.4,
								spaceBetween: 12,
							},
							768: {
								slidesPerView: 3,
								spaceBetween: 12,
							},
						}}
					>
						{useFallback ? (
							// Render fallback images if no photos from API
							fallbackImages.map((photo, index) => (
								<SwiperSlide key={index}>
									<div className="relative rounded-[10px] overflow-hidden aspect-[4/3]">
										<img
											src={photo}
											className="w-full h-full object-cover rounded-[10px]"
											alt={`${displayName || 'Clinic'} - Photo ${index + 1}`}
											loading={index < 2 ? "eager" : "lazy"}
										/>
									</div>
								</SwiperSlide>
							))
						) : (
							// Render photos from new API
							displayPhotos.map((photo, index) => (
								<SwiperSlide key={photo.photoId || index}>
									<div className="relative rounded-[10px] overflow-hidden aspect-[4/3]">
										<img
											src={photo.urls?.medium || photo.url}
											className="w-full h-full object-cover rounded-[10px]"
											alt={`${displayName || 'Clinic'} - Photo ${index + 1}`}
											width={photo.width}
											height={photo.height}
											loading={index < 2 ? "eager" : "lazy"}
											referrerPolicy="no-referrer"
											onError={(e) => {
												e.target.onerror = null;
												// Use fallback image on error
												e.target.src = fallbackImages[index % fallbackImages.length];
											}}
										/>
									</div>
								</SwiperSlide>
							))
						)}
					</Swiper>
					{active !== 0 && (
						<button
							type="button"
							className="slide-btn left-4"
							onClick={slidePrev}
							aria-label="Previous image"
						>
							<Prev />
						</button>
					)}
					{active !== (useFallback ? fallbackImages : displayPhotos).length - 1 && (
						<button
							type="button"
							className="slide-btn right-4"
							onClick={slideNext}
							aria-label="Next image"
						>
							<Next />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

// Fallback images if no Google Places photos available
const fallbackImages = [
	"/img/clinic/1.png",
	"/img/clinic/2.png",
	"/img/clinic/3.png",
	"/img/clinic/4.png",
];

export default React.memo(Gallery);
