import React from "react";
import { Link } from "react-router-dom";
import { icons } from "../../../components/Icons";
import AccordionCard from "./AccordionCard";
const ReviewsForCosmetics = () => {
	return (
		<AccordionCard title="Reviews for Bayside Cosmetics">
			<div className="review-grid">
				{data.map((item) => (
					<React.Fragment key={item.id}>
						<ReviewCard {...item} />
					</React.Fragment>
				))}
			</div>
		</AccordionCard>
	);
};
const ReviewCard = ({ img, name, designation, location, quote }) => {
	return (
		<div className="review-card">
			<div className="review-card-top">
				<img src={img} alt={name} className="img" />
				<div>
					<h3 className="name">{name}</h3>
					<p className="text text-opacity-70 mb-[3px]">{designation}</p>
					<p className="text text-opacity-40 font-light">{location}</p>
				</div>
			</div>
			<div className="review-card-bottom">
				4.82{" "}
				<div className="flex items-center gap-[2px] svg-sm">
					{icons.star}
					{icons.star}
					{icons.star}
					{icons.star}
					{icons.star}
				</div>{" "}
				(4,039 reviews)
			</div>
			<p className="review-card-quote">{quote}</p>
			<Link to="" className="read">
				Read
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
		quote: "I recently visited Dr. Samantha Johnson for a check-up and was thoroughly impressed. The staff was friendly and efficient, d ...",
	},
	{
		id: 2,
		img: "/img/client/2.png",
		name: "Bayside Cosmetics",
		designation: "Primary Care Doctor",
		location: "Chicago, IL",
		quote: "I recently visited Dr. Samantha Johnson for a check-up and was thoroughly impressed. The staff was friendly and efficient, d ...",
	},
	{
		id: 3,
		img: "/img/client/3.png",
		name: "Bayside Cosmetics",
		designation: "Primary Care Doctor",
		location: "Chicago, IL",
		quote: "I recently visited Dr. Samantha Johnson for a check-up and was thoroughly impressed. The staff was friendly and efficient, d ...",
	},
];

export default ReviewsForCosmetics;
