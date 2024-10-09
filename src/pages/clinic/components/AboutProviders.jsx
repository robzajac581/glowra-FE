import React from "react";
import AccordionCard from "./AccordionCard";

const AboutProviders = () => {
	return (
		<AccordionCard title="About Our Providers">
			<div className="provider">
				{data?.map((item, index) => (
					<div className="" key={index}>
						<div className="provider-item">
							<img src={item.img} alt="" />
							<div className="w-0 flex-grow">
								<h5 className="name">{item.name}</h5>
								<div className="text">{item.designation}</div>
							</div>
						</div>
						<div className="bio">{item.bio}</div>
					</div>
				))}
			</div>
		</AccordionCard>
	);
};
const data = [
	{
		img: "/img/provider/1.png",
		name: "Dr. Janet Lo",
		designation: "Dermatologist",
		bio: "Dr. Levit is a Board Certified Dermatologist, who has had an additional three years of fellowship training in cosmetic and laser surgery. He has had additional 2 year fellowship in cosmetic dermatology performing and presenting nationally and internationally on procedures from laser resurfacing, liposuction, fat injections, face lifts, blepharoplasty, acne therapy and scar revisions.",
	},
	{
		img: "/img/provider/2.png",
		name: "Dr. Alia Richard",
		designation: "Internist",
		bio: "Dr. Levit is a Board Certified Dermatologist, who has had an additional three years of fellowship training in cosmetic and laser surgery. He has had additional 2 year fellowship in cosmetic dermatology performing and presenting nationally and internationally on procedures from laser resurfacing, liposuction, fat injections, face lifts, blepharoplasty, acne therapy and scar revisions.",
	},
];
export default AboutProviders;
