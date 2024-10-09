import React, { useState } from "react";
import { clinicIcons } from "../../../components/Icons";

const SpecialOffers = ({ selectedData, setSelectedData }) => {
	const [addedData, setAddedData] = useState([]);

	const handleClick = (arg) => {
		if (addedData.find((item) => item.id === arg.id)) return;
		setAddedData((addedData) => [
			...addedData,
			...offers.filter((item) => item.id === arg.id),
		]);
		setSelectedData((selectedData) => [
			...selectedData,
			{
				id: arg.id,
				name: arg.name,
				price: arg.offerPrice,
			},
		]);
	};

	const handleRemove = (id) => {
		setAddedData((addedData) => addedData.filter((item) => item.id !== id));
		setSelectedData((selectedData) =>
			selectedData.filter((item) => item.id !== id)
		);
	};

	return (
		<div className="special-offer">
			<div className="special-offer-top">
				<h5 className="title">Special Offers</h5>
				<div className="text">
					Ends in:{" "}
					<span className="text-dark underline">4h & 59 minutes</span>
				</div>
			</div>
			<div className="flex flex-col gap-3">
				{offers.map((offer, index) => (
					<div key={offer.id} className="offer-card">
						<div className="text-dark">{offer.name}</div>
						<div className="flex flex-wrap items-center gap-3">
							<div className="text-dark">
								<span className="line-through text-[#4A4B50] text-xs">
									${offer.price?.toFixed(2)}
								</span>{" "}
								<span className="text-normal font-medium">
									~${offer.offerPrice?.toFixed(2)}
								</span>
							</div>
							{addedData.includes(offer) ? (
								<button
									className="table-btn w-20 group table-btn-2 min-w-0"
									onClick={() => handleRemove(offer.id)}
								>
									<div className="group-hover:hidden">Added</div>
									<div className="hidden group-hover:block">
										Remove
									</div>
								</button>
							) : (
								<button
									className="offer-card-add"
									onClick={() => handleClick(offer)}
								>
									{clinicIcons.plus} Add
								</button>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const offers = [
	{
		id: "offer-1",
		name: "Botox",
		price: 339.0,
		offerPrice: 99.99,
	},
	{
		id: "offer-2",
		name: "Rhinoplasty",
		price: 250.99,
		offerPrice: 150.0,
	},
];

export default SpecialOffers;
