import React, { useState } from 'react';

const RejectDialog = ({ draft, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleConfirm = async () => {
    setIsRejecting(true);
    await onConfirm(reason);
    setIsRejecting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-slide-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✗</span>
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">Reject Submission?</h2>
          <p className="text-text">
            This will reject <strong>{draft.clinicName}</strong>.
          </p>
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark mb-2">
            Rejection Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter a reason for rejection..."
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-text mt-2">
            This will be recorded for internal reference.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isRejecting}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isRejecting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isRejecting ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectDialog;

