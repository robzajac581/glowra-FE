import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../../utils/cn';
import { processImage } from '../utils/imageUtils';
import ClinicInitialAvatar from '../../../components/ClinicInitialAvatar';

const Photos = ({ initialPhotos, clinicName, onContinue, onSkip, onBack }) => {
  const [photos, setPhotos] = useState(initialPhotos || []);
  // Support both 'logo' and 'icon' for backwards compatibility
  const [logoPhoto, setLogoPhoto] = useState(
    initialPhotos?.find(p => p.photoType === 'logo' || p.photoType === 'icon') || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Separate clinic photos from logo
  const clinicPhotos = photos.filter(p => p.photoType === 'clinic');

  const handleClinicPhotoUpload = async (files) => {
    setUploading(true);
    setError(null);

    try {
      const processedPhotos = await Promise.all(
        files.map(async (file, index) => {
          const { photoData, fileName, mimeType, fileSize } = await processImage(file);
          return {
            id: `clinic-${Date.now()}-${index}`,
            photoType: 'clinic',
            photoData,
            fileName,
            mimeType,
            fileSize,
            isPrimary: clinicPhotos.length === 0 && index === 0, // First photo is primary by default
            displayOrder: clinicPhotos.length + index,
            caption: ''
          };
        })
      );

      setPhotos([...photos, ...processedPhotos]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const { photoData, fileName, mimeType, fileSize } = await processImage(file);
      const logo = {
        id: `logo-${Date.now()}`,
        photoType: 'logo',
        photoData,
        fileName,
        mimeType,
        fileSize,
        isPrimary: false,
        displayOrder: 0
      };

      setLogoPhoto(logo);
      // Remove old logo/icon if exists and add new one
      setPhotos([...photos.filter(p => p.photoType !== 'logo' && p.photoType !== 'icon'), logo]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps: getClinicRootProps, getInputProps: getClinicInputProps, isDragActive: isClinicDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: handleClinicPhotoUpload,
    disabled: uploading
  });

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => files[0] && handleLogoUpload(files[0]),
    disabled: uploading
  });

  const removePhoto = (photoId) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    
    if (photoId === logoPhoto?.id) {
      setLogoPhoto(null);
    }
  };

  const setPrimaryPhoto = (photoId) => {
    const updated = photos.map(p => ({
      ...p,
      isPrimary: p.id === photoId && p.photoType === 'clinic'
    }));
    setPhotos(updated);
  };

  const handleContinue = () => {
    onContinue(photos);
  };

  const handleSkip = () => {
    onSkip([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-text hover:text-dark mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Back
      </button>

      <h2 className="text-3xl font-bold mb-6">Add Photos (Optional)</h2>
      
      <p className="text-text mb-8">
        Photos help patients recognize your clinic and build trust.
        You can skip this step if you don't have photos ready.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Clinic Photos */}
      <div className="mb-8 border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">CLINIC PHOTOS</h3>
        <p className="text-sm text-text mb-4">
          Add photos of your clinic (exterior, interior, treatment rooms)
        </p>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {clinicPhotos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.photoData}
                alt={photo.caption || 'Clinic photo'}
                className="w-full h-32 object-cover rounded-lg border-2 border-border"
              />
              {photo.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                  ★ Primary
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2">
                {!photo.isPrimary && (
                  <button
                    onClick={() => setPrimaryPhoto(photo.id)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white text-dark rounded text-sm font-medium"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-500 text-white rounded text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Add Photo Dropzone */}
          <div
            {...getClinicRootProps()}
            className={cn(
              'h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all',
              {
                'border-primary bg-primary bg-opacity-5': isClinicDragActive,
                'border-border hover:border-primary': !isClinicDragActive && !uploading,
                'border-gray-300 bg-gray-100 cursor-not-allowed': uploading
              }
            )}
          >
            <input {...getClinicInputProps()} />
            {uploading ? (
              <div className="text-sm text-text">Uploading...</div>
            ) : (
              <>
                <div className="text-2xl mb-1">+</div>
                <div className="text-xs text-text">Add Photo</div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-text">
          ★ = Primary photo (shown on search cards). Click a photo to set as primary or remove.
        </p>
      </div>

      {/* Clinic Logo */}
      <div className="mb-8 border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">CLINIC LOGO</h3>
        
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            {/* Preview circle - matching clinic page styling */}
            <div className="relative">
              {logoPhoto ? (
                <div className="relative group">
                  <img
                    src={logoPhoto.photoData}
                    alt="Clinic logo"
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-full flex items-center justify-center">
                    <button
                      onClick={() => removePhoto(logoPhoto.id)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500 text-white rounded text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <ClinicInitialAvatar clinicName={clinicName || 'C'} size={96} />
              )}
            </div>
            
            {/* Upload button below preview */}
            {!logoPhoto && (
              <div
                {...getLogoRootProps()}
                className={cn(
                  'px-4 py-2 border-2 border-dashed rounded-lg flex items-center gap-2 cursor-pointer transition-all text-sm',
                  {
                    'border-primary bg-primary bg-opacity-5': isLogoDragActive,
                    'border-border hover:border-primary': !isLogoDragActive && !uploading,
                    'border-gray-300 bg-gray-100 cursor-not-allowed': uploading
                  }
                )}
              >
                <input {...getLogoInputProps()} />
                {uploading ? (
                  <span className="text-text">Uploading...</span>
                ) : (
                  <span className="text-primary font-medium">+ Upload Logo</span>
                )}
              </div>
            )}
            
            {logoPhoto && (
              <div
                {...getLogoRootProps()}
                className="text-primary text-sm hover:underline cursor-pointer"
              >
                <input {...getLogoInputProps()} />
                Change Logo
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-text mb-2">
              Upload your clinic's logo
            </p>
            <p className="text-xs text-text mb-3">
              This will appear as a circular avatar on your clinic page
            </p>
            <div className="text-xs text-gray-400">
              Recommended: Square image, at least 200x200px
            </div>
          </div>
        </div>
      </div>

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
          disabled={uploading}
          className={cn(
            'px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium',
            {
              'opacity-50 cursor-not-allowed': uploading
            }
          )}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Photos;

