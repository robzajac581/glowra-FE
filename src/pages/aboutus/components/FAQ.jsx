import React from "react";

const FAQ = () => {
	const faqs = [
		{
			question: "Is Glowra free for consumers?",
			answer: "Yes—browsing and comparing clinics is free.",
		},
		{
			question: "How do clinics appear on Glowra?",
			answer: "Clinics can be added by our team or request a listing by emailing list@glowra.com. We verify core details before profiles go live.",
		},
		{
			question: "Do you book appointments?",
			answer: "We enable consultation requests; clinics handle scheduling directly.",
		},
	];

	return (
		<section className="bg-white py-12 md:py-16 lg:py-20 border-b border-gray-100">
			<div className="container">
				<h2 className="text-[36px] lg:text-[44px] xl:text-[52px] leading-[1.2] mb-8 lg:mb-12 font-Louize">
					FAQ
				</h2>
				<div className="space-y-6 max-w-[900px]">
					{faqs.map((faq, index) => (
						<div key={index}>
							<h3 className="text-[15px] lg:text-[16px] font-Avenir font-black text-[#AA89E0] mb-2">
								{faq.question}
							</h3>
							<p className="text-[14px] lg:text-[15px] leading-[1.7] text-black text-opacity-70 font-Avenir font-light">
								{faq.answer}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FAQ;

