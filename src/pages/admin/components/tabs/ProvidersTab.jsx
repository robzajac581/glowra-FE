import React, { useState } from 'react';
import { processImage } from '../../../list-your-clinic/utils/imageUtils';
import { cn } from '../../../../utils/cn';

/**
 * Helper function to get initials from provider name
 */
const getInitials = (name) => {
  if (!name) return '?';
  const cleanName = name.replace(/^Dr\.?\s*/i, '').trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return cleanName[0]?.toUpperCase() || '?';
};

/**
 * Placeholder component for providers without photos
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

const ProvidersTab = ({ draft, onUpdate }) => {
  const providers = draft.providers || [];
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleProviderChange = (index, field, value) => {
    const updatedProviders = [...providers];
    updatedProviders[index] = {
      ...updatedProviders[index],
      [field]: value,
    };
    onUpdate({ providers: updatedProviders });
  };

  const handlePhotoUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setUploadError(null);

    try {
      const { photoData, fileName, mimeType, fileSize } = await processImage(file);
      
      const updatedProviders = [...providers];
      updatedProviders[index] = {
        ...updatedProviders[index],
        photoData,
        fileName,
        mimeType,
        fileSize,
      };
      onUpdate({ providers: updatedProviders });
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemovePhoto = (index) => {
    const updatedProviders = [...providers];
    updatedProviders[index] = {
      ...updatedProviders[index],
      photoData: null,
      photoUrl: null,
      fileName: null,
      mimeType: null,
      fileSize: null,
    };
    onUpdate({ providers: updatedProviders });
  };

  const handleAddProvider = () => {
    // Generate a temporary ID for new providers
    // This helps the backend distinguish between new providers (temp IDs) and existing ones (numeric IDs)
    const tempId = `new-provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    onUpdate({
      providers: [
        ...providers,
        {
          draftProviderId: tempId,
          providerName: '',
          photoData: null,
          photoUrl: null,
        },
      ],
    });
  };

  const handleRemoveProvider = (index) => {
    const updatedProviders = providers.filter((_, i) => i !== index);
    onUpdate({ providers: updatedProviders });
  };

  // Helper to get the photo URL (photoData for uploads, photoUrl for existing)
  const getPhotoSrc = (provider) => provider.photoData || provider.photoUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark">
          Providers ({providers.length})
        </h3>
        <button
          onClick={handleAddProvider}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors"
        >
          + Add Provider
        </button>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      {providers.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <div className="text-3xl mb-2">👨‍⚕️</div>
          <p className="text-text mb-4">No providers added yet</p>
          <button
            onClick={handleAddProvider}
            className="px-4 py-2 text-primary hover:underline text-sm"
          >
            Add your first provider
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <div
              key={provider.draftProviderId || index}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  {/* Provider Name */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Provider Name *
                    </label>
                    <input
                      type="text"
                      value={provider.providerName || ''}
                      onChange={(e) => handleProviderChange(index, 'providerName', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>

                  {/* Provider Photo - Circular like clinic page */}
                  <div className="pt-4 border-t border-border">
                    <label className="block text-sm font-medium text-dark mb-3">
                      Provider Photo (optional)
                    </label>
                    
                    <div className="flex items-center gap-4">
                      {/* Circular photo preview */}
                      <div className="relative group">
                        {getPhotoSrc(provider) ? (
                          <>
                            <img
                              src={getPhotoSrc(provider)}
                              alt={provider.providerName || 'Provider'}
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-full flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
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
                          id={`provider-photo-admin-${index}`}
                        />
                        
                        {getPhotoSrc(provider) ? (
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-text">
                              {provider.fileName || 'Photo uploaded'}
                            </p>
                            <div className="flex gap-3">
                              <label
                                htmlFor={`provider-photo-admin-${index}`}
                                className="text-primary text-sm hover:underline cursor-pointer"
                              >
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label
                              htmlFor={`provider-photo-admin-${index}`}
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
                </div>
                
                <button
                  onClick={() => handleRemoveProvider(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove provider"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvidersTab;
