import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../../utils/cn';
import { processImage } from '../utils/imageUtils';

const Photos = ({ initialPhotos, onContinue, onSkip, onBack }) => {
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [iconPhoto, setIconPhoto] = useState(
    initialPhotos?.find(p => p.photoType === 'icon') || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Separate clinic photos from icon
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

  const handleIconUpload = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const { photoData, fileName, mimeType, fileSize } = await processImage(file);
      const icon = {
        id: `icon-${Date.now()}`,
        photoType: 'icon',
        photoData,
        fileName,
        mimeType,
        fileSize,
        isPrimary: false,
        displayOrder: 0
      };

      setIconPhoto(icon);
      // Remove old icon if exists and add new one
      setPhotos([...photos.filter(p => p.photoType !== 'icon'), icon]);
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

  const { getRootProps: getIconRootProps, getInputProps: getIconInputProps, isDragActive: isIconDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => files[0] && handleIconUpload(files[0]),
    disabled: uploading
  });

  const removePhoto = (photoId) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    
    if (photoId === iconPhoto?.id) {
      setIconPhoto(null);
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

      {/* Clinic Icon/Logo */}
      <div className="mb-8 border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">CLINIC ICON/LOGO</h3>
        
        <div className="flex items-start gap-6">
          {iconPhoto ? (
            <div className="relative group">
              <img
                src={iconPhoto.photoData}
                alt="Clinic icon"
                className="w-32 h-32 object-cover rounded-lg border-2 border-border"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                <button
                  onClick={() => removePhoto(iconPhoto.id)}
                  className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-500 text-white rounded text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              {...getIconRootProps()}
              className={cn(
                'w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all',
                {
                  'border-primary bg-primary bg-opacity-5': isIconDragActive,
                  'border-border hover:border-primary': !isIconDragActive && !uploading,
                  'border-gray-300 bg-gray-100 cursor-not-allowed': uploading
                }
              )}
            >
              <input {...getIconInputProps()} />
              {uploading ? (
                <div className="text-sm text-text">...</div>
              ) : (
                <>
                  <div className="text-2xl mb-1">+</div>
                  <div className="text-xs text-text text-center">Upload</div>
                </>
              )}
            </div>
          )}
          
          <div className="flex-1">
            <p className="text-sm text-text mb-2">
              Upload your clinic's logo or icon
            </p>
            <p className="text-xs text-text">
              Recommended: Square image, at least 200x200px
            </p>
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

