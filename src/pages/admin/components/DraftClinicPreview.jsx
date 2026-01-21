import React, { useState, useMemo } from 'react';
import ClinicBanner from '../../clinic/components/ClinicBanner';
import Gallery from '../../clinic/components/Gallery';
import ClinicProcedures from '../../clinic/components/ClinicProcedures';
import About from '../../clinic/components/About';
import WorkingHours from '../../clinic/components/WorkingHours';
import ReviewsForCosmetics from '../../clinic/components/ReviewsForCosmetics';
import Location from '../../clinic/components/Location';
import { useClinicData } from '../../../hooks/useClinicData';
import {
  transformClinicInfo,
  transformProviders,
  transformProcedures,
  transformPhotos,
} from '../utils/draftToClinicFormat';

/**
 * DraftClinicPreview Component
 * Renders a preview of a clinic draft using the actual clinic page components.
 * Matches the layout and styling of the real clinic page for accurate preview.
 */
const DraftClinicPreview = ({
  draft,
  existingClinic,
  photoSource,
  ratingSource,
  manualRating,
  manualReviewCount,
}) => {
  // State for selected procedures (read-only in preview)
  const [selectedData, setSelectedData] = useState([]);

  // Transform draft data to clinic component format
  const clinicInfo = useMemo(() => {
    return transformClinicInfo(draft, {
      ratingSource,
      manualRating,
      manualReviewCount,
    });
  }, [draft, ratingSource, manualRating, manualReviewCount]);

  const providers = useMemo(() => {
    return transformProviders(draft.providers);
  }, [draft.providers]);

  const procedures = useMemo(() => {
    return transformProcedures(draft.procedures);
  }, [draft.procedures]);

  const photos = useMemo(() => {
    return transformPhotos(draft.photos, photoSource);
  }, [draft.photos, photoSource]);

  // Use the clinic data hook for working hours parsing
  const {
    workingHours,
    isOpenNow,
    closingTime,
    logo,
  } = useClinicData(clinicInfo);

  // Use logo from clinicInfo if available, otherwise fall back to hook result
  const displayLogo = clinicInfo?.logo || logo;

  const isAdjustment = draft.submissionFlow === 'add_to_existing';

  return (
    <div className="draft-clinic-preview">
      {/* Preview Mode Indicator */}
      <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm text-amber-800 font-medium">
          Preview Mode — This is how the clinic page will appear after approval
          {isAdjustment && ' (with proposed changes)'}
        </span>
      </div>

      {/* Main Content - Matches Clinic.jsx layout */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-6 lg:p-10">
          <div className="flex flex-wrap gap-10">
            {/* Left Column (2/3) */}
            <div className="w-full lg:w-1/2 flex-grow">
              <div className="flex flex-col gap-6">
                <ClinicBanner
                  clinicInfo={clinicInfo}
                  providers={providers}
                  requiresConsultRequest={false}
                  consultMessage={null}
                  logo={displayLogo}
                  isOpenNow={isOpenNow}
                  closingTime={closingTime}
                />

                <Gallery
                  photos={photos}
                  clinicName={clinicInfo?.clinicName}
                />

                <ClinicProcedures
                  procedures={procedures}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                />

                <About
                  description={clinicInfo?.description}
                  clinicName={clinicInfo?.clinicName}
                />

                <WorkingHours
                  workingHours={workingHours}
                  isOpenNow={isOpenNow}
                />

                <ReviewsForCosmetics
                  reviews={clinicInfo?.googleReviewsJSON}
                  clinicName={clinicInfo?.clinicName}
                  totalReviewCount={clinicInfo?.googleReviewCount}
                  reviewsLink={clinicInfo?.reviewsLink}
                />

                <Location clinicInfo={clinicInfo} />
              </div>
            </div>

            {/* Right Column (1/3) - Sidebar */}
            <div className="w-full lg:w-1/4 flex-grow xl:max-w-[400px]">
              <PreviewSidebar
                clinicInfo={clinicInfo}
                selectedData={selectedData}
                procedures={procedures}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * PreviewSidebar Component
 * A simplified version of ClinicRightSidebar that shows the consultation form
 * but disables actual submission in preview mode.
 */
const PreviewSidebar = ({ clinicInfo, selectedData, procedures }) => {
  // Format price with tilde prefix
  const formatPrice = (price) => {
    return '~' + new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total estimate
  const totalEstimate = selectedData.reduce((sum, item) => sum + item.price, 0);

  // Get all procedure types offered by clinic
  const procedureTypes = procedures ? Object.keys(procedures) : [];

  return (
    <div className="clinic-sidebar sticky top-4">
      <div className="clinic-sidebar-card relative">
        {/* Preview Overlay Indicator */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">
          Preview Only
        </div>

        <h4 className="text-xl font-medium mb-4">Request a consultation</h4>
        <p className="text-sm text-gray-600 mb-4">
          * Prices are estimates and may vary based on surgeon expertise, location, and individual procedure needs. Please request a consult for a personalized quote
        </p>

        {/* Patient Status Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-white border-2 border-primary text-primary cursor-default"
            disabled
          >
            New patient
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 border-2 border-transparent text-gray-600 cursor-default"
            disabled
          >
            Returning patient
          </button>
        </div>

        {/* Estimate Overview */}
        {selectedData.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-primary mb-3" style={{ fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
              Estimate Overview
            </h5>
            <div className="space-y-2 mb-3">
              {selectedData.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-800">{item.name}</span>
                  <span className="font-medium text-black">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-300">
              <span className="font-bold text-black">Price Estimate:</span>
              <span className="font-bold text-lg text-black">{formatPrice(totalEstimate)}</span>
            </div>
          </div>
        )}

        {/* Form Fields (disabled) */}
        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              disabled
              className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none cursor-not-allowed opacity-60"
            />
          </div>

          {/* Procedure Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Procedure Type</label>
            <select
              disabled
              className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none cursor-not-allowed opacity-60 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="">Select procedure type</option>
              {procedureTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Enter your Email"
              disabled
              className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none cursor-not-allowed opacity-60"
            />
          </div>

          {/* Optional Fields Link */}
          <button
            type="button"
            disabled
            className="flex items-center gap-2 text-sm text-primary opacity-60 cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Add optional information
          </button>

          {/* Submit Button (disabled) */}
          <button
            type="button"
            disabled
            className="w-full h-12 bg-black text-white rounded-lg font-medium text-base opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
          >
            Request a consultation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftClinicPreview;

