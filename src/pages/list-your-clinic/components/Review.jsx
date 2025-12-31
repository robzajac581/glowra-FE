import React, { useState } from 'react';
import API_BASE_URL from '../../../config/api';
import ClinicInitialAvatar from '../../../components/ClinicInitialAvatar';

/**
 * Helper function to get initials from provider name (matching clinic page styling)
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
const ProviderPhotoPlaceholder = ({ name, size = 40 }) => {
  const initials = getInitials(name);
  return (
    <div 
      className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-blue-300"
      style={{ width: size, height: size }}
    >
      <span className="text-sm font-bold text-blue-700">
        {initials}
      </span>
    </div>
  );
};

const Review = ({ wizardState, onEdit, onBack, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { clinic, advanced, photos, providers, procedures, flow, existingClinicId, submitterKey } = wizardState;
  
  // Helper to get correct step number based on flow
  const isExistingFlow = flow === 'add_to_existing';
  const getEditStep = (section) => {
    // For add_to_existing: 1=Search, 2=ClinicInfo, 3=Providers, 4=Procedures, 5=Photos
    // For new_clinic: 1=ClinicInfo, 2=Providers, 3=Procedures, 4=Photos
    const steps = {
      clinic: isExistingFlow ? 2 : 1,
      providers: isExistingFlow ? 3 : 2,
      procedures: isExistingFlow ? 4 : 3,
      photos: isExistingFlow ? 5 : 4,
    };
    return steps[section];
  };

  // Helper to get photo display URL (supports both photoData and photoUrl)
  const getPhotoUrl = (photo) => {
    return photo?.photoData || photo?.photoUrl || photo?.photoURL || '';
  };

  // Helper to format working hours for display
  const formatWorkingHours = (workingHours) => {
    if (!workingHours || Object.keys(workingHours).length === 0) return null;
    
    const days = [];
    Object.entries(workingHours).forEach(([day, data]) => {
      if (data && !data.closed && data.open && data.close) {
        days.push(`${day.substring(0, 3)}: ${formatTime(data.open)}-${formatTime(data.close)}`);
      }
    });
    
    return days.length > 0 ? days.join(', ') : null;
  };

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${minute.toString().padStart(2, '0')}${ampm}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare working hours for API (convert to simple string format)
      const workingHoursFormatted = {};
      if (advanced.workingHours) {
        Object.entries(advanced.workingHours).forEach(([day, data]) => {
          if (data && data.closed) {
            workingHoursFormatted[day] = 'Closed';
          } else if (data && data.open && data.close) {
            workingHoursFormatted[day] = `${formatTime(data.open)}-${formatTime(data.close)}`;
          }
        });
      }

      const payload = {
        submitterKey: submitterKey || null,
        flow: flow,
        existingClinicId: existingClinicId || null,
        clinic: {
          clinicName: clinic.clinicName,
          address: clinic.address,
          city: clinic.city,
          state: clinic.state,
          zipCode: clinic.zipCode || null,
          category: clinic.category,
          website: clinic.website || null,
          phone: clinic.phone || null,
          email: clinic.email || null
        },
        advanced: {
          latitude: advanced.latitude ? parseFloat(advanced.latitude) : null,
          longitude: advanced.longitude ? parseFloat(advanced.longitude) : null,
          placeID: advanced.placeID || null,
          description: advanced.description || null,
          googleProfileLink: advanced.googleProfileLink || null,
          workingHours: Object.keys(workingHoursFormatted).length > 0 ? workingHoursFormatted : null
        },
        photos: photos.map(p => ({
          photoType: p.photoType,
          photoData: p.photoData,
          photoURL: p.photoURL || null,
          fileName: p.fileName,
          mimeType: p.mimeType,
          fileSize: p.fileSize,
          isPrimary: p.isPrimary,
          displayOrder: p.displayOrder,
          caption: p.caption || null
        })),
        providers: providers.map(p => ({
          providerName: p.providerName,
          photoData: p.photoData || null,
          photoURL: p.photoURL || null
        })),
        procedures: procedures.map(p => ({
          procedureName: p.procedureName,
          category: p.category,
          priceMin: p.priceMin || null,
          priceMax: p.priceMax || null,
          unit: p.unit || null,
          averagePrice: p.averagePrice || null,
          providerNames: p.providerNames || []
        }))
      };

      const response = await fetch(
        `${API_BASE_URL}/api/clinic-management/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (proc) => {
    if (proc.priceMin && proc.priceMax) {
      return `$${proc.priceMin}-$${proc.priceMax}${proc.unit || ''}`;
    } else if (proc.priceMin) {
      return `$${proc.priceMin}${proc.unit || ''}`;
    } else if (proc.averagePrice) {
      return `$${proc.averagePrice}${proc.unit || ''}`;
    }
    return 'Price TBD';
  };

  const clinicPhotos = photos?.filter(p => p.photoType === 'clinic') || [];
  // Support both 'logo' and 'icon' for backwards compatibility
  const logoPhoto = photos?.find(p => p.photoType === 'logo' || p.photoType === 'icon');
  const providersWithPhotos = providers?.filter(p => p.photoData || p.photoURL || p.photoUrl) || [];
  
  const hasAdvancedInfo = advanced && (
    advanced.latitude || advanced.longitude || advanced.placeID || 
    advanced.description || advanced.googleProfileLink ||
    (advanced.workingHours && Object.keys(advanced.workingHours).length > 0)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-text hover:text-dark mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Back
      </button>

      <h2 className="text-3xl font-bold mb-6">Review Your Submission</h2>
      
      <p className="text-text mb-8">
        Please review the information below before submitting.
      </p>

      {/* Clinic Information */}
      <div className="mb-6 border border-border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-border">
          <h3 className="font-semibold">CLINIC INFORMATION</h3>
          <button
            onClick={() => onEdit(getEditStep('clinic'))}
            className="text-primary hover:underline text-sm"
          >
            Edit
          </button>
        </div>
        <div className="px-6 py-4 space-y-2">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-text font-medium">Name:</span>
            <span>{clinic.clinicName}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-text font-medium">Address:</span>
            <span>
              {clinic.address}
              <br />
              {clinic.city}, {clinic.state} {clinic.zipCode}
            </span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-text font-medium">Category:</span>
            <span>{clinic.category}</span>
          </div>
          {clinic.website && (
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-text font-medium">Website:</span>
              <span>{clinic.website}</span>
            </div>
          )}
          {clinic.phone && (
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-text font-medium">Phone:</span>
              <span>{clinic.phone}</span>
            </div>
          )}
          {clinic.email && (
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-text font-medium">Email:</span>
              <span>{clinic.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      {(clinicPhotos.length > 0 || logoPhoto || providersWithPhotos.length > 0) && (
        <div className="mb-6 border border-border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-border">
            <h3 className="font-semibold">
              PHOTOS ({clinicPhotos.length + (logoPhoto ? 1 : 0) + providersWithPhotos.length})
            </h3>
            <button
              onClick={() => onEdit(getEditStep('photos'))}
              className="text-primary hover:underline text-sm"
            >
              Edit
            </button>
          </div>
          <div className="px-6 py-4 space-y-4">
            {/* Clinic Logo - Circular preview */}
            {logoPhoto && (
              <div className="flex items-center gap-4">
                <img
                  src={getPhotoUrl(logoPhoto)}
                  alt="Clinic logo"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
                <div>
                  <span className="text-sm font-medium">Clinic Logo</span>
                  <p className="text-xs text-text">
                    {logoPhoto.photoData ? '✓ Uploaded' : '✓ Existing'}
                  </p>
                </div>
              </div>
            )}

            {/* Clinic Gallery Photos */}
            {clinicPhotos.length > 0 && (
              <div>
                <span className="text-sm font-medium">Clinic Photos:</span>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {clinicPhotos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={getPhotoUrl(photo)}
                        alt="Clinic"
                        className="w-16 h-16 object-cover rounded border border-border"
                      />
                      {photo.isPrimary && (
                        <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ★
                        </div>
                      )}
                      {!photo.photoData && (photo.photoUrl || photo.photoURL) && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full px-1 text-[10px]">
                          Existing
                        </div>
                      )}
                    </div>
                  ))}
                  <span className="text-sm text-text self-center ml-2">
                    {clinicPhotos.length} photo{clinicPhotos.length !== 1 ? 's' : ''} ({clinicPhotos.filter(p => p.isPrimary).length} primary)
                  </span>
                </div>
              </div>
            )}

            {/* Provider Photos - Circular previews */}
            {providersWithPhotos.length > 0 && (
              <div>
                <span className="text-sm font-medium mb-2 block">Provider Photos:</span>
                <div className="flex gap-4 flex-wrap">
                  {providersWithPhotos.map((provider, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img
                        src={getPhotoUrl(provider)}
                        alt={provider.providerName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                      <span className="text-sm text-text">{provider.providerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Providers */}
      {providers && providers.length > 0 && (
        <div className="mb-6 border border-border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-border">
            <h3 className="font-semibold">PROVIDERS ({providers.length})</h3>
            <button
              onClick={() => onEdit(getEditStep('providers'))}
              className="text-primary hover:underline text-sm"
            >
              Edit
            </button>
          </div>
          <div className="px-6 py-4">
            <ul className="space-y-3">
              {providers.map((provider, index) => (
                <li key={index} className="flex items-center gap-3">
                  {/* Circular photo or placeholder */}
                  {getPhotoUrl(provider) ? (
                    <img
                      src={getPhotoUrl(provider)}
                      alt={provider.providerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <ProviderPhotoPlaceholder name={provider.providerName} size={40} />
                  )}
                  <span>{provider.providerName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Procedures */}
      {procedures && procedures.length > 0 && (
        <div className="mb-6 border border-border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-border">
            <h3 className="font-semibold">PROCEDURES ({procedures.length})</h3>
            <button
              onClick={() => onEdit(getEditStep('procedures'))}
              className="text-primary hover:underline text-sm"
            >
              Edit
            </button>
          </div>
          <div className="px-6 py-4">
            <ul className="space-y-3">
              {procedures.map((procedure, index) => (
                <li key={index} className="flex flex-col">
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>{procedure.procedureName}</strong> ({procedure.category}) - {formatPrice(procedure)}
                    </span>
                  </div>
                  {procedure.providerNames && procedure.providerNames.length > 0 && (
                    <div className="ml-6 text-sm text-text">
                      Providers: {procedure.providerNames.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Advanced Information */}
      {hasAdvancedInfo && (
        <div className="mb-6 border border-border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-border">
            <h3 className="font-semibold">ADVANCED INFO</h3>
            <button
              onClick={() => onEdit(getEditStep('clinic'))}
              className="text-primary hover:underline text-sm"
            >
              Edit
            </button>
          </div>
          <div className="px-6 py-4 space-y-2 text-sm">
            {(advanced.latitude || advanced.longitude) && (
              <div>
                <span className="font-medium">Location:</span> {advanced.latitude}, {advanced.longitude}
              </div>
            )}
            {advanced.placeID && (
              <div>
                <span className="font-medium">Place ID:</span> {advanced.placeID}
              </div>
            )}
            {advanced.googleProfileLink && (
              <div>
                <span className="font-medium">Google Maps:</span> {advanced.googleProfileLink}
              </div>
            )}
            {formatWorkingHours(advanced.workingHours) && (
              <div>
                <span className="font-medium">Hours:</span> {formatWorkingHours(advanced.workingHours)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <span className="text-blue-600 mr-2">ℹ️</span>
          <p className="text-sm text-blue-900">
            Your submission will be reviewed by our team before going live. 
            This typically takes 1-2 business days.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 border border-border rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Go Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review →'}
        </button>
      </div>
    </div>
  );
};

export default Review;
