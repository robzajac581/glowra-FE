// ClinicProcedures.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { clinicIcons } from "../../../components/Icons";

const ClinicProcedures = ({ procedures, selectedData, setSelectedData }) => {
	const location = useLocation();
	const [expandedCategories, setExpandedCategories] = useState({});
	const [highlightedProcedureId, setHighlightedProcedureId] = useState(null);
	const proceduresSectionRef = useRef(null);

	// Initialize expanded state based on search query
	useEffect(() => {
		// Only run if procedures data is available
		if (!procedures || Object.keys(procedures).length === 0) {
			return;
		}

		const searchParams = new URLSearchParams(location.search);
		const category = searchParams.get('category');
		const openCategory = searchParams.get('openCategory');
		const searchQuery = searchParams.get('searchQuery');
		
		const searchTerm = (openCategory || category || searchQuery || '').toLowerCase().trim();
		
		const initialState = {};
		Object.keys(procedures).forEach((categoryName) => {
			if (searchTerm) {
				// If there's a search term, only expand matching categories
				initialState[categoryName] = categoryName.toLowerCase() === searchTerm;
			} else {
				// Otherwise, expand all categories by default
				initialState[categoryName] = true;
			}
		});
		
		setExpandedCategories(initialState);
	}, [procedures, location.search]);

	// Handle auto-add procedure from search results and scroll to section
	useEffect(() => {
		if (!procedures || Object.keys(procedures).length === 0) {
			return;
		}

		const searchParams = new URLSearchParams(location.search);
		const procedureName = searchParams.get('procedureName');
		const autoAdd = searchParams.get('autoAdd');
		const openCategory = searchParams.get('openCategory');
		
		if (procedureName && autoAdd === 'true') {
			// Find the procedure in the procedures object by name + category
			// (IDs differ between search-index and clinic procedures endpoints)
			let foundProcedure = null;
			
			Object.entries(procedures).forEach(([category, data]) => {
				const procedure = data.procedures.find(proc => {
					const procName = proc.name || proc.procedureName;
					// Match by name and category
					return procName === procedureName && category === openCategory;
				});
				if (procedure) {
					foundProcedure = procedure;
				}
			});
			
			if (foundProcedure) {
				// Handle both id and procedureId field names for compatibility
				const foundProcId = foundProcedure.id || foundProcedure.procedureId;
				const foundProcName = foundProcedure.name || foundProcedure.procedureName;
				
				// Add procedure to selected data using the setter function
				// Check for duplicates by name since IDs may differ
				setSelectedData(prev => {
					const isAlreadySelected = prev.some(item => {
						const itemName = item.name || item.procedureName;
						return itemName === foundProcName;
					});
					if (isAlreadySelected) {
						return prev;
					}
					return [...prev, foundProcedure];
				});
				
				// Highlight the added procedure
				setHighlightedProcedureId(foundProcId);
				
				// Scroll to the procedures section after a short delay to ensure DOM is ready
				setTimeout(() => {
					if (proceduresSectionRef.current) {
						proceduresSectionRef.current.scrollIntoView({ 
							behavior: 'smooth',
							block: 'start'
						});
					}
				}, 300);
				
				// Remove highlight after animation completes
				setTimeout(() => {
					setHighlightedProcedureId(null);
				}, 2000);
			}
		}
	}, [procedures, location.search, setSelectedData]);

	// Check if procedures data is available
	if (!procedures || Object.keys(procedures).length === 0) {
		return (
			<div className="p-4 border rounded">
				<h5 className="text-[22px] mb-2">Procedures</h5>
				<p className="text-gray-500">No procedure information available for this clinic.</p>
			</div>
		);
	}

	const toggleCategory = (categoryName) => {
		setExpandedCategories(prev => ({
			...prev,
			[categoryName]: !prev[categoryName]
		}));
	};

	return (
		<div ref={proceduresSectionRef}>
			<div className="clinic-procedure">
				<h5 className="text-[22px]">Procedures</h5>
			</div>
			<div className="flex flex-col gap-4">
				{Object.entries(procedures).map(([category, data]) => (
					<ClinicProcedureTable
						key={category}
						data={data.procedures}
						name={category}
						selectedData={selectedData}
						setSelectedData={setSelectedData}
						isExpanded={expandedCategories[category] || false}
						onToggle={() => toggleCategory(category)}
						highlightedProcedureId={highlightedProcedureId}
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
	isExpanded,
	onToggle,
	highlightedProcedureId,
}) => {
	const [addedData, setAddedData] = useState([]);
	const [animatingIds, setAnimatingIds] = useState([]);

	// Sync addedData with selectedData from parent
	// This ensures the UI reflects procedures added from external sources (like auto-add from search)
	useEffect(() => {
		// Find procedures in this table that are in selectedData
		// Match by name since IDs may differ between endpoints
		const relevantProcedures = data.filter(proc => {
			const procName = proc.name || proc.procedureName;
			return selectedData.some(selected => {
				const selectedName = selected.name || selected.procedureName;
				return selectedName === procName;
			});
		});
		
		setAddedData(relevantProcedures);
	}, [selectedData, data]);

	const handleAdd = (arg) => {
		// Handle both id and procedureId field names for compatibility
		const argId = arg.id || arg.procedureId;
		const argName = arg.name || arg.procedureName;
		
		// Check if already added in selectedData (source of truth) by name
		const isAlreadyAdded = selectedData.find((item) => {
			const itemName = item.name || item.procedureName;
			return itemName === argName;
		});
		if (isAlreadyAdded) return;
		
		// Add animation state
		setAnimatingIds(prev => [...prev, argId]);
		
		// Remove animation after 400ms
		setTimeout(() => {
			setAnimatingIds(prev => prev.filter(id => id !== argId));
		}, 400);
		
		// Update both local and parent state
		setAddedData((addedData) => [
			...addedData,
			...data.filter((item) => {
				const itemName = item.name || item.procedureName;
				return itemName === argName;
			}),
		]);
		setSelectedData((selectedData) => [...selectedData, arg]);
	};

	const handleRemove = (itemToRemove) => {
		// Match by name since IDs may differ between endpoints
		const nameToRemove = itemToRemove.name || itemToRemove.procedureName;
		
		setAddedData((addedData) => addedData.filter((item) => {
			const itemName = item.name || item.procedureName;
			return itemName !== nameToRemove;
		}));
		setSelectedData((selectedData) =>
			selectedData.filter((item) => {
				const itemName = item.name || item.procedureName;
				return itemName !== nameToRemove;
			})
		);
	};

	// Formatting functions with tilde prefix
	const formatPrice = (price) => {
		return '~' + new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	return (
		<>
			<div className="procedure-table-card">
				<div 
					className="name cursor-pointer select-none flex items-center justify-between"
					onClick={onToggle}
				>
					<span>{name}</span>
					<svg 
						className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
				
				{isExpanded && (
					<>
						<div className="procedure-table-card-name">
							<span>Procedure</span>
							<span>Clinic Price Estimate</span>
							<span></span>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full procedure-pricing-table">
								<tbody>
									{data.map((item) => {
										// Handle both id and procedureId field names for compatibility
										const itemId = item.id || item.procedureId;
										const isHighlighted = highlightedProcedureId === itemId;
										return (
										<tr 
											key={itemId} 
											className={`border-b border-gray-100 last:border-0 transition-all duration-500 ${
												isHighlighted 
													? 'bg-primary bg-opacity-10 animate-pulse' 
													: ''
											}`}
										>
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
													{addedData.find(added => {
														const addedName = added.name || added.procedureName;
														const itemName = item.name || item.procedureName;
														return addedName === itemName;
													}) ? (
														<button
															type="button"
															className={`table-btn table-btn-2 group transition-all duration-300 ${
																animatingIds.includes(itemId) ? 'scale-105 ring-2 ring-primary ring-opacity-50' : ''
															}`}
															onClick={() => handleRemove(item)}
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
															className={`table-btn transition-all duration-200 active:scale-95 ${
																animatingIds.includes(itemId) ? 'scale-95 opacity-70' : 'hover:scale-105'
															}`}
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
									);
									})}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default ClinicProcedures;