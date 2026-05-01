import React, { useState } from "react";
import ConsultationRequestModal from "../../../components/ConsultationRequestModal";
import ConsultationRequestForm from "../../../components/ConsultationRequestForm";
import useScreen from "../../../hooks/useScreen";
import ProcedurePriceStack from "../../../components/ProcedurePriceStack";
import { formatClinicPriceEstimate } from "../../../utils/clinicPriceDisplay";
import { getProcedureDisplayName } from "../../../utils/procedureDisplayName";

const ClinicRightSidebar = ({ selectedData, clinicInfo, clinicId, procedures }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const screenWidth = useScreen();
  const isMobile = screenWidth < 1024; // lg breakpoint
  
  // Calculate total price (numeric sum; totals omit per-unit suffixes)
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
              {visibleProcedures.map((item) => (
                <div key={item.id || item.procedureId} className="flex items-start justify-between gap-2 text-xs">
                  <span className="text-gray-700 truncate flex-1 min-w-0 normal-case">
                    {getProcedureDisplayName(item)}
                  </span>
                  <div className="text-gray-900 flex-shrink-0 text-right">
                    <ProcedurePriceStack
                      item={item}
                      mainClassName="text-xs font-semibold text-gray-900"
                      unitClassName="text-[10px] text-gray-600 font-medium"
                    />
                  </div>
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
                  {formatClinicPriceEstimate(totalPrice)}
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