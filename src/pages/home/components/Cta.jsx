import React from "react";
import { Link } from "react-router-dom";

const Cta = () => {
	return (
		<section className="bg-black">
			<div className="cta-grid">
				<div className="cta-grid-inner">
					<div className="cta-grid-inner-content">
						<h2 className="title">Why book with Glowra?</h2>
						<p className="text">
							Find the right specialist for your procedure to see the
							best results. Access exclusive promotions and read real
							reviews from patients like you.
						</p>
						<Link to="" className="btn">
							Request a Consultation
						</Link>
					</div>
				</div>
				<div>
					<img
						src="/img/cta.png"
						className="w-full h-full object-cover"
						alt=""
					/>
				</div>
			</div>
		</section>
	);
};

export default Cta;
