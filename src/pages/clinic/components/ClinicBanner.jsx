import React from "react";
import { procedure } from "../../../components/Icons";
import { cn } from "../../../utils/cn";

const ClinicBanner = () => {
	return (
		<div className="">
			<div className="clinic-banner">
				<div className="clinic-banner-media">
					<img src="/img/clinic-logo.png" className="img" alt="" />
					<div className="w-0 flex-grow">
						<h3 className="text-4xl mb-3">Bayside Cosmetics</h3>
						<div className="text-black text-opacity-70">
							<div className="mb-1">
								The Best in Specialized Cosmetic Surgery
							</div>
							<div className="flex items-center text-xs text-black">
								<span className="text-[#1DAE57]">Open now</span>{" "}
								<span className="close-dot"></span>
								<span>Close 8pm</span>
							</div>
						</div>
					</div>
				</div>
				<Rating className="hidden md:flex" />
			</div>
			<h5 className="text-lg mb-[22px]">
				Doctors who work at Bayside Cosmetics:
			</h5>
			<div className="doc-list">
				{data.map((item, index) => (
					<div className="item" key={index}>
						<img src={item.img} className="img" alt="" />
						<div>
							<h5 className="name">{item.name}</h5>
							<div className="designation">{item.designation}</div>
						</div>
					</div>
				))}
			</div>
			<Rating className="md:hidden" />
		</div>
	);
};
const Rating = ({ className }) => {
	return (
		<>
			<div
				className={cn("flex text-dark text-sm rating mt-5", {
					[className]: className,
				})}
			>
				{procedure.star}
				{procedure.star}
				{procedure.star}
				{procedure.star}
				{procedure.star}
				<span>(4,039 reviews)</span>
			</div>
		</>
	);
};
const data = [
	{
		img: "/img/doctor/2.png",
		name: "Dr. Janet Lo",
		designation: "Internist",
	},
	{
		img: "/img/doctor/1.png",
		name: "Dr. Janet Lo",
		designation: "Dermatologist",
	},
	{
		img: "/img/doctor/3.png",
		name: "Dr. Janet Lo",
		designation: "Dermatologist",
	},
	{
		img: "/img/doctor/4.png",
		name: "Dr. Janet Lo",
		designation: "Internist",
	},
];

export default ClinicBanner;
