import React from "react";
import { Link } from "react-router-dom";
import { procedure } from "./Icons";

const ProcedureCard = ({ item, search }) => {
	return (
		<div className="procedure-card group">
			<Link to={`/clinic/${item.id}`} className="absolute z-[1] inset-0" />
			<div className="procedure-card-top">
				<img src={item.img} alt="" />
				<div className="rating">
					<span className="translate-y-[1px]">4.8</span> {procedure.star}
				</div>
				<div className="reviews">
					{procedure.reviews}
					<span className="translate-y-[1px]">
						{search ? "Reviews" : "Review Snippet"}
					</span>
				</div>
			</div>
			<div className="p-5">
				<h5 className="name">{item.name}</h5>
				<div className="text-sm">
					<div className="procedure-card-doc-info">
						<Link
							to="/clinic/1"
							className="text-primary font-extrabold relative z-10"
						>
							{item.doctor}
						</Link>
						<span>{item.doctorInfo}</span>
					</div>
					<div className="location mb-[10px]">
						<strong>{procedure.mapmarker2}</strong>
						<span>
							Midtown Manhattan,{" "}
							<strong className="text-primary font-black">
								New York
							</strong>
						</span>
					</div>
					<div className="location">
						<strong>{procedure.dollar2}</strong>
						<span>
							Starting at{" "}
							<strong className="text-primary font-black">$800</strong>
						</span>
					</div>
				</div>
				<Link className="btn" to="">
					View {procedure.arrowLink}
				</Link>
			</div>
		</div>
	);
};

export default ProcedureCard;
