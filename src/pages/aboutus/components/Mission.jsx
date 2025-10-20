import React from "react";

const Mission = () => {
	return (
		<section className="bg-white py-12 md:py-16 lg:py-20">
			<div className="container">
				<div className="grid md:grid-cols-2 grid-cols-1 gap-12 lg:gap-20 items-start">
					{/* Left side - Content */}
					<div>
						<h2 className="text-[36px] lg:text-[44px] xl:text-[52px] leading-[1.2] mb-6 lg:mb-7 font-Louize">
							Our Mission
						</h2>
						<p className="text-[15px] lg:text-[17px] leading-[1.7] text-black text-opacity-70 mb-10 lg:mb-12 font-Avenir font-light">
							Make cosmetic care easier to understand and easier to choose—by
							putting honesty, clarity, and modern design at the center of the
							experience.
						</p>

						<div className="mb-10 lg:mb-12">
							<h3 className="text-[17px] lg:text-[18px] font-Avenir font-black text-[#AA89E0] mb-5">
								What we believe
							</h3>
							<ul className="space-y-4 text-[14px] lg:text-[15px] leading-[1.7] text-black text-opacity-70 font-Avenir list-disc list-inside">
								<li>
									<strong className="text-black font-black">Clarity builds trust.</strong> Clear pricing and plain language beat fine print.
								</li>
								<li>
									<strong className="text-black font-black">Choice should feel easy.</strong> Compare options side-by-side without the
									back-and-forth.
								</li>
								<li>
									<strong className="text-black font-black">Real voices matter.</strong> Genuine reviews and transparent details help
									everyone make better decisions.
								</li>
								<li>
									<strong className="text-black font-black">Access is the point.</strong> Finding the right fit should be fast, fair, and
									frictionless.
								</li>
							</ul>
						</div>

						<div>
							<h3 className="text-[17px] lg:text-[18px] font-Avenir font-black text-[#AA89E0] mb-3">
								Get in touch
							</h3>
							<p className="text-[14px] lg:text-[15px] leading-[1.7] text-black text-opacity-70 font-Avenir font-light mb-2">
								Questions, ideas, partnerships, or listing requests—reach us anytime:
							</p>
							<p className="text-[14px] lg:text-[15px] leading-[1.7] text-black text-opacity-70 font-Avenir font-light">
								<a href="mailto:list@glowra.com" className="text-[#AA89E0] hover:underline">
									list@glowra.com
								</a>
								{" • "}
								<a href="mailto:support@glowra.com" className="text-[#AA89E0] hover:underline">
									support@glowra.com
								</a>
							</p>
						</div>
					</div>

					{/* Right side - Image */}
					<div className="md:mt-0 mt-8">
						<img
							src="/img/About Us/photo1.png"
							alt="Professional care"
							className="w-full rounded-[20px] object-cover"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Mission;

