// ClinicProcedures.jsx
import React, { useState, useEffect } from 'react';
import { clinicIcons } from '../../../components/Icons';

const API_BASE_URL = 'http://localhost:3001';


const ClinicProcedures = ({ clinicId, selectedData, setSelectedData }) => {
    const [procedures, setProcedures] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProcedures = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/procedures`);
                if (!response.ok) throw new Error('Failed to fetch procedures');
                const data = await response.json();
                setProcedures(data);
            } catch (err) {
                console.error('Error fetching procedures:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProcedures();
    }, [clinicId]);

    if (loading) return <div>Loading procedures...</div>;

    return (
        <div>
            <div className="clinic-procedure">
                <h5 className="text-[22px]">Procedures</h5>
                {/* TODO: Implement city average price comparison */}
                <div className="subtext">
                    City average for breast procedures are{" "}
                    <span className="underline font-extrabold">$6,800.00</span>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {Object.entries(procedures).map(([category, data]) => (
                    <ClinicProcedureTable
                        key={data.categoryId}
                        name={category}
                        data={data.procedures}
                        selectedData={selectedData}
                        setSelectedData={setSelectedData}
                    />
                ))}
            </div>
        </div>
    );
};

const ClinicProcedureTable = ({ name, data, selectedData, setSelectedData }) => {
    const [addedData, setAddedData] = useState([]);

    const handleAdd = (procedure) => {
        if (addedData.find(item => item.id === procedure.id)) return;
        setAddedData(prev => [...prev, procedure]);
        setSelectedData(prev => [...prev, procedure]);
    };

    const handleRemove = (id) => {
        setAddedData(prev => prev.filter(item => item.id !== id));
        setSelectedData(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="procedure-table-card">
            <div className="name">{name}</div>
            <div className="procedure-table-card-name">
                <span>Procedure</span>
                <span className="sm:mx-auto">Clinic Price Estimate</span>
            </div>
            <div className="">
                <table className="table">
                    <tbody>
                        {data.map((procedure) => (
                            <tr key={procedure.id}>
                                <td>
                                    <div className="capitalize">{procedure.name}</div>
                                </td>
                                <td className="text-right text-black text-opacity-70">
                                    ${procedure.price.toFixed(2)}
                                </td>
                                <td className="md:px-2">
                                    <div className="flex justify-end">
                                        {addedData.find(item => item.id === procedure.id) ? (
                                            <button
                                                type="button"
                                                className="table-btn table-btn-2 group"
                                                onClick={() => handleRemove(procedure.id)}
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
                                                onClick={() => handleAdd(procedure)}
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
    );
};

export default ClinicProcedures;