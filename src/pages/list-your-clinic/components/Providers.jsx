import React, { useState } from 'react';
import { cn } from '../../../utils/cn';
import { processImage } from '../utils/imageUtils';
import { parseBulkInput } from '../utils/bulkEntryUtils';

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

const Providers = ({ initialProviders, onContinue, onSkip, onBack, isEditMode = false }) => {
  const [providers, setProviders] = useState(
    initialProviders && initialProviders.length > 0
      ? initialProviders
      : [{ providerName: '', photoData: null, photoURL: '' }]
  );
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [entryMode, setEntryMode] = useState('individual'); // 'individual' or 'bulk'
  const [bulkInput, setBulkInput] = useState('');

  // Sync with initialProviders when they change (e.g., when loading existing clinic data)
  React.useEffect(() => {
    if (initialProviders && initialProviders.length > 0) {
      setProviders(initialProviders);
    }
  }, [initialProviders]);

  // Helper to get photo display URL (supports both photoData and photoURL)
  const getProviderPhotoUrl = (provider) => {
    return provider.photoData || provider.photoURL || provider.photoUrl || '';
  };

  const addProvider = () => {
    setProviders([...providers, { providerName: '', photoData: null, photoURL: '' }]);
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
    updated[index].photoUrl = null;
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

  // Bulk entry functions
  const parsedProviders = React.useMemo(() => {
    if (!bulkInput.trim()) return [];
    return parseBulkInput(bulkInput);
  }, [bulkInput]);

  const handleBulkAdd = () => {
    if (parsedProviders.length === 0) return;
    
    const newProviders = parsedProviders.map(name => ({
      providerName: name,
      photoData: null,
      photoURL: ''
    }));
    
    // Filter out duplicates by name (case-insensitive)
    const existingNames = new Set(providers.map(p => p.providerName.toLowerCase()));
    const uniqueNewProviders = newProviders.filter(p => 
      !existingNames.has(p.providerName.toLowerCase())
    );
    
    setProviders([...providers, ...uniqueNewProviders]);
    setBulkInput('');
    setEntryMode('individual');
  };

  const handleBulkReplace = () => {
    if (parsedProviders.length === 0) return;
    
    const newProviders = parsedProviders.map(name => ({
      providerName: name,
      photoData: null,
      photoURL: ''
    }));
    
    setProviders(newProviders);
    setBulkInput('');
    setEntryMode('individual');
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
        {isEditMode ? 'Edit Providers' : 'Providers at This Clinic'}
      </h2>
      
      {isEditMode && providers.length > 0 && providers[0].providerName ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Review and edit the existing providers below. You can add new providers or remove existing ones.
          </p>
        </div>
      ) : (
        <p className="text-text mb-6">
          Add the doctors, nurses, or practitioners at this clinic.
          You can skip this step if you don't have this information.
        </p>
      )}

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {uploadError}
        </div>
      )}

      {/* Entry Mode Toggle */}
      <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text">Entry Mode:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryMode('individual')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                entryMode === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text border border-border hover:bg-gray-50'
              )}
            >
              Individual Entry
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('bulk')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                entryMode === 'bulk'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text border border-border hover:bg-gray-50'
              )}
            >
              Bulk Entry
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Entry Mode */}
      {entryMode === 'bulk' && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-blue-50">
          <label className="block text-sm font-medium mb-2">
            Paste Provider Names (semicolon-separated)
          </label>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Anna Ulyannov (NP); Iulia Imbrogno (NP); Anne Yeaton, RN | BSN | LE; Heather Lancaster - Medical Assistant"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary mb-4 font-mono text-sm"
            rows={6}
          />
          
          {parsedProviders.length > 0 && (
            <div className="mb-4 p-3 bg-white border border-border rounded-lg">
              <p className="text-sm font-medium text-text mb-2">
                Preview: {parsedProviders.length} provider{parsedProviders.length !== 1 ? 's' : ''} will be added
              </p>
              <div className="max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm text-text space-y-1">
                  {parsedProviders.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBulkAdd}
              disabled={parsedProviders.length === 0}
              className={cn(
                'px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium text-sm',
                parsedProviders.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              Add to List ({parsedProviders.length})
            </button>
            <button
              type="button"
              onClick={handleBulkReplace}
              disabled={parsedProviders.length === 0}
              className={cn(
                'px-4 py-2 bg-white border border-border text-text rounded-lg hover:bg-gray-50 transition-all font-medium text-sm',
                parsedProviders.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              Replace All ({parsedProviders.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkInput('');
                setEntryMode('individual');
              }}
              className="px-4 py-2 bg-white border border-border text-text rounded-lg hover:bg-gray-50 transition-all font-medium text-sm ml-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Individual Entry Mode */}
      {entryMode === 'individual' && (
        <>
      <div className="space-y-4 mb-6">
        {providers.map((provider, index) => (
          <div
            key={index}
            className="p-4 border border-border rounded-lg"
          >
            <div className="mb-4">
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

            {/* Provider Photo Upload - Circular like clinic page */}
            <div className="mb-4 pt-4 border-t border-border">
              <label className="block text-sm font-medium mb-3">
                Provider Photo (optional)
              </label>
              
              <div className="flex items-center gap-4">
                {/* Circular photo preview */}
                <div className="relative group">
                  {getProviderPhotoUrl(provider) ? (
                    <>
                      <img
                        src={getProviderPhotoUrl(provider)}
                        alt={provider.providerName || 'Provider'}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                      {/* Show indicator for existing photo (from API, not uploaded) */}
                      {!provider.photoData && (provider.photoURL || provider.photoUrl) && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                          Existing
                        </div>
                      )}
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
                  
                  {getProviderPhotoUrl(provider) ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-text">
                        {provider.fileName || (!provider.photoData && (provider.photoURL || provider.photoUrl) ? 'Existing photo' : 'Photo uploaded')}
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
        </>
      )}

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
