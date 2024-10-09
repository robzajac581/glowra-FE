import React from "react";
import AccordionCard from "./AccordionCard";

const About = () => {
	return (
		<AccordionCard title="About">
			<div className="about-text">
				<div>
					At GlowUp, we believe beauty is a journey, and yours starts with
					a personalized approach. We don't offer a one-size-fits-all
					solution. During your in-depth consultation, our experienced
					professionals will listen to your unique goals and concerns to
					craft a customized Botox treatment plan.
				</div>
				<div>
					We utilize the latest, most effective Botox injection methods to
					achieve natural-looking results with minimal discomfort. Our team
					is passionate about staying at the forefront of aesthetic
					advancements, ensuring you receive the most precise and
					comfortable experience possible.
				</div>
			</div>
		</AccordionCard>
	);
};
export default About;
