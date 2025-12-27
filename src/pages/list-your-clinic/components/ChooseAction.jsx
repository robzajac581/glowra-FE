import React from 'react';
import { Link } from 'react-router-dom';

const ChooseAction = ({ onSelectFlow }) => {
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
          <h3 className="text-xl font-semibold mb-3">Suggest Edit to Existing Clinic</h3>
          <p className="text-text mb-6">
            Add providers, procedures to a clinic already listed
          </p>
          <div className="inline-block px-6 py-2 bg-primary text-white rounded-lg">
            Search
          </div>
        </button>
      </div>

      {/* Admin Login */}
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text hover:text-dark transition-colors">
          <span className="text-xs">🔒</span>
          <Link 
            to="/admin/login" 
            className="hover:underline"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseAction;
