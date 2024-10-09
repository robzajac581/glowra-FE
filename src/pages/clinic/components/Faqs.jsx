import { Collapse } from "@material-tailwind/react";
import React, { useState } from "react";
import { clinicIcons } from "../../../components/Icons";
import { cn } from "../../../utils/cn";
import AccordionCard from "./AccordionCard";

const Faqs = () => {
	const [open, setOpen] = useState(1);
	return (
		<AccordionCard title="FAQs">
			<div className="flex flex-col gap-3">
				{data.map((item, index) => (
					<div
						className={cn("faq-item", {
							"border-primary": open === index,
							"bg-section": open !== index,
						})}
						key={index}
					>
						<button
							className={cn("button")}
							onClick={() => setOpen(open === index ? null : index)}
						>
							<span>{item.question}</span>
							<span className="text-[#1E3644] text-opacity-50">
								{open !== index ? clinicIcons.plus : clinicIcons.minus}
							</span>
						</button>
						<Collapse open={open === index}>
							<div>
								<div className="text">{item.answer}</div>
							</div>
						</Collapse>
					</div>
				))}
			</div>
		</AccordionCard>
	);
};

const data = [
	{
		question: "Can I change my plan later?",
		answer:
			"Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
	},
	{
		question: "Is there a free trial available?",
		answer:
			"Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
	},
	{
		question: "Can other info be added to an invoice?",
		answer:
			"Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
	},
	{
		question: "How does billing work?",
		answer:
			"Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
	},
	{
		question: "How do I change my account email?",
		answer:
			"Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
	},
];

export default Faqs;
