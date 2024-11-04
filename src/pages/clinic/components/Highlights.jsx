import React from "react";
import { highlightIcons } from "../../../components/highlightIcons";
import AccordionCard from "./AccordionCard";
const Highlights = () => {
	return (
		<AccordionCard title="Highlight">
			<div className="acc-grid">
				{data.map((item) => (
					<React.Fragment key={item.id}>
						<div className="flex items-start gap-3">
							{item.icons}
							<div className="w-0 flex-grow">
								<h5 className="font-medium font-Avenir mb-[2px]">
									{item.title}
								</h5>
								<div className="text">{item.text}</div>
							</div>
						</div>
					</React.Fragment>
				))}
			</div>
		</AccordionCard>
	);
};
const data = [
	{
		id: 1,
		icons: highlightIcons.satisfaction,
		title: "Excellent Patient Satisfaction",
		text: "Your Journey to Confidence Starts Here. Experience the GlowUp Difference.",
	},
	{
		id: 2,
		icons: highlightIcons.waittimes,
		title: "Minimal Wait Times",
		text: "Our streamlined appointment process ensures you get in and out quickly.",
	},
	{
		id: 3,
		icons: highlightIcons.technologies,
		title: "Advanced Techniques",
		text: "Our approach leverages cutting-edge techniques to achieve your desired results.",
	},
	{
		id: 4,
		icons: highlightIcons.waittimes2,
		title: "Personal Treatment",
		text: "We understand that beauty is unique. That's why at Glowra, we prioritize a personalized approach.",
	},
];

export default Highlights;
