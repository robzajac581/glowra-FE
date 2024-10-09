import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomInput from "../../../components/CustomInput";
import { clinicIcons } from "../../../components/Icons";

const ClinicRightSidebar = ({ selectedData }) => {
	const [newPatient, setNewPatient] = useState(true);
	const [submitted, setSubmitted] = useState(false);
	const [procedureType, setProcedureType] = useState(procedure_type[0].value);

	const [totalPrice, setTotalPrice] = useState(0);

	const handleSubmit = (e) => {
		e.preventDefault();
		setSubmitted(true);
	};

	useEffect(() => {
		setTotalPrice(selectedData.reduce((acc, item) => acc + item.price, 0));
	}, [selectedData]);

	return submitted ? (
		<div className="submitted-card">
			<div className="py-20">
				<h5 className="text-2xl mb-2">Your request has been submitted!</h5>
				<div className="text">
					Thank you for your interest. Bayside Cosmetics will reach out to
					you directly via email.
				</div>
				<Link to="/procedures">
					Find more clinics {clinicIcons.angleRight}
				</Link>
			</div>
		</div>
	) : (
		<div className="right-form">
			<h5 className="text-2xl mb-5">Request a consultation</h5>
			<form onSubmit={handleSubmit}>
				<div className="tab-menu mb-4">
					<button
						type="button"
						className={`tab-link ${newPatient ? "active" : ""}`}
						onClick={() => setNewPatient(true)}
					>
						{clinicIcons.check}
						New patient
					</button>
					<button
						type="button"
						className={`tab-link ${newPatient ? "" : "active"}`}
						onClick={() => setNewPatient(false)}
					>
						{clinicIcons.check}
						Returning patient
					</button>
				</div>
				<div className="flex flex-col gap-3">
					<CustomInput label="Name" placeholder="Enter your name" />
					<CustomInput
						value={procedureType}
						onChange={setProcedureType}
						label="Procedure Type"
						options={procedure_type}
					/>
					<CustomInput label="Email" placeholder="Enter your Email" />
					<CustomInput
						label="Notes"
						placeholder="Any additional info for the provider"
					/>
					<button className="btn submit" type="submit">
						Request a consultation {clinicIcons.arrowLink}
					</button>
				</div>
			</form>
			<div className="apply-info">
				{selectedData?.length > 0 && (
					<>
						<div className="apply-info-inner">
							<div className="info-item uppercase text-dark2 text-xs">
								<span>Items</span>
								<span className="text-normal">Price</span>
							</div>
							{selectedData.map((item, index) => (
								<div className="info-item" key={item}>
									<span>{item.name}</span>
									<span className="text-normal">
										~${item.price?.toFixed(2)}
									</span>
								</div>
							))}
						</div>
						<div className="py-3 px-4 text-sm font-black text-dark flex justify-between">
							<span>Cost estimate:</span>
							<span>~${totalPrice?.toFixed(2)}</span>
						</div>
						<div className="text-[13px] text-black text-opacity-70 px-4 pb-3 leading-[1.5]">
							* Prices are estimates and may vary based on surgeon
							expertise, location, and individual procedure needs. Please
							request a consult for a personalized quote
						</div>
					</>
				)}
			</div>
		</div>
	);
};
const procedure_type = [
	{
		label: "Botox",
		value: "Botox",
	},
	{
		label: "Fillers",
		value: "Fillers",
	},
	{
		label: "Laser Hair Removal",
		value: "Laser Hair Removal",
	},
	{
		label: "Liposuction",
		value: "Liposuction",
	},
	{
		label: "Rhinoplasty",
		value: "Rhinoplasty",
	},
	{
		label: "Tummy Tuck",
		value: "Tummy Tuck",
	},
];
export default ClinicRightSidebar;
