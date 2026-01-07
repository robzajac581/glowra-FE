import React, { useState } from 'react';
import API_BASE_URL from '../../../../config/api';
import { getAuthHeaders } from '../../hooks/useAuth';

const LocationTab = ({ draft, onUpdate }) => {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isFetchingGoogle, setIsFetchingGoogle] = useState(false);
  const [error, setError] = useState(null);
  const [lookupResult, setLookupResult] = useState(null);

  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Helper to save draft placeId to backend
  const savePlaceIdToBackend = async (placeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...draft, placeId }),
        }
      );
      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Failed to save placeId to backend:', err);
      return false;
    }
  };

  // Lookup PlaceID
  const handleLookupPlaceId = async () => {
    setIsLookingUp(true);
    setError(null);
    setLookupResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}/lookup-placeid`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clinicName: draft.clinicName,
            address: `${draft.address}, ${draft.city}, ${draft.state}`,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.placeId) {
        // Save placeId to backend so it's available for subsequent API calls
        await savePlaceIdToBackend(data.placeId);
        
        setLookupResult(data);
        onUpdate({ placeId: data.placeId });
      } else {
        setError(data.error || 'Could not find a matching PlaceID');
      }
    } catch (err) {
      console.error('PlaceID lookup failed:', err);
      setError('Failed to lookup PlaceID');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Fetch Google Data
  const handleFetchGoogleData = async () => {
    if (!draft.placeId) {
      setError('PlaceID is required to fetch Google data');
      return;
    }

    setIsFetchingGoogle(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}/fetch-google-data`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            placeId: draft.placeId,
            save: true, // Save rating data to draft
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state first
        const updates = {
          googleRating: data.googleData.rating,
          googleReviewCount: data.googleData.reviewCount,
          latitude: data.googleData.latitude || draft.latitude,
          longitude: data.googleData.longitude || draft.longitude,
        };
        
        onUpdate(updates);
        
        // Explicitly save rating data to backend via PUT to ensure it's persisted
        // (in case the fetch-google-data endpoint doesn't save it properly)
        if (draft.draftId) {
          try {
            await fetch(
              `${API_BASE_URL}/api/admin/drafts/${draft.draftId}`,
              {
                method: 'PUT',
                headers: {
                  ...getAuthHeaders(),
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  googleRating: data.googleData.rating,
                  googleReviewCount: data.googleData.reviewCount,
                  latitude: updates.latitude,
                  longitude: updates.longitude,
                }),
              }
            );
          } catch (saveErr) {
            console.error('Failed to save rating data:', saveErr);
            // Non-blocking error - data is still in local state
          }
        }
      } else {
        setError(data.error || 'Failed to fetch Google data');
      }
    } catch (err) {
      console.error('Google data fetch failed:', err);
      setError('Failed to fetch Google data');
    } finally {
      setIsFetchingGoogle(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-dark">Location & Google Data</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Latitude
          </label>
          <input
            type="text"
            value={draft.latitude || ''}
            onChange={(e) => handleChange('latitude', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., 25.7617"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Longitude
          </label>
          <input
            type="text"
            value={draft.longitude || ''}
            onChange={(e) => handleChange('longitude', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., -80.1918"
          />
        </div>
      </div>

      {/* Google Place ID */}
      <div className="border-t border-border pt-6">
        <h4 className="text-md font-semibold text-dark mb-4">Google Places</h4>
        
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Google Place ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={draft.placeId || ''}
              onChange={(e) => handleChange('placeId', e.target.value)}
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              placeholder="ChIJ..."
            />
            <button
              onClick={handleLookupPlaceId}
              disabled={isLookingUp}
              className="px-4 py-3 bg-slate-100 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {isLookingUp ? 'Looking up...' : '🔍 Lookup'}
            </button>
          </div>
        </div>

        {lookupResult && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="font-medium text-green-800">✓ PlaceID Found</p>
            <p className="text-green-700">
              Business: {lookupResult.businessName}
            </p>
            <p className="text-green-700">
              Address: {lookupResult.formattedAddress}
            </p>
            <p className="text-green-600 text-xs mt-1">
              Confidence: {Math.round((lookupResult.confidence || 0) * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* Google Rating */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-dark">Google Rating</h4>
          {draft.placeId && (
            <button
              onClick={handleFetchGoogleData}
              disabled={isFetchingGoogle}
              className="px-4 py-2 text-sm text-primary hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isFetchingGoogle ? 'Fetching...' : '🔄 Refresh from Google'}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Rating (0-5)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={draft.googleRating || ''}
              onChange={(e) => handleChange('googleRating', parseFloat(e.target.value) || null)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="4.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Review Count
            </label>
            <input
              type="number"
              min="0"
              value={draft.googleReviewCount || ''}
              onChange={(e) => handleChange('googleReviewCount', parseInt(e.target.value, 10) || null)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="150"
            />
          </div>
        </div>
      </div>

      {/* Map Preview Link */}
      {draft.latitude && draft.longitude && (
        <div className="border-t border-border pt-6">
          <a
            href={`https://www.google.com/maps?q=${draft.latitude},${draft.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-sm rounded-lg hover:bg-slate-200 transition-colors"
          >
            📍 View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationTab;

