// ClinicBanner.jsx
import React, { useState, useEffect } from 'react';
// import { procedure } from '../components/Icons';
// import { cn } from '../utils/cn';

const API_BASE_URL = 'http://localhost:3001';

const ClinicBanner = ({ clinicId, clinicData }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/providers`);
                if (!response.ok) throw new Error('Failed to fetch providers');
                const data = await response.json();
                setProviders(data);
            } catch (err) {
                console.error('Error fetching providers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [clinicId]);

    return (
        <div className="">
            <div className="clinic-banner">
                <div className="clinic-banner-media">
                    <img src="/img/clinic-logo.png" className="img" alt="" />
                    <div className="w-0 flex-grow">
                        <h3 className="text-4xl mb-3">{clinicData.ClinicName}</h3>
                        <div className="text-black text-opacity-70">
                            <div className="mb-1">
                                {/* TODO: Add clinic description/tagline to database */}
                                The Best in Specialized Cosmetic Surgery
                            </div>
                            <div className="flex items-center text-xs text-black">
                                {clinicData.isOpen && <span className="text-[#1DAE57]">Open now</span>}
                                <span className="close-dot"></span>
                                <span>Close {clinicData.closeTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <Rating className="hidden md:flex" rating={clinicData.rating} reviewCount={clinicData.reviewCount} /> */}
            </div>
            <h5 className="text-lg mb-[22px]">
                Doctors who work at {clinicData.ClinicName}:
            </h5>
            {!loading && (
                <div className="doc-list">
                    {providers.map((provider, index) => (
                        <div className="item" key={provider.ProviderID}>
                            <img src={provider.img} className="img" alt={provider.ProviderName} />
                            <div>
                                <h5 className="name">{provider.ProviderName}</h5>
                                <div className="designation">{provider.Specialty}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* <Rating className="md:hidden" rating={clinicData.rating} reviewCount={clinicData.reviewCount} /> */}
        </div>
    );
};

export default ClinicBanner;
