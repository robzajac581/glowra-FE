/* eslint-disable jsx-a11y/alt-text */
import React from "react";

const PaymentAccepted = () => {
	return (
		<div className="payment-accepted">
			<div className="name">Payments the Clinic Accepts</div>
			<div className="img">
				{data.map((item, index) => (
					<img className="max-w-full" src={item.img} />
				))}
			</div>
		</div>
	);
};

const data = [
	{
		img: "/img/payment/1.png",
	},
	{
		img: "/img/payment/2.png",
	},
	{
		img: "/img/payment/3.png",
	},
	{
		img: "/img/payment/4.png",
	},
	{
		img: "/img/payment/5.png",
	},
	{
		img: "/img/payment/6.png",
	},
];

export default PaymentAccepted;
