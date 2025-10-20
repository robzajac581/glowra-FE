import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
	return (
		<section className="relative bg-[#D5BFF5] py-12 md:py-20 lg:py-24 overflow-hidden">
			{/* Background image blended in */}
			<div className="absolute inset-0 z-0 flex justify-end items-center">
				<div 
					className="h-full w-auto bg-cover bg-center opacity-20"
					style={{
						backgroundImage: "url('/img/About Us/woman-posing-with-trendy-hairstyle-side-view.jpg')",
						width: '45%',
						minWidth: '300px'
					}}
				/>
			</div>

			<div className="container relative z-10">
				<div className="grid md:grid-cols-2 grid-cols-1 gap-12 lg:gap-20 items-center">
					{/* Left side - Content */}
					<div>
						<h2 className="text-[32px] lg:text-[40px] xl:text-[48px] leading-[1.25] mb-8 lg:mb-10 font-Louize text-white">
							Find, Compare, And Choose The Right Cosmetic Clinic
						</h2>
						<Link
							to="/search"
							className="inline-flex items-center justify-center gap-2 bg-white text-black px-7 py-3 rounded-[10px] text-[15px] lg:text-[17px] font-Avenir font-medium hover:bg-opacity-90 transition-all duration-300 shadow-md"
						>
							<span>Start Your Search Now</span>
							<svg
								width="18"
								height="18"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7.5 15L12.5 10L7.5 5"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</Link>
					</div>

					{/* Right side - Spacer for layout balance */}
					<div className="hidden md:block"></div>
				</div>
			</div>
		</section>
	);
};

export default CTASection;

