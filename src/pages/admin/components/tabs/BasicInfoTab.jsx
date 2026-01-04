import React from 'react';
import { US_STATES, CLINIC_CATEGORIES } from '../../../list-your-clinic/constants';

const BasicInfoTab = ({ draft, onUpdate }) => {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-dark">Basic Information</h3>
      
      {/* Clinic Name */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Clinic Name *
        </label>
        <input
          type="text"
          value={draft.clinicName || ''}
          onChange={(e) => handleChange('clinicName', e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter clinic name"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Street Address *
        </label>
        <input
          type="text"
          value={draft.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="123 Main St, Suite 100"
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            City *
          </label>
          <input
            type="text"
            value={draft.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="City"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            State *
          </label>
          <select
            value={draft.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Zip Code
          </label>
          <input
            type="text"
            value={draft.zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="12345"
            maxLength={10}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Category *
        </label>
        <select
          value={draft.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        >
          <option value="">Select Category</option>
          {CLINIC_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Contact Information */}
      <div className="border-t border-border pt-6">
        <h4 className="text-md font-semibold text-dark mb-4">Contact Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Website
            </label>
            <input
              type="url"
              value={draft.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={draft.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-dark mb-2">
            Email
          </label>
          <input
            type="email"
            value={draft.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="contact@clinic.com"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab;
