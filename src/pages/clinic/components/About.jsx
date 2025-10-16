import React from "react";
import AccordionCard from "./AccordionCard";

/**
 * About Component
 * Displays clinic description from Google Places data
 */
const About = ({ description, clinicName }) => {
	// DEBUG: Log props received
	console.log('=== ABOUT COMPONENT DEBUG ===');
	console.log('Description prop:', description);
	console.log('Clinic name:', clinicName);
	console.log('Description exists?', !!description);
	console.log('Description length:', description?.length);
	console.log('===========================');

	// Don't render if no description available
	if (!description) {
		console.warn('About component: No description provided, not rendering');
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
