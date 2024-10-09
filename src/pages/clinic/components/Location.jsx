/* eslint-disable jsx-a11y/iframe-has-title */
import React from "react";
import { clinicIcons } from "../../../components/Icons";
import AccordionCard from "./AccordionCard";

const Location = () => {
	return (
		<AccordionCard title="Location">
			<iframe
				src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6927.766840845827!2d-78.87093983058382!3d33.71042352082711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x890068e96cb49e2f%3A0x9c5c6c8a9422c770!2s615%2029th%20Ave%20N%2C%20Myrtle%20Beach%2C%20SC%2029577%2C%20USA!5e0!3m2!1sen!2sbd!4v1721948775781!5m2!1sen!2sbd"
				height="280"
				className="w-full rounded-lg border-none mb-6"
			></iframe>
			<div className="text-sm text-black flex items-center gap-3">
				{clinicIcons.mapmarker}
				<div className="w-0 flex-grow">
					615 29th Avenue North, Myrtle Beach, SC 29577
				</div>
			</div>
		</AccordionCard>
	);
};
export default Location;
