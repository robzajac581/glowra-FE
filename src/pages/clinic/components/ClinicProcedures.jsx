// ClinicProcedures.jsx
import React, { useState } from "react";
import { clinicIcons } from "../../../components/Icons";

const ClinicProcedures = ({ procedures, selectedData, setSelectedData }) => {
	// Check if procedures data is available
	if (!procedures || Object.keys(procedures).length === 0) {
		return (
			<div className="p-4 border rounded">
				<h5 className="text-[22px] mb-2">Procedures</h5>
				<p className="text-gray-500">No procedure information available for this clinic.</p>
			</div>
		);
	}

	return (
		<div>
			<div className="clinic-procedure">
				<h5 className="text-[22px]">Procedures</h5>
				<div className="subtext">
					City average for procedures are calculated based on location
				</div>
			</div>
			<div className="flex flex-col gap-4">
				{Object.entries(procedures).map(([category, data]) => (
					<ClinicProcedureTable
						key={category}
						data={data.procedures}
						name={category}
						selectedData={selectedData}
						setSelectedData={setSelectedData}
					/>
				))}
			</div>
		</div>
	);
};

const ClinicProcedureTable = ({
	name,
	data,
	selectedData,
	setSelectedData,
}) => {
	const [addedData, setAddedData] = useState([]);

	const handleAdd = (arg) => {
		if (addedData.find((item) => item.id === arg.id)) return;
		setAddedData((addedData) => [
			...addedData,
			...data.filter((item) => item.id === arg.id),
		]);
		setSelectedData((selectedData) => [...selectedData, arg]);
	};

	const handleRemove = (id) => {
		setAddedData((addedData) => addedData.filter((item) => item.id !== id));
		setSelectedData((selectedData) =>
			selectedData.filter((item) => item.id !== id)
		);
	};

	// Formatting functions
	const formatPrice = (price) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	return (
		<>
			<div className="procedure-table-card">
				<div className="name">{name}</div>
				<div className="procedure-table-card-name">
					<span>Procedure</span>
					<span>Clinic Price Estimate</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full procedure-pricing-table">
						<tbody>
							{data.map((item) => (
								<tr key={item.id} className="border-b border-gray-100 last:border-0">
									<td className="procedure-name-cell py-2">
										<div 
											className="procedure-name-text font-normal text-sm" 
											title={item.name}
										>
											{item.name}
										</div>
									</td>
									<td className="price-cell py-2">
										<span className="text-sm font-medium text-black">
											{formatPrice(item.price)}+
										</span>
									</td>
									<td className="action-cell py-2 pl-2">
										<div className="flex justify-end">
											{addedData.find(added => added.id === item.id) ? (
												<button
													type="button"
													className="table-btn table-btn-2 group"
													onClick={() => handleRemove(item.id)}
												>
													<div className="flex items-center gap-1 group-hover:hidden">
														{clinicIcons.check}
														<span>Added</span>
													</div>
													<div className="hidden group-hover:block">
														Remove
													</div>
												</button>
											) : (
												<button
													type="button"
													className="table-btn"
													onClick={() => handleAdd(item)}
												>
													{clinicIcons.plus}
													<span>
														Add{" "}
														<span className="hidden md:inline-block">
															to plan
														</span>
													</span>
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default ClinicProcedures;