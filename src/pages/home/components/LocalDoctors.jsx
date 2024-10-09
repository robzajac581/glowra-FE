import React from "react";
import { Link } from "react-router-dom";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { icons } from "../../../components/Icons";
import useScreen from "../../../hooks/useScreen";

const LocalDoctors = () => {
	const screen = useScreen();
	return (
		<section className="local-doctor">
			<div className="container">
				<h2 className="local-doctor-title">Book with Local Doctors</h2>
				<div className="local-doctor-text">
					Top-rated primary care doctors with 90% of patients giving them
					5-star ratings
					<span className="hidden md:inline">
						. Known for their exceptional service, attentive care, and
						medical expertise, they are highly recommended for outstanding
						medical care.
					</span>
				</div>
				{screen >= 1024 ? (
					<div className="grid grid-cols-3 gap-5 xl:gap-10">
						{data.map((item) => (
							<React.Fragment key={item.id}>
								<ClientCard {...item} />
							</React.Fragment>
						))}
					</div>
				) : (
					<div className="drop-shadow-md">
						<Swiper
							spaceBetween={40}
							modules={[Pagination, A11y]}
							pagination={{ clickable: true }}
						>
							{data.map((item) => (
								<SwiperSlide key={item.id}>
									<ClientCard {...item} />
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				)}
			</div>
			<img src="/img/client/left-shape.png" className="shape-1" alt="" />
			<img src="/img/client/right-shape.png" className="shape-2" alt="" />
		</section>
	);
};
const ClientCard = ({ img, name, designation, location, quote }) => {
	return (
		<div className="client-card">
			<div className="flex items-center gap-4">
				<img
					src={img}
					alt={name}
					className="w-[76px] h-[76px] rounded-full"
				/>
				<div>
					<h3 className="text-[26px] mb-[3px]">{name}</h3>
					<p className="text-base text-dark text-opacity-70 mb-[3px]">
						{designation}
					</p>
					<p className="text-base text-dark text-opacity-40 font-light">
						{location}
					</p>
				</div>
			</div>
			<div className="client-card-rating">
				4.82{" "}
				<div className="flex items-center gap-[2px]">
					{icons.star}
					{icons.star}
					{icons.star}
					{icons.star}
					{icons.star}
				</div>{" "}
				(4,039 reviews)
			</div>
			<p className="client-quote">{quote}</p>
			<div className="client-schedule">
				{icons.calendar}{" "}
				<span className="w-0 flex-grow self-center">
					Appointments Available Tomorrow
				</span>
			</div>
			<Link to="" className="btn mt-[45px] w-full px-2">
				Request a Consultation
			</Link>
		</div>
	);
};
const data = [
	{
		id: 1,
		img: "/img/client/1.png",
		name: "Bayside Cosmetics",
		designation: "Primary Care Doctor",
		location: "Chicago, IL",
		quote: "I recently visited Dr. Samantha Johnson for a check-up and was thoroughly impressed. The staff was friendly and efficient, and ...",
	},
	{
		id: 2,
		img: "/img/client/2.png",
		name: "Bayside Cosmetics",
		designation: "Primary Care Doctor",
		location: "Chicago, IL",
		quote: "I recently visited Dr. Samantha Johnson for a check-up and was thoroughly impressed. The staff was friendly and efficient, and ...",
	},
	{
		id: 3,
		img: "/img/client/3.png",
		name: "Bayside Cosmetics",
		designation: "Primary Care Doctor",
		location: "Chicago, IL",
		quote: "I recently visited Dr. Samantha Johnson for a check-up and was thoroughly impressed. The staff was friendly and efficient, and ...",
	},
];

export default LocalDoctors;
