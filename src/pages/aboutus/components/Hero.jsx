import React from "react";

const Hero = () => {
	return (
		<section className="bg-white py-12 md:py-20 lg:py-28">
			<div className="container">
				<div className="grid md:grid-cols-2 grid-cols-1 gap-12 lg:gap-20 items-center">
					{/* Left side - Image */}
					<div className="order-2 md:order-1 flex justify-center md:justify-start">
						<img
							src="/img/About Us/photo0.png"
							alt="Cosmetic care"
							className="w-full max-w-[500px] object-contain"
						/>
					</div>

					{/* Right side - Content */}
					<div className="order-1 md:order-2">
						<h2 className="text-[32px] lg:text-[40px] xl:text-[48px] leading-[1.2] mb-6 lg:mb-8 font-Louize">
							Transparent Cosmetic Care, Made Simple.
						</h2>
						<p className="text-[15px] lg:text-[17px] leading-[1.7] text-black text-opacity-70 font-Avenir font-light">
							<span className="text-[#AA89E0] font-medium">Glowra</span> brings real prices, real reviews, and real access together—so
							decisions feel clear, informed, and confident.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;

