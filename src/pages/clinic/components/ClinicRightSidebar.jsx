import React from "react";

const ClinicRightSidebar = ({ selectedData, clinicInfo }) => {
  // Format price to USD currency string
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Calculate total price
  const totalPrice = selectedData.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="clinic-sidebar sticky top-4">
      <div className="clinic-sidebar-card">
        <h4 className="text-xl font-medium mb-4">Your Selected Procedures</h4>
        
        {selectedData.length === 0 ? (
          <p className="text-gray-500 py-4">
            No procedures selected. Add procedures from the list to create your plan.
          </p>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {selectedData.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center py-3 border-t border-gray-200">
              <span className="font-semibold">Total Estimate:</span>
              <span className="font-bold text-xl text-primary">{formatPrice(totalPrice)}</span>
            </div>
            
            <button className="btn w-full mt-4">
              Request Consultation
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClinicRightSidebar;