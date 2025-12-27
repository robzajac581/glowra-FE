import React, { useState } from 'react';
import API_BASE_URL from '../../../../config/api';
import { getAuthHeaders } from '../../hooks/useAuth';

/**
 * DataSourcesTab Component
 * Manages data source configuration for clinic drafts:
 * - Google Place ID lookup
 * - Rating source (Google vs Manual)
 * - Photo source selection
 * - Submission info display
 */
const DataSourcesTab = ({
  draft,
  photoSource,
  setPhotoSource,
  ratingSource,
  setRatingSource,
  manualRating,
  setManualRating,
  manualReviewCount,
  setManualReviewCount,
  onDraftUpdate,
}) => {
  const [lookingUpPlaceId, setLookingUpPlaceId] = useState(false);
  const [fetchingGooglePhotos, setFetchingGooglePhotos] = useState(false);
  const [fetchingGoogleData, setFetchingGoogleData] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userPhotoCount = draft.photos?.filter(p => p.source === 'user').length || 0;
  const googlePhotoCount = draft.photos?.filter(p => p.source === 'google').length || 0;

  // Lookup PlaceID
  const handleLookupPlaceId = async () => {
    setLookingUpPlaceId(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}/lookup-placeid`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success && data.placeId) {
        onDraftUpdate({
          ...draft,
          placeId: data.placeId,
        });
        setSuccess('PlaceID found successfully!');
      } else {
        setError(data.error || 'Could not find a matching PlaceID');
      }
    } catch (err) {
      console.error('PlaceID lookup failed:', err);
      setError('Failed to lookup PlaceID');
    } finally {
      setLookingUpPlaceId(false);
    }
  };

  // Fetch Google Photos
  const handleFetchGooglePhotos = async () => {
    setFetchingGooglePhotos(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}/google-photos`,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Merge Google photos with existing photos
        const existingPhotos = draft.photos || [];
        const newGooglePhotos = data.photos.map((p, idx) => ({
          ...p,
          source: 'google',
          draftPhotoId: `google-${idx}`,
        }));

        onDraftUpdate({
          ...draft,
          photos: [...existingPhotos, ...newGooglePhotos],
        });
        setSuccess(`Fetched ${data.photos.length} photos from Google`);
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

  // Fetch Google Data (rating, review count)
  const handleFetchGoogleData = async () => {
    setFetchingGoogleData(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}/fetch-google-data`,
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
        onDraftUpdate({
          ...draft,
          googleRating: data.googleData.rating,
          googleReviewCount: data.googleData.reviewCount,
        });
        setManualRating(data.googleData.rating?.toString() || '');
        setManualReviewCount(data.googleData.reviewCount?.toString() || '');
        setSuccess('Google rating data fetched successfully!');
      } else {
        setError(data.error || 'Failed to fetch Google data');
      }
    } catch (err) {
      console.error('Google data fetch failed:', err);
      setError('Failed to fetch Google data');
    } finally {
      setFetchingGoogleData(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Place ID Section */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-base font-semibold text-dark mb-4 flex items-center gap-2">
            <span className="text-lg">📍</span>
            Google Place ID
          </h3>

          <div className="space-y-3">
            {draft.placeId ? (
              <>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 bg-slate-50 border border-border rounded-lg text-sm font-mono truncate">
                    {draft.placeId}
                  </code>
                </div>
                <button
                  onClick={handleLookupPlaceId}
                  disabled={lookingUpPlaceId}
                  className="w-full px-4 py-2.5 text-sm text-primary border border-primary rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {lookingUpPlaceId ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Looking up...
                    </span>
                  ) : (
                    '🔄 Re-lookup PlaceID'
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-text mb-3">
                  No PlaceID found. Look up the Google Place ID to enable Google data fetching.
                </p>
                <button
                  onClick={handleLookupPlaceId}
                  disabled={lookingUpPlaceId}
                  className="w-full px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {lookingUpPlaceId ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Looking up...
                    </span>
                  ) : (
                    '🔍 Lookup PlaceID'
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Rating Source Section */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-base font-semibold text-dark mb-4 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            Rating Source
          </h3>

          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                ratingSource === 'google'
                  ? 'border-primary bg-purple-50'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="ratingSource"
                value="google"
                checked={ratingSource === 'google'}
                onChange={() => setRatingSource('google')}
                className="w-4 h-4 text-primary"
              />
              <div className="flex-1">
                <span className="font-medium text-dark">Google</span>
                <span className="text-sm text-text ml-2">
                  ({draft.googleRating ? `${draft.googleRating} ★ · ${draft.googleReviewCount || 0} reviews` : 'Not fetched'})
                </span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                ratingSource === 'manual'
                  ? 'border-primary bg-purple-50'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="ratingSource"
                value="manual"
                checked={ratingSource === 'manual'}
                onChange={() => setRatingSource('manual')}
                className="w-4 h-4 text-primary"
              />
              <span className="font-medium text-dark">Manual Entry</span>
            </label>

            {ratingSource === 'manual' && (
              <div className="grid grid-cols-2 gap-3 mt-3 pl-7">
                <div>
                  <label className="block text-xs text-text mb-1.5 font-medium">Rating (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={manualRating}
                    onChange={(e) => setManualRating(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text mb-1.5 font-medium">Review Count</label>
                  <input
                    type="number"
                    min="0"
                    value={manualReviewCount}
                    onChange={(e) => setManualReviewCount(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {ratingSource === 'google' && !draft.googleRating && draft.placeId && (
              <button
                onClick={handleFetchGoogleData}
                disabled={fetchingGoogleData}
                className="w-full px-4 py-2.5 bg-slate-100 text-sm rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetchingGoogleData ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  '🔄 Fetch Rating from Google'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Photo Source Section */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-base font-semibold text-dark mb-4 flex items-center gap-2">
            <span className="text-lg">📷</span>
            Photo Source
          </h3>

          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                photoSource === 'user'
                  ? 'border-primary bg-purple-50'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="photoSource"
                value="user"
                checked={photoSource === 'user'}
                onChange={() => setPhotoSource('user')}
                className="w-4 h-4 text-primary"
              />
              <div className="flex-1">
                <span className="font-medium text-dark">User Photos Only</span>
                <span className="text-sm text-text ml-2">({userPhotoCount})</span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                photoSource === 'google'
                  ? 'border-primary bg-purple-50'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="photoSource"
                value="google"
                checked={photoSource === 'google'}
                onChange={() => setPhotoSource('google')}
                className="w-4 h-4 text-primary"
              />
              <div className="flex-1">
                <span className="font-medium text-dark">Google Photos Only</span>
                <span className="text-sm text-text ml-2">({googlePhotoCount})</span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                photoSource === 'both'
                  ? 'border-primary bg-purple-50'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="photoSource"
                value="both"
                checked={photoSource === 'both'}
                onChange={() => setPhotoSource('both')}
                className="w-4 h-4 text-primary"
              />
              <span className="font-medium text-dark">Both (User Priority)</span>
            </label>

            {/* Fetch Google Photos button */}
            {googlePhotoCount === 0 && draft.placeId && (
              <button
                onClick={handleFetchGooglePhotos}
                disabled={fetchingGooglePhotos}
                className="w-full px-4 py-2.5 bg-slate-100 text-sm rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetchingGooglePhotos ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  '📷 Fetch Google Photos'
                )}
              </button>
            )}

            {/* Photo source recommendation */}
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-text">
                {userPhotoCount >= 3 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-green-600">✓</span>
                    Recommended: User photos (3+ provided)
                  </span>
                ) : userPhotoCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-600">ℹ</span>
                    Consider: Both sources ({userPhotoCount} user photos)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="text-blue-600">ℹ</span>
                    Using Google photos (no user photos submitted)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Submission Info Section */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-base font-semibold text-dark mb-4 flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            Submission Info
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-text">Submission ID</span>
              <span className="text-sm font-medium text-dark">
                {draft.submissionId || `#${draft.draftId}`}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-text">Submitted</span>
              <span className="text-sm font-medium text-dark">
                {new Date(draft.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {draft.submittedBy && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-text">Submitted By</span>
                <span className="text-sm font-medium text-dark">{draft.submittedBy}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-text">Submission Type</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                draft.submissionFlow === 'add_to_existing'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {draft.submissionFlow === 'add_to_existing' ? 'Adjustment' : 'New Clinic'}
              </span>
            </div>
            {draft.submitterKey && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text">Submitter Key</span>
                <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                  {draft.submitterKey}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesTab;

