import React from "react";
import AccordionCard from "./AccordionCard";

/**
 * About Component
 * Displays clinic description from Google Places data
 */
const About = ({ description, clinicName }) => {
	// Don't render if no description available
	if (!description) {
		return null;
	}

	return (
		<AccordionCard title={`About ${clinicName || 'This Clinic'}`}>
			<div className="about-text">
				<p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
					{description}
				</p>
			</div>
		</AccordionCard>
	);
};

export default React.memo(About);
