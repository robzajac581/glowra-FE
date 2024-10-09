import { Collapse } from "@material-tailwind/react";
import React, { useState } from "react";
import { clinicIcons } from "../../../components/Icons";
import { cn } from "../../../utils/cn";

const AccordionCard = ({ title, className, children }) => {
	const [open, setOpen] = useState(true);
	return (
		<div
			className={cn("accordion-card", {
				[className]: className,
			})}
		>
			<button
				type="button"
				className={cn("accordion-card-button", {
					"px-5": className === "px-0",
				})}
				onClick={() => setOpen(!open)}
			>
				<span>{title}</span>
				<span
					className={cn("", {
						"transform rotate-180": open,
					})}
				>
					{clinicIcons.angledown}
				</span>
			</button>
			<Collapse open={open}>
				<div>
					<div className="pb-4">{children}</div>
				</div>
			</Collapse>
		</div>
	);
};

export default AccordionCard;
