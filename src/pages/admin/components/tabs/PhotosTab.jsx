import React, { useState } from 'react';
import API_BASE_URL from '../../../../config/api';
import { getAuthHeaders } from '../../hooks/useAuth';
import { processImage } from '../../../list-your-clinic/utils/imageUtils';
import ClinicInitialAvatar from '../../../../components/ClinicInitialAvatar';
import { cn } from '../../../../utils/cn';

const PhotosTab = ({ draft, onUpdate, clinicId }) => {
  const [fetchingGooglePhotos, setFetchingGooglePhotos] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const photos = draft.photos || [];
  // Support both 'logo' and 'icon' for backwards compatibility
  const logoPhoto = photos.find(p => p.photoType === 'logo' || p.photoType === 'icon');
  const userPhotos = photos.filter(p => p.source === 'user' && p.photoType !== 'logo' && p.photoType !== 'icon');
  const googlePhotos = photos.filter(p => p.source === 'google');
  
  // Check what identifiers we have available
  const hasDraftId = !!draft.draftId;
  const hasPlaceId = !!draft.placeId;
  const hasClinicId = !!clinicId;
  const canFetchGooglePhotos = hasDraftId || hasPlaceId || hasClinicId;

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const { photoData, fileName, mimeType, fileSize } = await processImage(file);
      
      const newLogo = {
        draftPhotoId: `logo-${Date.now()}`,
        photoType: 'logo',
        photoData,
        photoUrl: null,
        fileName,
        mimeType,
        fileSize,
        isPrimary: false,
        source: 'user',
      };

      // Remove old logo/icon if exists and add new one
      const updatedPhotos = photos.filter(p => p.photoType !== 'logo' && p.photoType !== 'icon');
      onUpdate({ photos: [...updatedPhotos, newLogo] });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    const updatedPhotos = photos.filter(p => p.photoType !== 'logo' && p.photoType !== 'icon');
    onUpdate({ photos: updatedPhotos });
  };

  const handleSetPrimary = (photoId) => {
    const updatedPhotos = photos.map(p => ({
      ...p,
      isPrimary: (p.draftPhotoId || p.photoId) === photoId,
    }));
    onUpdate({ photos: updatedPhotos });
  };

  const handleRemovePhoto = (photoId) => {
    const updatedPhotos = photos.filter(p => (p.draftPhotoId || p.photoId) !== photoId);
    onUpdate({ photos: updatedPhotos });
  };

  const handleFetchGooglePhotos = async () => {
    // Determine which endpoint to use based on available identifiers
    let url;
    
    if (hasDraftId) {
      // Existing draft flow - use draft endpoint
      url = `${API_BASE_URL}/api/admin/drafts/${draft.draftId}/google-photos`;
    } else if (hasPlaceId) {
      // Lazy draft creation - use placeId directly (Option A - preferred)
      url = `${API_BASE_URL}/api/clinic-management/admin/google-photos?placeId=${encodeURIComponent(draft.placeId)}`;
    } else if (hasClinicId) {
      // Lazy draft creation - lookup via clinicId (Option B)
      url = `${API_BASE_URL}/api/clinic-management/admin/clinics/${clinicId}/google-photos`;
    } else {
      setError('Cannot fetch Google photos: no PlaceID or Clinic ID available. Add a PlaceID in the Location tab first.');
      return;
    }

    setFetchingGooglePhotos(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const newGooglePhotos = data.photos.map((p, idx) => ({
          ...p,
          photoUrl: p.url || p.urls?.medium || p.photoUrl,
          source: 'google',
          draftPhotoId: `google-${Date.now()}-${idx}`,
          selected: true,
        }));
        
        // Remove old google photos and add new ones
        const updatedPhotos = photos.filter(p => p.source !== 'google');
        onUpdate({ photos: [...updatedPhotos, ...newGooglePhotos] });
      } else {
        setError(data.error || 'Failed to fetch Google photos');
      }
    } catch (err) {
      console.error('Google photos fetch failed:', err);
      setError('Failed to fetch Google photos');
    } finally {
      setFetchingGooglePhotos(false);
    }
  };

  const renderPhotoGrid = (photoList, title, source) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-dark mb-3">
        {title} ({photoList.length})
      </h4>
      
      {photoList.length === 0 ? (
        <p className="text-text text-sm">No {source} photos</p>
      ) : (
        <div className="photo-grid">
          {photoList.map((photo, index) => {
            const photoId = photo.draftPhotoId || photo.photoId || index;
            return (
              <div
                key={photoId}
                className={`photo-grid-item ${photo.selected !== false ? 'selected' : 'opacity-50'}`}
              >
                <img
                  src={photo.photoUrl || photo.photoData || photo.url}
                  alt={`Upload ${index + 1}`}
                />
                
                {/* Primary Badge */}
                {photo.isPrimary && (
                  <span className="absolute top-1 left-1 bg-primary text-white rounded-full px-2 py-0.5 text-xs font-medium">
                    Primary
                  </span>
                )}
                
                {/* Source Badge */}
                <span className="absolute bottom-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-xs">
                  {photo.source === 'google' ? 'Google' : 'User'}
                </span>
                
                {/* Actions */}
                <div className="absolute top-1 right-1 flex gap-1">
                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(photoId)}
                      className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs hover:bg-white"
                      title="Set as primary"
                    >
                      ★
                    </button>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(photoId)}
                    className="w-6 h-6 bg-red-500/90 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    title="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark">
          Photos ({photos.length})
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Photo source info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <p className="text-blue-800">
          <strong>Photo Priority:</strong> User-provided photos are used first. 
          If fewer than 3 user photos exist, Google photos can supplement.
        </p>
      </div>

      {/* Clinic Logo Section */}
      <div className="border border-border rounded-lg p-6 bg-slate-50">
        <h4 className="text-sm font-semibold text-dark mb-4">CLINIC LOGO</h4>
        
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            {/* Preview circle - matching clinic page styling */}
            <div className="relative">
              {logoPhoto ? (
                <div className="relative group">
                  <img
                    src={logoPhoto.photoData || logoPhoto.photoUrl}
                    alt="Clinic logo"
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-full flex items-center justify-center">
                    <button
                      onClick={handleRemoveLogo}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500 text-white rounded text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <ClinicInitialAvatar clinicName={draft.clinicName || 'C'} size={96} />
              )}
            </div>
            
            {/* Upload button below preview */}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="hidden"
              id="clinic-logo-upload"
            />
            
            {!logoPhoto ? (
              <label
                htmlFor="clinic-logo-upload"
                className={cn(
                  'px-4 py-2 border-2 border-dashed rounded-lg flex items-center gap-2 cursor-pointer transition-all text-sm',
                  {
                    'border-primary bg-white hover:bg-primary hover:bg-opacity-5': !uploadingLogo,
                    'border-gray-300 bg-gray-100 cursor-not-allowed': uploadingLogo
                  }
                )}
              >
                {uploadingLogo ? (
                  <span className="text-text">Uploading...</span>
                ) : (
                  <span className="text-primary font-medium">+ Upload Logo</span>
                )}
              </label>
            ) : (
              <label
                htmlFor="clinic-logo-upload"
                className="text-primary text-sm hover:underline cursor-pointer"
              >
                Change Logo
              </label>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-text mb-2">
              Upload your clinic's logo
            </p>
            <p className="text-xs text-text mb-3">
              This will appear as a circular avatar on the clinic page
            </p>
            <div className="text-xs text-gray-400">
              Recommended: Square image, at least 200x200px
            </div>
          </div>
        </div>
      </div>

      {/* User Photos */}
      {renderPhotoGrid(userPhotos, 'User-Provided Photos', 'user')}

      {/* Google Photos */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-dark">
            Google Photos ({googlePhotos.length})
          </h4>
          {canFetchGooglePhotos && (
            <button
              onClick={handleFetchGooglePhotos}
              disabled={fetchingGooglePhotos}
              className="px-4 py-2 text-sm text-primary hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {fetchingGooglePhotos ? 'Fetching...' : '📷 Fetch Google Photos'}
            </button>
          )}
        </div>
        
        {googlePhotos.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-text text-sm mb-2">No Google photos fetched</p>
            {canFetchGooglePhotos ? (
              <button
                onClick={handleFetchGooglePhotos}
                disabled={fetchingGooglePhotos}
                className="text-primary hover:underline text-sm"
              >
                Fetch photos from Google
              </button>
            ) : (
              <p className="text-xs text-text">
                Add a PlaceID in the Location tab to fetch Google photos
              </p>
            )}
          </div>
        ) : (
          <div className="photo-grid">
            {googlePhotos.map((photo, index) => {
              const photoId = photo.draftPhotoId || photo.photoId || `google-${index}`;
              return (
                <div
                  key={photoId}
                  className={`photo-grid-item ${photo.selected !== false ? 'selected' : 'opacity-50'}`}
                >
                  <img
                    src={photo.photoUrl || photo.url}
                    alt={`Google ${index + 1}`}
                  />
                  
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-xs">
                    Google
                  </span>
                  
                  <div className="absolute top-1 right-1 flex gap-1">
                    {!photo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(photoId)}
                        className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs hover:bg-white"
                        title="Set as primary"
                      >
                        ★
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePhoto(photoId)}
                      className="w-6 h-6 bg-red-500/90 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosTab;

