import React, { useState } from "react";
import ConsultationRequestModal from "../../../components/ConsultationRequestModal";
import ConsultationRequestForm from "../../../components/ConsultationRequestForm";
import useScreen from "../../../hooks/useScreen";

const ClinicRightSidebar = ({ selectedData, clinicInfo, clinicId, procedures }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const screenWidth = useScreen();
  const isMobile = screenWidth < 1024; // lg breakpoint
  
  // Format price to USD currency string with tilde prefix
  const formatPrice = (price) => {
    return '~' + new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total price
  const totalPrice = selectedData.reduce((sum, item) => sum + item.price, 0);
  const hasSelectedProcedures = selectedData.length > 0;
  
  // For mobile sticky bar: show max 3 procedures
  const maxProceduresToShow = 3;
  const visibleProcedures = selectedData.slice(0, maxProceduresToShow);
  const hasMoreProcedures = selectedData.length > maxProceduresToShow;
  const remainingCount = selectedData.length - maxProceduresToShow;

  return (
    <>
      {/* Desktop Sidebar - Inline Form */}
      <div id="consultation-request-section" className="hidden lg:block clinic-sidebar sticky top-4">
        <ConsultationRequestForm 
          clinicId={clinicId}
          clinicInfo={clinicInfo}
          selectedData={selectedData}
          procedures={procedures}
        />
      </div>

      {/* Mobile Sticky Bottom Bar - Only shows when procedures are selected */}
      {isMobile && hasSelectedProcedures && (
        <div 
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <div className="container mx-auto px-4 py-2.5">
            {/* Procedures List - Compact */}
            <div className="mb-2 space-y-1 max-h-20 overflow-hidden">
              {visibleProcedures.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-gray-700 truncate flex-1 min-w-0">
                    {item.name}
                  </span>
                  <span className="text-gray-900 font-semibold whitespace-nowrap flex-shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
              {hasMoreProcedures && (
                <div className="text-xs text-gray-500 italic">
                  +{remainingCount} more procedure{remainingCount !== 1 ? 's' : ''}...
                </div>
              )}
            </div>
            
            {/* Total and Button Row */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5 font-medium">Total Estimate</div>
                <div className="font-bold text-lg text-primary whitespace-nowrap">
                  {formatPrice(totalPrice)}
                </div>
              </div>
              <button 
                className="btn flex-shrink-0 px-4 sm:px-6 whitespace-nowrap shadow-md hover:shadow-lg transition-shadow text-sm sm:text-base"
                onClick={() => setIsModalOpen(true)}
              >
                Review inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full Sidebar - Only shows when no procedures are selected */}
      {isMobile && !hasSelectedProcedures && (
        <div id="consultation-request-section" className="lg:hidden">
          <div className="clinic-sidebar-card">
            <h4 className="text-xl font-medium mb-4">Your Selected Procedures</h4>
            <p className="text-gray-500 py-4">
              No procedures selected. Add procedures from the list to create your plan.
            </p>
          </div>
        </div>
      )}
      
      <ConsultationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clinicId={clinicId}
        clinicInfo={clinicInfo}
        selectedData={selectedData}
        procedures={procedures}
      />
    </>
  );
};

export default ClinicRightSidebar;