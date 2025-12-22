import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = ({ submissionResult, clinicName, onListAnother }) => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      {/* Success Icon */}
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">
        ✅ Submission Received!
      </h1>

      {/* Thank You Message */}
      <p className="text-xl text-text mb-8">
        Thank you for listing {clinicName || 'your clinic'}
      </p>

      {/* Info Box */}
      <div className="bg-gray-50 border border-border rounded-lg p-8 mb-8 text-left">
        <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
        
        <ol className="space-y-3">
          <li className="flex items-start">
            <span className="font-semibold mr-3">1.</span>
            <span>Our team will review your submission (1-2 business days)</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-3">2.</span>
            <span>We may reach out if we need additional information</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-3">3.</span>
            <span>Once approved, your clinic will appear on Glowra</span>
          </li>
        </ol>

        {submissionResult?.submissionId && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-text">
              Submission ID: <span className="font-mono font-semibold">#{submissionResult.submissionId}</span>
            </p>
          </div>
        )}

        {submissionResult?.duplicateWarning && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
              ⚠️ {submissionResult.duplicateWarning.message}. We'll verify and reach out if needed.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onListAnother}
          className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-medium"
        >
          List Another Clinic
        </button>
        
        <button
          onClick={handleReturnHome}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

export default Success;

