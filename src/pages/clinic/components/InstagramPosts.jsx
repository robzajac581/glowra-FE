import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { clinicIcons } from "../../../components/Icons";
import { cn } from "../../../utils/cn";
import AccordionCard from "./AccordionCard";

const InstagramPosts = () => {
	return (
		<AccordionCard className={"px-0"} title="Instagram Posts">
			<div className="slider--wrapper mx-0">
				<div className="px-5">
					<Swiper
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
								<div className="insta-post group">
									<div className="insta-post-top">
										<div className="img">
											<img
												src={"/img/instagram/insta-logo.png"}
												className="w-7"
												alt=""
											/>
											<div className="text-dark">Glowra</div>
										</div>
										<button type="button" className="text-[#CDCECE]">
											Follow
										</button>
									</div>
									<div className="insta-post-middle">
										<img
											src={item.img}
											className="w-full rounded-[10px]"
											alt=""
										/>
										<Link
											to="https://www.instagram.com/glowra/"
											className={cn("arrow")}
										>
											{clinicIcons.arrowTopLink}
										</Link>
									</div>
									<div className="insta-post-footer">
										<button
											type="button"
											className="flex items-center gap-[2px]"
										>
											{clinicIcons.heart}
											{item.like}
										</button>
										<button
											type="button"
											className="flex items-center gap-[2px]"
										>
											{clinicIcons.comment}
											{item.comment}
										</button>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</AccordionCard>
	);
};

const data = [
	{
		img: "/img/instagram/1.png",
		like: "45",
		comment: "8",
	},
	{
		img: "/img/instagram/2.png",
		like: "165",
		comment: "9",
	},
	{
		img: "/img/instagram/3.png",
		like: "254",
		comment: "16",
	},
];

export default InstagramPosts;
