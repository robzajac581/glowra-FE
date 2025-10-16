/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useMemo } from "react";
import { clinicIcons } from "../../../components/Icons";
import AccordionCard from "./AccordionCard";

const Location = ({ clinicInfo }) => {
	// Build full address from clinic data
	const fullAddress = useMemo(() => {
		if (!clinicInfo) return '';
		
		const parts = [
			clinicInfo.Address,
			clinicInfo.City,
			clinicInfo.State,
			clinicInfo.ZipCode
		].filter(Boolean);
		
		return parts.join(', ');
	}, [clinicInfo]);

	// Generate Google Maps embed URL with the clinic's address
	const mapEmbedUrl = useMemo(() => {
		if (!fullAddress) return '';
		
		// Encode the address for the URL
		const encodedAddress = encodeURIComponent(fullAddress);
		return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`;
	}, [fullAddress]);

	// If we don't have an address, don't render the component
	if (!fullAddress) {
		return null;
	}

	return (
		<AccordionCard title="Location">
			<iframe
				src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
				height="280"
				className="w-full rounded-lg border-none mb-6"
			></iframe>
			<div className="text-sm text-black flex items-center gap-3">
				{clinicIcons.mapmarker}
				<div className="w-0 flex-grow">
					{fullAddress}
				</div>
			</div>
		</AccordionCard>
	);
};
export default Location;
