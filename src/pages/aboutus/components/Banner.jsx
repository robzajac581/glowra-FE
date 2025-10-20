import React from "react";

const Banner = () => {
	return (
		<section className="relative bg-white py-8 md:py-12 lg:py-16 overflow-hidden">
			{/* Background image with opacity - flipped horizontally */}
			<div className="absolute inset-0 z-0">
				<img
					src="/img/About Us/woman-posing-studio-medium-shot.jpg"
					alt=""
					className="w-full h-full object-cover opacity-10 scale-x-[-1]"
				/>
			</div>
			
			{/* Content */}
			<div className="container relative z-10">
				<div className="text-center">
					<h1 className="font-Louize font-light text-[40px] md:text-[60px] lg:text-[80px] xl:text-[100px] leading-[0.9] tracking-tight">
						GLOWRA
					</h1>
				</div>
			</div>
		</section>
	);
};

export default Banner;

