import React from "react";
import { cn } from "../../../utils/cn";
import AccordionCard from "./AccordionCard";

/**
 * WorkingHours Component
 * Displays clinic working hours with current day highlighted
 * Shows open/closed status
 * Wrapped in accordion, starts collapsed
 */
const WorkingHours = ({ workingHours, isOpenNow }) => {
	if (!workingHours) {
		return null;
	}

	// Get current day for highlighting
	const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

	// Days of the week in order
	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	return (
		<AccordionCard title="Hours">
			<div className="flex items-center justify-between mb-4">
				{isOpenNow !== null && (
					<span className={cn("text-sm font-medium", {
						"text-[#1DAE57]": isOpenNow,
						"text-red-500": !isOpenNow
					})}>
						{isOpenNow ? "Open Now" : "Closed"}
					</span>
				)}
			</div>
			
			<div className="space-y-2">
				{daysOfWeek.map((day) => {
					const hours = workingHours[day];
					const isToday = day === currentDay;
					
					return (
						<div 
							key={day} 
							className={cn(
								"flex justify-between text-sm py-1 px-2 rounded",
								{
									"bg-primary bg-opacity-10 font-medium": isToday,
								}
							)}
						>
							<span className={cn({ "font-semibold": isToday })}>
								{day}
							</span>
							<span className={cn("text-black text-opacity-70", { "font-semibold text-opacity-100": isToday })}>
								{hours || 'Closed'}
							</span>
						</div>
					);
				})}
			</div>
		</AccordionCard>
	);
};

export default React.memo(WorkingHours);

