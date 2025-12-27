import React, { useState } from 'react';
import { PROVIDER_SPECIALTIES } from '../constants';
import { cn } from '../../../utils/cn';
import { processImage } from '../utils/imageUtils';

/**
 * Helper function to get initials from provider name (matching clinic page styling)
 */
const getInitials = (name) => {
  if (!name) return '?';
  
  // Remove "Dr." prefix and split by space
  const cleanName = name.replace(/^Dr\.?\s*/i, '').trim();
  const parts = cleanName.split(/\s+/);
  
  if (parts.length >= 2) {
    // First and last name initials
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  // Single name - return first letter
  return cleanName[0]?.toUpperCase() || '?';
};

/**
 * Placeholder component for providers without photos (matching clinic page styling)
 */
const ProviderPhotoPlaceholder = ({ name, size = 80 }) => {
  const initials = getInitials(name);
  
  return (
    <div 
      className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-300"
      style={{ width: size, height: size }}
    >
      <span className="text-xl font-bold text-blue-700">
        {initials}
      </span>
    </div>
  );
};

const Providers = ({ initialProviders, onContinue, onSkip, onBack }) => {
  const [providers, setProviders] = useState(
    initialProviders && initialProviders.length > 0
      ? initialProviders
      : [{ providerName: '', specialty: '', photoData: null, photoURL: '' }]
  );
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const addProvider = () => {
    setProviders([...providers, { providerName: '', specialty: '', photoData: null, photoURL: '' }]);
  };

  const removeProvider = (index) => {
    if (providers.length > 1) {
      setProviders(providers.filter((_, i) => i !== index));
    }
  };

  const updateProvider = (index, field, value) => {
    const updated = [...providers];
    updated[index][field] = value;
    setProviders(updated);
  };

  const handlePhotoUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setUploadError(null);

    try {
      const { photoData, fileName, mimeType, fileSize } = await processImage(file);
      
      const updated = [...providers];
      updated[index].photoData = photoData;
      updated[index].fileName = fileName;
      updated[index].mimeType = mimeType;
      updated[index].fileSize = fileSize;
      setProviders(updated);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const removePhoto = (index) => {
    const updated = [...providers];
    updated[index].photoData = null;
    updated[index].photoURL = '';
    updated[index].fileName = null;
    updated[index].mimeType = null;
    updated[index].fileSize = null;
    setProviders(updated);
  };

  const handleContinue = () => {
    // Filter out empty providers
    const filledProviders = providers.filter(p => p.providerName.trim());
    onContinue(filledProviders);
  };

  const handleSkip = () => {
    onSkip([]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-text hover:text-dark mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Back
      </button>

      <h2 className="text-3xl font-bold mb-6">Providers at This Clinic</h2>
      
      <p className="text-text mb-6">
        Add the doctors, nurses, or practitioners at this clinic.
        You can skip this step if you don't have this information.
      </p>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {uploadError}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {providers.map((provider, index) => (
          <div
            key={index}
            className="p-4 border border-border rounded-lg"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Provider Name {index === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={provider.providerName}
                  onChange={(e) => updateProvider(index, 'providerName', e.target.value)}
                  placeholder="Dr. Sarah Johnson"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Specialty
                </label>
                <select
                  value={provider.specialty}
                  onChange={(e) => updateProvider(index, 'specialty', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="">Select Specialty</option>
                  {PROVIDER_SPECIALTIES.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Provider Photo Upload - Circular like clinic page */}
            <div className="mb-4 pt-4 border-t border-border">
              <label className="block text-sm font-medium mb-3">
                Provider Photo (optional)
              </label>
              
              <div className="flex items-center gap-4">
                {/* Circular photo preview */}
                <div className="relative group">
                  {provider.photoData || provider.photoURL ? (
                    <>
                      <img
                        src={provider.photoData || provider.photoURL}
                        alt={provider.providerName || 'Provider'}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-full flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500 text-white rounded text-xs font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <ProviderPhotoPlaceholder name={provider.providerName} size={80} />
                  )}
                </div>
                
                {/* Upload controls */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handlePhotoUpload(index, e)}
                    disabled={uploadingIndex === index}
                    className="hidden"
                    id={`provider-photo-${index}`}
                  />
                  
                  {provider.photoData || provider.photoURL ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-text">
                        {provider.fileName || 'Photo uploaded'}
                      </p>
                      <div className="flex gap-3">
                        <label
                          htmlFor={`provider-photo-${index}`}
                          className="text-primary text-sm hover:underline cursor-pointer"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor={`provider-photo-${index}`}
                        className={cn(
                          'inline-flex items-center px-4 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors text-sm',
                          {
                            'opacity-50 cursor-not-allowed': uploadingIndex === index
                          }
                        )}
                      >
                        {uploadingIndex === index ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <span className="text-primary font-medium">+ Add Photo</span>
                        )}
                      </label>
                      <p className="text-xs text-gray-400 mt-2">
                        Circular headshot, 400x400px recommended
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {providers.length > 1 && (
              <button
                onClick={() => removeProvider(index)}
                className="text-red-500 hover:text-red-700 text-sm transition-colors"
              >
                ✕ Remove Provider
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addProvider}
        className="w-full py-3 border-2 border-dashed border-border rounded-lg text-primary hover:border-primary transition-all mb-6"
      >
        + Add Another Provider
      </button>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button
          onClick={handleSkip}
          className="text-text hover:text-dark transition-colors"
        >
          Skip this step
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Providers;
