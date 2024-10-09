import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Next, Prev } from "../../../components/Slidericons";

const Gallery = () => {
	const [swiper, setSwiper] = useState(null);
	const [active, setActive] = useState(0);
	const slidePrev = () => swiper.slidePrev();
	const slideNext = () => swiper.slideNext();

	return (
		<div>
			<div className="slider--wrapper">
				<div className="px-3 md:px-0 relative">
					<Swiper
						onSwiper={setSwiper}
						onSlideChange={(swiper) => setActive(swiper.activeIndex)}
						onEnded={(swiper) => setActive(data.length - 1)}
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
						{data.map((item, index) => (
							<SwiperSlide key={index}>
								<div className="relative rounded-[10px] overflow-hidden">
									<img
										src={item.img}
										className="w-full rounded-[10px]"
										alt=""
									/>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
					{active != 0 && (
						<button
							type="button"
							className="slide-btn left-4"
							onClick={slidePrev}
						>
							<Prev />
						</button>
					)}
					{active != data.length - 1 && (
						<button
							type="button"
							className="slide-btn right-4"
							onClick={slideNext}
						>
							<Next />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

const data = [
	{
		img: "/img/clinic/1.png",
	},
	{
		img: "/img/clinic/2.png",
	},
	{
		img: "/img/clinic/3.png",
	},
	{
		img: "/img/clinic/4.png",
	},
];

export default Gallery;
