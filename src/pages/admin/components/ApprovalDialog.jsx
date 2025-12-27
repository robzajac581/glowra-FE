import React, { useState } from 'react';

const ApprovalDialog = ({ draft, photoSource, ratingSource, onConfirm, onCancel }) => {
  const [isApproving, setIsApproving] = useState(false);

  const handleConfirm = async () => {
    setIsApproving(true);
    await onConfirm();
    setIsApproving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-slide-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">Approve Clinic?</h2>
          <p className="text-text">
            This will publish <strong>{draft.clinicName}</strong> to Glowra.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm">
          <h3 className="font-semibold text-dark mb-2">Approval Settings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text">Photo Source:</span>
              <span className="font-medium capitalize">{photoSource}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text">Rating Source:</span>
              <span className="font-medium capitalize">{ratingSource}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text">Providers:</span>
              <span className="font-medium">{draft.providers?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text">Procedures:</span>
              <span className="font-medium">{draft.procedures?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isApproving}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isApproving}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDialog;

