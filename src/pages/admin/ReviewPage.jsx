import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { getAuthHeaders } from './hooks/useAuth';
import DraftClinicPreview from './components/DraftClinicPreview';
import EditTabs from './components/EditTabs';
import ApprovalDialog from './components/ApprovalDialog';
import RejectDialog from './components/RejectDialog';
import AdjustmentDiff from './components/AdjustmentDiff';
import { normalizeDraft } from './utils/draftToClinicFormat';
import Toast from '../../components/Toast';
import './admin.css';

/**
 * Helper to check if a value is a placeholder that should be ignored
 */
const isPlaceholderValue = (value) => {
  const placeholders = [
    'see existing clinic',
    'existing clinic update',
    'placeholder',
    'test',
    'n/a',
  ];
  return !value || placeholders.includes(String(value).toLowerCase().trim());
};

/**
 * Merge draft data with existing clinic data for adjustment submissions
 * Draft values take precedence, but we fall back to existing clinic values
 * for any fields that are empty or contain placeholder values
 */
const mergeDraftWithExistingClinic = (draft, existingClinic) => {
  if (!existingClinic) return draft;
  
  // Helper to merge a field - use draft value if valid, otherwise use existing
  const mergeField = (draftValue, existingValue) => {
    if (!isPlaceholderValue(draftValue)) {
      return draftValue;
    }
    return existingValue || '';
  };
  
  // Get existing providers (already in camelCase from API)
  const existingProviders = (existingClinic.providers || []).map((p, idx) => ({
    draftProviderId: p.providerId || `existing-provider-${idx}`,
    providerName: p.providerName || '',
    photoUrl: p.photoUrl || null,
  }));
  
  // Get existing procedures (already flat from API)
  const existingProcedures = (existingClinic.procedures || []).map((p, idx) => ({
    draftProcedureId: p.procedureId || `existing-procedure-${idx}`,
    procedureName: p.procedureName || '',
    category: p.category || '',
    priceMin: p.priceMin || null,
    priceMax: p.priceMax || null,
    priceUnit: p.priceUnit || '',
    averagePrice: p.averageCost || p.price || null,
    providerNames: p.providerNames || [],
  }));
  
  // Merge procedures - keep draft procedures and merge with existing data
  const mergedProcedures = (draft.procedures || []).map(draftProc => {
    // Find matching existing procedure by name
    const existingProc = existingProcedures.find(ep => 
      (ep.procedureName || '').toLowerCase() === (draftProc.procedureName || '').toLowerCase()
    );
    
    if (existingProc) {
      // Helper to get best available price value (treat 0 as missing)
      const getValidPrice = (draftVal, existingVal, fallbackAvg) => {
        if (draftVal && draftVal > 0) return draftVal;
        if (existingVal && existingVal > 0) return existingVal;
        if (fallbackAvg && fallbackAvg > 0) return fallbackAvg;
        return null;
      };
      
      // Get the best available average price
      const existingAvg = existingProc.averagePrice || null;
      const mergedAvg = draftProc.averagePrice || existingAvg;
      
      // For min/max: if both are 0/null but we have an average, use the average
      let mergedMin = getValidPrice(draftProc.priceMin, existingProc.priceMin, null);
      let mergedMax = getValidPrice(draftProc.priceMax, existingProc.priceMax, null);
      
      // If no min/max but we have average, use average as both min and max
      if (!mergedMin && !mergedMax && mergedAvg) {
        mergedMin = mergedAvg;
        mergedMax = mergedAvg;
      }
      
      // Merge draft procedure with existing - draft values take precedence if valid
      return {
        ...draftProc,
        priceMin: mergedMin,
        priceMax: mergedMax,
        priceUnit: draftProc.priceUnit || existingProc.priceUnit,
        averagePrice: mergedAvg,
        providerNames: draftProc.providerNames?.length > 0 
          ? draftProc.providerNames 
          : existingProc.providerNames,
      };
    }
    
    return draftProc;
  });
  
  // Also add any existing procedures that aren't in the draft
  const draftProcNames = (draft.procedures || []).map(p => 
    (p.procedureName || '').toLowerCase()
  );
  const missingProcedures = existingProcedures.filter(ep => 
    !draftProcNames.includes((ep.procedureName || '').toLowerCase())
  );
  
  // Merge providers similarly
  const draftProviderNames = (draft.providers || []).map(p => 
    (p.providerName || '').toLowerCase()
  );
  const missingProviders = existingProviders.filter(ep =>
    !draftProviderNames.includes((ep.providerName || '').toLowerCase())
  );
  
  return {
    ...draft,
    clinicName: mergeField(draft.clinicName, existingClinic.clinicName),
    address: mergeField(draft.address, existingClinic.address),
    city: mergeField(draft.city, existingClinic.city),
    state: mergeField(draft.state, existingClinic.state),
    zipCode: draft.zipCode || existingClinic.zipCode || '',
    category: draft.category || existingClinic.category || '',
    website: draft.website || existingClinic.website || '',
    phone: draft.phone || existingClinic.phone || '',
    email: draft.email || existingClinic.email || '',
    description: draft.description || existingClinic.description || '',
    placeId: draft.placeId || existingClinic.placeId || '',
    googleRating: draft.googleRating || existingClinic.googleRating || 0,
    googleReviewCount: draft.googleReviewCount || existingClinic.googleReviewCount || 0,
    workingHours: draft.workingHours || existingClinic.workingHours || null,
    iconUrl: draft.iconUrl || existingClinic.logo || existingClinic.photo || null,
    // Merge providers - keep draft providers, add missing existing providers
    providers: [...(draft.providers || []), ...missingProviders],
    // Merge procedures - merged draft procedures + missing existing procedures
    procedures: [...mergedProcedures, ...missingProcedures],
  };
};

/**
 * Convert deleted clinic data to a draft-like format
 * Deleted clinics have a simpler structure from the list endpoint
 */
const deletedClinicToDraftFormat = (deletedClinicData) => {
  // Parse address to extract city/state if possible
  const addressParts = (deletedClinicData.address || '').split(',').map(s => s.trim());
  const city = addressParts.length > 1 ? addressParts[addressParts.length - 2] : '';
  const state = addressParts.length > 1 ? addressParts[addressParts.length - 1].split(' ')[0] : '';
  const zipCode = addressParts.length > 1 ? addressParts[addressParts.length - 1].split(' ')[1] || '' : '';

  return {
    draftId: null,
    clinicName: deletedClinicData.clinicName || '',
    address: deletedClinicData.address || '',
    city: city,
    state: state,
    zipCode: zipCode,
    category: '',
    website: deletedClinicData.website || '',
    phone: deletedClinicData.phone || '',
    email: '',
    description: '',
    placeId: '',
    googleRating: deletedClinicData.rating || 0,
    googleReviewCount: deletedClinicData.reviewCount || 0,
    workingHours: null,
    iconUrl: null,
    submissionFlow: 'add_to_existing',
    providers: [],
    procedures: [],
    photos: [],
  };
};

/**
 * Convert existing clinic data to a draft-like format
 * Simplified version - API now returns camelCase directly
 */
const clinicToDraftFormat = (clinicData, photos) => {
  // Format providers (already included in clinicData from ?include=providers)
  const formattedProviders = (clinicData.providers || []).map((p, idx) => ({
    draftProviderId: p.providerId || `provider-${idx}`,
    providerName: p.providerName || '',
    photoUrl: p.photoUrl || null,
  }));

  // Format procedures (already included in clinicData from ?include=procedures)
  const formattedProcedures = (clinicData.procedures || []).map((p, idx) => ({
    draftProcedureId: p.procedureId || `procedure-${idx}`,
    procedureName: p.procedureName || '',
    category: p.category || '',
    priceMin: p.priceMin || null,
    priceMax: p.priceMax || null,
    priceUnit: p.priceUnit || '',
    averagePrice: p.averageCost || p.price || null,
    providerNames: p.providerNames || [],
  }));

  // Format photos
  const formattedPhotos = (photos || []).map((p, idx) => ({
    draftPhotoId: p.photoId || `photo-${idx}`,
    photoUrl: p.url || p.urls?.medium || p.photoUrl || '',
    source: p.source || 'google',
    isPrimary: p.isPrimary || false,
  }));

  return {
    draftId: null, // No draft yet
    clinicName: clinicData.clinicName || '',
    address: clinicData.address || '',
    city: clinicData.city || '',
    state: clinicData.state || '',
    zipCode: clinicData.zipCode || '',
    category: clinicData.category || '',
    website: clinicData.website || '',
    phone: clinicData.phone || '',
    email: clinicData.email || '',
    description: clinicData.description || '',
    placeId: clinicData.placeId || '',
    googleRating: clinicData.googleRating || 0,
    googleReviewCount: clinicData.googleReviewCount || 0,
    workingHours: clinicData.workingHours || null,
    iconUrl: clinicData.logo || clinicData.photo || null,
    submissionFlow: 'add_to_existing',
    providers: formattedProviders,
    procedures: formattedProcedures,
    photos: formattedPhotos,
  };
};

/**
 * Deep compare two objects to check if there are any changes
 */
const hasChanges = (original, current) => {
  if (!original || !current) return false;
  
  // Compare basic fields
  const fieldsToCompare = [
    'clinicName', 'address', 'city', 'state', 'zipCode', 'category',
    'website', 'phone', 'email', 'description'
  ];
  
  for (const field of fieldsToCompare) {
    const origVal = original[field] || '';
    const currVal = current[field] || '';
    if (origVal !== currVal) return true;
  }
  
  // Compare providers (by count and names)
  const origProviders = original.providers || [];
  const currProviders = current.providers || [];
  if (origProviders.length !== currProviders.length) return true;
  for (let i = 0; i < currProviders.length; i++) {
    if (origProviders[i]?.providerName !== currProviders[i]?.providerName) return true;
  }
  
  // Compare procedures (by count and names)
  const origProcs = original.procedures || [];
  const currProcs = current.procedures || [];
  if (origProcs.length !== currProcs.length) return true;
  for (let i = 0; i < currProcs.length; i++) {
    if (origProcs[i]?.procedureName !== currProcs[i]?.procedureName) return true;
    if (origProcs[i]?.category !== currProcs[i]?.category) return true;
  }
  
  // Compare photos (by count)
  const origPhotos = original.photos || [];
  const currPhotos = current.photos || [];
  if (origPhotos.length !== currPhotos.length) return true;
  
  return false;
};

const ReviewPage = () => {
  const { draftId, clinicId, deletedClinicId } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [searchParams] = useSearchParams();
  
  // Determine the mode: 'draft' (reviewing existing draft), 'clinic' (editing existing clinic), or 'deleted' (restoring deleted clinic)
  const isClinicEditMode = !!clinicId && !draftId && !deletedClinicId;
  const isDeletedClinicMode = !!deletedClinicId && !draftId && !clinicId;
  
  // Navigation context
  const backPath = isDeletedClinicMode ? '/admin/deleted-clinics' : '/admin/clinics';
  const backLabel = isDeletedClinicMode ? 'Back to Recently Deleted' : 'Back to Existing Clinics';
  
  // State
  const [draft, setDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null); // For tracking changes
  const [existingClinic, setExistingClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('preview'); // 'preview' or 'edit'
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  
  // Data sources state
  const [photoSource, setPhotoSource] = useState('google');
  const [ratingSource, setRatingSource] = useState('google');
  const [manualRating, setManualRating] = useState('');
  const [manualReviewCount, setManualReviewCount] = useState('');

  // Check if there are unsaved changes (for clinic edit mode)
  const hasUnsavedChanges = useMemo(() => {
    if (!isClinicEditMode) return false;
    return hasChanges(originalDraft, draft);
  }, [isClinicEditMode, originalDraft, draft]);

  // Fetch data based on mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isDeletedClinicMode) {
          // Deleted clinic restore mode: fetch deleted clinic data from list
          // Note: We fetch from the list endpoint and find the matching clinic
          const response = await fetch(
            `${API_BASE_URL}/api/admin/clinics/deleted?page=1&limit=100`,
            {
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
              },
            }
          );

          const data = await response.json();

          if (data.success) {
            const deletedClinic = data.clinics.find(
              c => c.id === parseInt(deletedClinicId, 10)
            );

            if (!deletedClinic) {
              throw new Error('Deleted clinic not found');
            }

            // Convert to draft format
            const draftFormat = deletedClinicToDraftFormat(deletedClinic);

            setDraft(draftFormat);
            setOriginalDraft(JSON.parse(JSON.stringify(draftFormat)));
            setExistingClinic(null);

            // Set photo source
            setPhotoSource('google');

            // Set rating source
            if (deletedClinic.rating) {
              setRatingSource('google');
              setManualRating((deletedClinic.rating || 0).toString());
              setManualReviewCount((deletedClinic.reviewCount || 0).toString());
            }
          } else {
            throw new Error(data.error || 'Failed to fetch deleted clinic');
          }
        } else if (isClinicEditMode) {
          // Clinic edit mode: fetch clinic data with providers and procedures included
          const [clinicRes, photosRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/clinics/${clinicId}?include=providers,procedures`, {
              headers: { 'Content-Type': 'application/json' },
            }),
            fetch(`${API_BASE_URL}/api/clinics/${clinicId}/photos`, {
              headers: { 'Content-Type': 'application/json' },
            }),
          ]);

          if (!clinicRes.ok) {
            throw new Error('Failed to fetch clinic details');
          }

          const clinicData = await clinicRes.json();
          let photosData = { photos: [] };
          if (photosRes.ok) {
            photosData = await photosRes.json();
          }

          // Convert to draft format (simplified - data is already camelCase)
          const draftFormat = clinicToDraftFormat(clinicData, photosData.photos || []);

          setDraft(draftFormat);
          setOriginalDraft(JSON.parse(JSON.stringify(draftFormat))); // Deep copy for comparison
          setExistingClinic({
            ...clinicData,
            clinicId: parseInt(clinicId, 10),
          });

          // Set photo source based on available photos
          const photos = photosData.photos || [];
          if (photos.length > 0) {
            setPhotoSource('google');
          }

          // Set rating source
          if (clinicData.googleRating) {
            setRatingSource('google');
            setManualRating((clinicData.googleRating || 0).toString());
            setManualReviewCount((clinicData.googleReviewCount || 0).toString());
          }
        } else {
          // Draft review mode: fetch draft data
          if (!draftId || draftId === 'undefined') {
            setError('Invalid draft ID');
            setLoading(false);
            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/drafts/${draftId}`,
            {
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
              },
            }
          );

          const data = await response.json();

          if (data.success) {
            let normalizedDraft = normalizeDraft(data.draft);
            let existingClinicData = data.existingClinic || null;
            
            // For adjustment drafts, existingClinic now includes providers and procedures
            // from the API, so no additional fetches needed
            if (existingClinicData && normalizedDraft.submissionFlow === 'add_to_existing') {
              // Merge draft with existing clinic data to fill in missing fields
              normalizedDraft = mergeDraftWithExistingClinic(normalizedDraft, existingClinicData);
            }
            
            setDraft(normalizedDraft);
            setOriginalDraft(JSON.parse(JSON.stringify(normalizedDraft)));
            setExistingClinic(existingClinicData);
            
            // Set default photo source
            const userPhotoCount = normalizedDraft.photos?.filter(p => p.source === 'user').length || 0;
            if (userPhotoCount >= 3) {
              setPhotoSource('user');
            } else if (userPhotoCount > 0) {
              setPhotoSource('both');
            } else {
              setPhotoSource('google');
            }
            
            // Set default rating source
            const hasGoogleRating = normalizedDraft.googleRating && normalizedDraft.googleRating > 0;
            setRatingSource(hasGoogleRating ? 'google' : 'manual');
            if (normalizedDraft.googleRating) {
              setManualRating(normalizedDraft.googleRating.toString());
            }
            if (normalizedDraft.googleReviewCount) {
              setManualReviewCount(normalizedDraft.googleReviewCount.toString());
            }
          } else {
            setError(data.error || 'Failed to fetch draft');
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [draftId, clinicId, deletedClinicId, isClinicEditMode, isDeletedClinicMode]);

  // Handle draft update from edit mode
  const handleDraftUpdate = useCallback((updatedDraft) => {
    setDraft(updatedDraft);
  }, []);

  // Handle saving changes (creates a draft for clinic edit mode)
  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) {
      setMode('preview');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create a submission payload
      const payload = {
        submitterKey: 'admin-edit',
        flow: 'add_to_existing',
        existingClinicId: parseInt(clinicId, 10),
        clinic: {
          clinicName: draft.clinicName,
          address: draft.address,
          city: draft.city,
          state: draft.state,
          zipCode: draft.zipCode,
          category: draft.category,
          website: draft.website,
          phone: draft.phone,
          email: draft.email,
        },
        advanced: {
          latitude: draft.latitude || null,
          longitude: draft.longitude || null,
          placeID: draft.placeId || null,
          description: draft.description || null,
          googleProfileLink: draft.googleProfileLink || null,
          workingHours: draft.workingHours || null,
        },
        providers: (draft.providers || []).map(p => ({
          providerName: p.providerName,
          photoUrl: p.photoUrl || null,
        })),
        procedures: (draft.procedures || []).map(p => ({
          procedureName: p.procedureName,
          category: p.category,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
          unit: p.priceUnit || p.unit,
          averagePrice: p.averagePrice,
          providerNames: p.providerNames || [],
        })),
        photos: (draft.photos || []).filter(p => p.source === 'user').map(p => ({
          photoUrl: p.photoUrl,
          photoData: p.photoData,
          source: p.source,
          isPrimary: p.isPrimary,
        })),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/clinic-management/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success && data.draftId) {
        // Navigate to the draft review page
        navigate(`/admin/review/${data.draftId}?from=clinics`);
      } else {
        throw new Error(data.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle approval (only for draft mode)
  const handleApprove = async () => {
    if (!draftId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draftId}/approve`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoSource,
            ratingSource,
            manualRating: ratingSource === 'manual' ? parseFloat(manualRating) : null,
            manualReviewCount: ratingSource === 'manual' ? parseInt(manualReviewCount, 10) : null,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        navigate(backPath, { 
          state: { 
            success: `Clinic "${draft.clinicName}" has been approved!` 
          } 
        });
      } else {
        setError(data.error || 'Failed to approve draft');
      }
    } catch (err) {
      console.error('Approval failed:', err);
      setError('Failed to approve. Please try again.');
    }
    
    setShowApprovalDialog(false);
  };

  // Handle rejection (only for draft mode)
  const handleReject = async (reason) => {
    if (!draftId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draftId}/reject`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        navigate(backPath, { 
          state: { 
            success: `Clinic "${draft.clinicName}" has been rejected.` 
          } 
        });
      } else {
        setError(data.error || 'Failed to reject draft');
      }
    } catch (err) {
      console.error('Rejection failed:', err);
      setError('Failed to reject. Please try again.');
    }
    
    setShowRejectDialog(false);
  };

  // Handle cancel in edit mode
  const handleCancelEdit = () => {
    if (isClinicEditMode || isDeletedClinicMode) {
      // Reset to original data
      setDraft(JSON.parse(JSON.stringify(originalDraft)));
    }
    setMode('preview');
  };

  // Handle restore clinic
  const handleRestoreClinic = async () => {
    if (!deletedClinicId || !draft) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/clinics/deleted/${deletedClinicId}/restore`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setToastMessage(`Clinic "${data.clinicName || draft.clinicName}" restored successfully`);
        setToastVisible(true);
        // Navigate back to clinics page after a short delay
        setTimeout(() => {
          navigate('/admin/clinics', {
            state: {
              success: `Clinic "${data.clinicName || draft.clinicName}" has been restored successfully.`
            }
          });
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to restore clinic');
      }
    } catch (err) {
      console.error('Restore failed:', err);
      setError(`Failed to restore clinic: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete clinic
  const handleDeleteClinic = async () => {
    if (!clinicId || !draft) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/clinics/${clinicId}`,
        {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setToastMessage(`Clinic "${data.clinicName || draft.clinicName}" deleted successfully`);
        setToastVisible(true);
        // Navigate back to clinics page after a short delay
        setTimeout(() => {
          navigate('/admin/clinics', {
            state: {
              success: `Clinic "${data.clinicName || draft.clinicName}" has been deleted. It can be restored within 30 days.`
            }
          });
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to delete clinic');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError(`Failed to delete clinic: ${err.message}`);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
          {error}
        </div>
        <Link
          to={backPath}
          className="text-primary hover:underline"
        >
          ← {backLabel}
        </Link>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-dark mb-2">
          {isDeletedClinicMode ? 'Deleted clinic not found' : isClinicEditMode ? 'Clinic not found' : 'Draft not found'}
        </h2>
        <p className="text-text mb-4">
          The requested {isDeletedClinicMode ? 'deleted clinic' : isClinicEditMode ? 'clinic' : 'draft'} could not be found.
        </p>
        <Link
          to={backPath}
          className="text-primary hover:underline"
        >
          ← {backLabel}
        </Link>
      </div>
    );
  }

  const isAdjustment = draft.submissionFlow === 'add_to_existing';
  const pageTitle = isDeletedClinicMode
    ? `Restore: ${draft.clinicName}`
    : isClinicEditMode 
    ? `Edit: ${draft.clinicName}` 
    : `Review: ${draft.clinicName}`;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={backPath}
            className="text-text hover:text-dark transition-colors"
          >
            ← {backLabel}
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <h1 className="text-xl font-semibold text-dark">
            {pageTitle}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isClinicEditMode && hasUnsavedChanges && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          {!isClinicEditMode && isAdjustment && (
            <span className="status-badge status-badge-adjustment">
              Adjustment
            </span>
          )}
          {isDeletedClinicMode && (
            <span className="status-badge bg-amber-100 text-amber-800">
              Restoring Deleted Clinic
            </span>
          )}
          {isClinicEditMode && (
            <>
              <span className="status-badge bg-blue-100 text-blue-800">
                Editing Live Clinic
              </span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : '🗑️ Delete Clinic'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('preview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'preview'
              ? 'bg-primary text-white'
              : 'bg-white border border-border text-text hover:border-primary'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'edit'
              ? 'bg-primary text-white'
              : 'bg-white border border-border text-text hover:border-primary'
          }`}
        >
          Edit Data
        </button>
      </div>

      {mode === 'preview' ? (
        <>
          {/* Info banner for deleted clinic restore mode */}
          {isDeletedClinicMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">
                    Restoring Deleted Clinic
                  </h4>
                  <p className="text-sm text-amber-700">
                    This clinic was previously deleted. You can preview and edit the data before restoring it.
                    Once restored, the clinic will immediately appear in regular clinic listings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info banner for clinic edit mode */}
          {isClinicEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">ℹ️</span>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Previewing Live Clinic
                  </h4>
                  <p className="text-sm text-blue-700">
                    This is how the clinic currently appears. Switch to "Edit Data" to make changes.
                    Changes will only be saved when you click "Save Changes" after making edits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Adjustment Diff (only for draft mode with adjustments) */}
          {!isClinicEditMode && isAdjustment && existingClinic && (
            <AdjustmentDiff 
              draft={draft} 
              existingClinic={existingClinic} 
            />
          )}

          {/* Preview Mode - Full-width clinic preview */}
          <DraftClinicPreview
            draft={draft}
            existingClinic={isClinicEditMode ? null : existingClinic}
            photoSource={photoSource}
            ratingSource={ratingSource}
            manualRating={manualRating}
            manualReviewCount={manualReviewCount}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
            {isDeletedClinicMode ? (
              <>
                <button
                  onClick={() => setMode('edit')}
                  className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  ✏️ Edit Data
                </button>
                <button
                  onClick={handleRestoreClinic}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Restoring...' : '✓ Restore Clinic'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMode('edit')}
                  className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  ✏️ Edit Data
                </button>
                
                {!isClinicEditMode && (
                  <>
                    <button
                      onClick={() => setShowRejectDialog(true)}
                      className="px-6 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      ✗ Reject
                    </button>
                    <button
                      onClick={() => setShowApprovalDialog(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        /* Edit Mode */
        <EditTabs
          draft={draft}
          onDraftUpdate={handleDraftUpdate}
          onSave={isClinicEditMode ? handleSaveChanges : isDeletedClinicMode ? () => setMode('preview') : () => setMode('preview')}
          onCancel={handleCancelEdit}
          // For clinic edit mode, disable save if no changes
          saveDisabled={isClinicEditMode && !hasUnsavedChanges}
          saveLabel={isClinicEditMode ? (hasUnsavedChanges ? 'Save Changes' : 'No Changes') : isDeletedClinicMode ? 'Save & Return to Preview' : 'Save & Return to Preview'}
          saving={saving}
          // Pass clinicId for Google Photos fetching in clinic edit mode
          clinicId={isClinicEditMode ? parseInt(clinicId, 10) : null}
          // Pass data sources state to EditTabs
          photoSource={photoSource}
          setPhotoSource={setPhotoSource}
          ratingSource={ratingSource}
          setRatingSource={setRatingSource}
          manualRating={manualRating}
          setManualRating={setManualRating}
          manualReviewCount={manualReviewCount}
          setManualReviewCount={setManualReviewCount}
        />
      )}

      {/* Approval Dialog (draft mode only) */}
      {showApprovalDialog && !isClinicEditMode && (
        <ApprovalDialog
          draft={draft}
          photoSource={photoSource}
          ratingSource={ratingSource}
          onConfirm={handleApprove}
          onCancel={() => setShowApprovalDialog(false)}
        />
      )}

      {/* Reject Dialog (draft mode only) */}
      {showRejectDialog && !isClinicEditMode && (
        <RejectDialog
          draft={draft}
          onConfirm={handleReject}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && isClinicEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark mb-4">
              Delete Clinic
            </h3>
            <p className="text-text mb-6">
              Are you sure you want to delete "{draft?.clinicName}"? This action can be undone within 30 days by restoring the clinic from the Recently Deleted section.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClinic}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Clinic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          isVisible={toastVisible}
          onClose={() => {
            setToastVisible(false);
            setToastMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default ReviewPage;
