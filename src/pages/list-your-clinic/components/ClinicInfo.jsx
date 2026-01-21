import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { US_STATES, CLINIC_CATEGORIES } from '../constants';
import { cn } from '../../../utils/cn';
import WorkingHoursEditor from './WorkingHoursEditor';

const ClinicInfo = ({ initialData, initialAdvanced, onContinue, onBack, isEditMode = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {}
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedData, setAdvancedData] = useState(initialAdvanced || {
    latitude: '',
    longitude: '',
    placeID: '',
    description: '',
    googleProfileLink: '',
    workingHours: {}
  });

  const onSubmit = (data) => {
    onContinue(data, advancedData);
  };

  const updateAdvancedField = (field, value) => {
    setAdvancedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-text hover:text-dark mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Back
      </button>

      <h2 className="text-3xl font-bold mb-6">
        {isEditMode ? 'Edit Clinic Information' : 'Clinic Information'}
      </h2>
      
      {isEditMode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Review and edit the clinic details below. These are the current details on file.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Clinic Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Clinic Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('clinicName', {
              required: 'Clinic name is required',
              maxLength: { value: 255, message: 'Maximum 255 characters' }
            })}
            placeholder="Enter clinic name"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.clinicName,
                'border-border': !errors.clinicName
              }
            )}
          />
          <p className="text-xs text-text mt-1">
            The official name as it appears on the clinic's website
          </p>
          {errors.clinicName && (
            <p className="text-red-500 text-sm mt-1">{errors.clinicName.message}</p>
          )}
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('address', {
              required: 'Address is required',
              maxLength: { value: 500, message: 'Maximum 500 characters' }
            })}
            placeholder="123 Collins Ave, Suite 400"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.address,
                'border-border': !errors.address
              }
            )}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* City & State Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('city', {
                required: 'City is required',
                maxLength: { value: 100, message: 'Maximum 100 characters' }
              })}
              placeholder="Miami Beach"
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
                {
                  'border-red-500': errors.city,
                  'border-border': !errors.city
                }
              )}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              {...register('state', { required: 'State is required' })}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
                {
                  'border-red-500': errors.state,
                  'border-border': !errors.state
                }
              )}
            >
              <option value="">Select State</option>
              {US_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Zip Code
          </label>
          <input
            type="text"
            {...register('zipCode', {
              pattern: {
                value: /^\d{5}$/,
                message: 'Must be 5 digits'
              }
            })}
            placeholder="33139"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.zipCode,
                'border-border': !errors.zipCode
              }
            )}
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
          )}
        </div>

        {/* Clinic Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Clinic Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.category,
                'border-border': !errors.category
              }
            )}
          >
            <option value="">Select Category</option>
            {CLINIC_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-text mt-1">
            Options: Plastic Surgery, Med Spa / Aesthetics, Medical, Dermatology, Other
          </p>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Website
          </label>
          <input
            type="text"
            {...register('website', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Must start with http:// or https://'
              }
            })}
            placeholder="https://example.com"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.website,
                'border-border': !errors.website
              }
            )}
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone
          </label>
          <input
            type="tel"
            {...register('phone', {
              pattern: {
                // Accept various formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, +1 XXX-XXX-XXXX, +1 (XXX) XXX-XXXX, etc.
                value: /^[+]?[\d\s\-().]{7,20}$/,
                message: 'Please enter a valid phone number'
              }
            })}
            placeholder="(305) 555-1234"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.phone,
                'border-border': !errors.phone
              }
            )}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            })}
            placeholder="info@example.com"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary',
              {
                'border-red-500': errors.email,
                'border-border': !errors.email
              }
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Advanced Information (Collapsible) */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium">
              {showAdvanced ? '▾' : '▸'} Advanced Information (optional)
            </span>
          </button>
          
          {showAdvanced && (
            <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
              <p className="text-sm text-text">
                These fields are optional. Most users can skip this section.
              </p>

              {/* Location Data */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase text-text">Location Data</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={advancedData.latitude}
                      onChange={(e) => updateAdvancedField('latitude', e.target.value)}
                      placeholder="25.7617"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={advancedData.longitude}
                      onChange={(e) => updateAdvancedField('longitude', e.target.value)}
                      placeholder="-80.1918"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-text">Geographic coordinates (decimal degrees)</p>

                <div>
                  <label className="block text-sm font-medium mb-2">Google Place ID</label>
                  <input
                    type="text"
                    value={advancedData.placeID}
                    onChange={(e) => updateAdvancedField('placeID', e.target.value)}
                    placeholder="ChIJrTLr-GyuEmsRBfy61i59si0"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text mt-1">Found in Google Maps URL or Places API</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Google Maps Link</label>
                  <input
                    type="text"
                    value={advancedData.googleProfileLink}
                    onChange={(e) => updateAdvancedField('googleProfileLink', e.target.value)}
                    placeholder="https://maps.google.com/?cid=..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase text-text">Additional Details</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={advancedData.description}
                    onChange={(e) => updateAdvancedField('description', e.target.value)}
                    placeholder="Brief description of the clinic..."
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text mt-1">Up to 2000 characters</p>
                </div>

              </div>


              {/* Working Hours */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase text-text">Working Hours</h4>
                <WorkingHoursEditor
                  workingHours={advancedData.workingHours}
                  onChange={(hours) => updateAdvancedField('workingHours', hours)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
          >
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClinicInfo;
