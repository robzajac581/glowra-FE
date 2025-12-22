import React, { useState } from 'react';
import { cn } from '../../../utils/cn';

const ChooseAction = ({ onSelectFlow, submitterKey, setSubmitterKey }) => {
  const [showSubmitterKey, setShowSubmitterKey] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          List Your Clinic on Glowra
        </h1>
        <p className="text-text text-lg">
          Help patients find the best aesthetic treatments near them
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Add New Clinic */}
        <button
          onClick={() => onSelectFlow('new_clinic')}
          className="p-8 border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left"
        >
          <div className="text-4xl mb-4">➕</div>
          <h3 className="text-xl font-semibold mb-3">Add a New Clinic</h3>
          <p className="text-text mb-6">
            List a clinic that isn't on Glowra yet
          </p>
          <div className="inline-block px-6 py-2 bg-primary text-white rounded-lg">
            Start
          </div>
        </button>

        {/* Add to Existing Clinic */}
        <button
          onClick={() => onSelectFlow('add_to_existing')}
          className="p-8 border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left"
        >
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-3">Add to Existing</h3>
          <p className="text-text mb-6">
            Add providers, procedures to a clinic already listed
          </p>
          <div className="inline-block px-6 py-2 bg-primary text-white rounded-lg">
            Search
          </div>
        </button>
      </div>

      {/* Submitter Key (Optional) */}
      <div className="max-w-2xl mx-auto border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSubmitterKey(!showSubmitterKey)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm text-text">
            {showSubmitterKey ? '▾' : '▸'} Have a submitter key? (optional)
          </span>
        </button>
        
        {showSubmitterKey && (
          <div className="px-6 pb-6">
            <label className="block text-sm font-medium mb-2">
              Submitter Key
            </label>
            <input
              type="text"
              value={submitterKey}
              onChange={(e) => setSubmitterKey(e.target.value)}
              placeholder="Enter your submitter key"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-text mt-2">
              If you were given a key, enter it here. Otherwise, leave blank.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseAction;

