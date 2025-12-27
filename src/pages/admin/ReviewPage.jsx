import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { getAuthHeaders } from './hooks/useAuth';
import DraftClinicPreview from './components/DraftClinicPreview';
import EditTabs from './components/EditTabs';
import ApprovalDialog from './components/ApprovalDialog';
import RejectDialog from './components/RejectDialog';
import AdjustmentDiff from './components/AdjustmentDiff';
import { normalizeDraft } from './utils/draftToClinicFormat';
import './admin.css';

const ReviewPage = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  
  const [draft, setDraft] = useState(null);
  const [existingClinic, setExistingClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('preview'); // 'preview' or 'edit'
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Data sources state
  const [photoSource, setPhotoSource] = useState('user');
  const [ratingSource, setRatingSource] = useState('google');
  const [manualRating, setManualRating] = useState('');
  const [manualReviewCount, setManualReviewCount] = useState('');

  // Fetch draft data
  useEffect(() => {
    const fetchDraft = async () => {
      // Check if draftId is valid
      if (!draftId || draftId === 'undefined') {
        setError('Invalid draft ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
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
          // Normalize draft data to camelCase for consistent handling
          const normalizedDraft = normalizeDraft(data.draft);
          setDraft(normalizedDraft);
          setExistingClinic(data.existingClinic || null);
          
          // Set default photo source based on user photos count
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
      } catch (err) {
        console.error('Failed to fetch draft:', err);
        setError('Failed to load draft. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (draftId) {
      fetchDraft();
    }
  }, [draftId]);

  // Handle draft update from edit mode
  const handleDraftUpdate = (updatedDraft) => {
    // Normalize the updated draft to ensure consistent camelCase format
    const normalizedDraft = normalizeDraft(updatedDraft);
    setDraft(normalizedDraft);
  };

  // Handle approval
  const handleApprove = async () => {
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
        navigate('/admin', { 
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

  // Handle rejection
  const handleReject = async (reason) => {
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
        navigate('/admin', { 
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
          to="/admin"
          className="text-primary hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-dark mb-2">Draft not found</h2>
        <p className="text-text mb-4">The requested draft could not be found.</p>
        <Link
          to="/admin"
          className="text-primary hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isAdjustment = draft.submissionFlow === 'add_to_existing';

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="text-text hover:text-dark transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <h1 className="text-xl font-semibold text-dark">
            Review: {draft.clinicName}
          </h1>
        </div>
        
        {isAdjustment && (
          <span className="status-badge status-badge-adjustment">
            Adjustment
          </span>
        )}
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
          {/* Adjustment Diff (for adjustments only) */}
          {isAdjustment && existingClinic && (
            <AdjustmentDiff 
              draft={draft} 
              existingClinic={existingClinic} 
            />
          )}

          {/* Preview Mode - Full-width clinic preview */}
          <DraftClinicPreview
            draft={draft}
            existingClinic={existingClinic}
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
          </div>
        </>
      ) : (
        /* Edit Mode */
        <EditTabs
          draft={draft}
          onDraftUpdate={handleDraftUpdate}
          onSave={() => setMode('preview')}
          onCancel={() => setMode('preview')}
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

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <ApprovalDialog
          draft={draft}
          photoSource={photoSource}
          ratingSource={ratingSource}
          onConfirm={handleApprove}
          onCancel={() => setShowApprovalDialog(false)}
        />
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
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

