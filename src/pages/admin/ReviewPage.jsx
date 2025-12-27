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
import './admin.css';

/**
 * Helper to convert existing clinic data to a draft-like format
 */
const clinicToDraftFormat = (clinic, providers, procedures, photos) => {
  // Flatten procedures from grouped format
  const flatProcedures = [];
  if (procedures && typeof procedures === 'object') {
    Object.entries(procedures).forEach(([category, data]) => {
      const procs = data?.procedures || data || [];
      if (Array.isArray(procs)) {
        procs.forEach((proc, idx) => {
          flatProcedures.push({
            draftProcedureId: proc.ProcedureID || proc.procedureId || `procedure-${idx}`,
            procedureName: proc.ProcedureName || proc.procedureName || proc.name || '',
            category: category,
            priceMin: proc.PriceMin || proc.priceMin || null,
            priceMax: proc.PriceMax || proc.priceMax || null,
            priceUnit: proc.PriceUnit || proc.priceUnit || '',
            averagePrice: proc.AveragePrice || proc.averagePrice || proc.price || null,
            providerNames: proc.ProviderNames || proc.providerNames || [],
          });
        });
      }
    });
  }

  // Format providers
  const formattedProviders = (providers || []).map((p, idx) => ({
    draftProviderId: p.ProviderID || p.providerId || `provider-${idx}`,
    providerName: p.ProviderName || p.providerName || '',
    specialty: p.Specialty || p.specialty || '',
    photoUrl: p.PhotoURL || p.photoUrl || p.PhotoUrl || null,
  }));

  // Format photos
  const formattedPhotos = (photos || []).map((p, idx) => ({
    draftPhotoId: p.PhotoID || p.photoId || `photo-${idx}`,
    photoUrl: p.url || p.urls?.medium || p.PhotoUrl || p.photoUrl || '',
    source: p.source || 'google',
    isPrimary: p.isPrimary || false,
  }));

  return {
    draftId: null, // No draft yet
    clinicName: clinic.ClinicName || clinic.clinicName || '',
    address: clinic.Address || clinic.address || '',
    city: clinic.City || clinic.city || '',
    state: clinic.State || clinic.state || '',
    zipCode: clinic.ZipCode || clinic.zipCode || '',
    category: clinic.Category || clinic.category || '',
    website: clinic.Website || clinic.website || '',
    phone: clinic.Phone || clinic.phone || '',
    email: clinic.Email || clinic.email || '',
    description: clinic.Description || clinic.description || '',
    placeId: clinic.PlaceID || clinic.placeId || '',
    googleRating: clinic.GoogleRating || clinic.googleRating || 0,
    googleReviewCount: clinic.GoogleReviewCount || clinic.googleReviewCount || 0,
    workingHours: clinic.WorkingHours || clinic.workingHours || null,
    iconUrl: clinic.Logo || clinic.Photo || clinic.logo || clinic.photo || null,
    submissionFlow: 'add_to_existing',
    providers: formattedProviders,
    procedures: flatProcedures,
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
    if (origProviders[i]?.specialty !== currProviders[i]?.specialty) return true;
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
  const { draftId, clinicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Determine the mode: 'draft' (reviewing existing draft) or 'clinic' (editing existing clinic)
  const isClinicEditMode = !!clinicId && !draftId;
  
  // Navigation context
  const backPath = '/admin/clinics';
  const backLabel = 'Back to Existing Clinics';
  
  // State
  const [draft, setDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null); // For tracking changes
  const [existingClinic, setExistingClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState(isClinicEditMode ? 'preview' : 'preview'); // 'preview' or 'edit'
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
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
        if (isClinicEditMode) {
          // Clinic edit mode: fetch clinic data directly
          const [clinicRes, providersRes, proceduresRes, photosRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/clinics/${clinicId}`, {
              headers: { 'Content-Type': 'application/json' },
            }),
            fetch(`${API_BASE_URL}/api/clinics/${clinicId}/providers`, {
              headers: { 'Content-Type': 'application/json' },
            }),
            fetch(`${API_BASE_URL}/api/clinics/${clinicId}/procedures`, {
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
          const providersData = await providersRes.json();
          const proceduresData = await proceduresRes.json();
          let photosData = { photos: [] };
          if (photosRes.ok) {
            photosData = await photosRes.json();
          }

          // Convert to draft format
          const draftFormat = clinicToDraftFormat(
            clinicData,
            providersData.providers || [],
            proceduresData,
            photosData.photos || []
          );

          setDraft(draftFormat);
          setOriginalDraft(JSON.parse(JSON.stringify(draftFormat))); // Deep copy for comparison
          setExistingClinic({
            ...clinicData,
            ClinicID: parseInt(clinicId, 10),
            providers: providersData.providers || [],
            procedures: proceduresData,
          });

          // Set photo source based on available photos
          const photos = photosData.photos || [];
          if (photos.length > 0) {
            setPhotoSource('google');
          }

          // Set rating source
          if (clinicData.GoogleRating || clinicData.googleRating) {
            setRatingSource('google');
            setManualRating((clinicData.GoogleRating || clinicData.googleRating || 0).toString());
            setManualReviewCount((clinicData.GoogleReviewCount || clinicData.googleReviewCount || 0).toString());
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
            const normalizedDraft = normalizeDraft(data.draft);
            setDraft(normalizedDraft);
            setOriginalDraft(JSON.parse(JSON.stringify(normalizedDraft)));
            setExistingClinic(data.existingClinic || null);
            
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
  }, [draftId, clinicId, isClinicEditMode]);

  // Handle draft update from edit mode
  const handleDraftUpdate = useCallback((updatedDraft) => {
    const normalizedDraft = normalizeDraft(updatedDraft);
    setDraft(normalizedDraft);
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
          specialty: p.specialty,
          photoURL: p.photoUrl || p.photoURL || null,
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
    if (isClinicEditMode) {
      // Reset to original data
      setDraft(JSON.parse(JSON.stringify(originalDraft)));
    }
    setMode('preview');
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
          {isClinicEditMode ? 'Clinic not found' : 'Draft not found'}
        </h2>
        <p className="text-text mb-4">
          The requested {isClinicEditMode ? 'clinic' : 'draft'} could not be found.
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
  const pageTitle = isClinicEditMode 
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
          {isClinicEditMode && (
            <span className="status-badge bg-blue-100 text-blue-800">
              Editing Live Clinic
            </span>
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
          </div>
        </>
      ) : (
        /* Edit Mode */
        <EditTabs
          draft={draft}
          onDraftUpdate={handleDraftUpdate}
          onSave={isClinicEditMode ? handleSaveChanges : () => setMode('preview')}
          onCancel={handleCancelEdit}
          // For clinic edit mode, disable save if no changes
          saveDisabled={isClinicEditMode && !hasUnsavedChanges}
          saveLabel={isClinicEditMode ? (hasUnsavedChanges ? 'Save Changes' : 'No Changes') : 'Save & Return to Preview'}
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
    </div>
  );
};

export default ReviewPage;
