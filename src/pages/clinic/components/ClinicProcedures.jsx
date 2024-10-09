import React, { useState } from "react";
import { clinicIcons } from "../../../components/Icons";

const ClinicProcedures = ({ selectedData, setSelectedData }) => {
	return (
		<div>
			<div className="clinic-procedure">
				<h5 className="text-[22px]">Procedures</h5>
				<div className="subtext">
					City average for breast procedures are{" "}
					<span className="underline font-extrabold">$6,800.00</span>
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<ClinicProcedureTable
					data={data_list}
					name="Breast"
					selectedData={selectedData}
					setSelectedData={setSelectedData}
				/>
				<ClinicProcedureTable
					data={data_list2}
					name="Body"
					selectedData={selectedData}
					setSelectedData={setSelectedData}
				/>
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

	return (
		<>
			<div className="procedure-table-card">
				<div className="name">{name}</div>
				<div className="procedure-table-card-name">
					<span>Procedure</span>
					<span className="sm:mx-auto">Clinic Price Estimate</span>
				</div>
				<div className="">
					<table className="table">
						<tbody>
							{data.map((item) => (
								<tr key={item.id}>
									<td>
										<div className="capitalize">{item.name}</div>
									</td>
									<td className="text-right text-black text-opacity-70">
										${item.price?.toFixed(2)}
									</td>
									<td className="md:px-2">
										<div className="flex justify-end">
											{addedData.includes(item) ? (
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

const data_list = [
	{ id: "breast-1", name: "breast augmentation", price: 5000 },
	{ id: "breast-2", name: "breast reduction", price: 3450 },
	{ id: "breast-3", name: "breast lift", price: 2800 },
	{ id: "breast-4", name: "mastopexy augmentation", price: 4999.99 },
];
const data_list2 = [
	{ id: "body-1", name: "breast augmentation", price: 8000 },
	{ id: "body-2", name: "breast reduction", price: 3900 },
	{ id: "body-3", name: "breast lift", price: 2090.99 },
	{ id: "body-4", name: "mastopexy augmentation", price: 1800.39 },
];

export default ClinicProcedures;
