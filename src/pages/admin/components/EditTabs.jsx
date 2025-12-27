import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config/api';
import { getAuthHeaders } from '../hooks/useAuth';
import BasicInfoTab from './tabs/BasicInfoTab';
import LocationTab from './tabs/LocationTab';
import ProvidersTab from './tabs/ProvidersTab';
import ProceduresTab from './tabs/ProceduresTab';
import PhotosTab from './tabs/PhotosTab';
import DataSourcesTab from './tabs/DataSourcesTab';

const tabs = [
  { id: 'basic', label: 'Basic Info', icon: '🏥' },
  { id: 'location', label: 'Location & Google', icon: '📍' },
  { id: 'providers', label: 'Providers', icon: '👨‍⚕️' },
  { id: 'procedures', label: 'Procedures', icon: '💉' },
  { id: 'photos', label: 'Photos', icon: '📷' },
  { id: 'datasources', label: 'Data Sources', icon: '⚙️' },
];

const EditTabs = ({
  draft,
  onDraftUpdate,
  onSave,
  onCancel,
  // Optional props for clinic edit mode
  saveDisabled = false,
  saveLabel,
  saving = false,
  clinicId, // For fetching Google photos when no draftId
  // Data sources props
  photoSource,
  setPhotoSource,
  ratingSource,
  setRatingSource,
  manualRating,
  setManualRating,
  manualReviewCount,
  setManualReviewCount,
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [localDraft, setLocalDraft] = useState(draft);

  // Check if we're in clinic edit mode (no draftId)
  const isClinicEditMode = !draft.draftId;

  // Sync localDraft with draft prop when it changes
  useEffect(() => {
    setLocalDraft(draft);
  }, [draft]);

  // Update local draft state and notify parent
  const handleLocalUpdate = (updates) => {
    const newDraft = {
      ...localDraft,
      ...updates,
    };
    setLocalDraft(newDraft);
    // Notify parent of changes for change tracking
    if (onDraftUpdate) {
      onDraftUpdate(newDraft);
    }
  };

  // Save draft to server
  const handleSave = async () => {
    // For clinic edit mode, just call onSave which handles the submission
    if (isClinicEditMode) {
      onSave();
      return;
    }

    // For draft mode, save to server
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/drafts/${draft.draftId}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localDraft),
        }
      );

      const data = await response.json();

      if (data.success) {
        onDraftUpdate(data.draft || localDraft);
        onSave();
      } else {
        setError(data.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine button state
  const isButtonDisabled = saveDisabled || isSaving || saving;
  const buttonLabel = saving ? 'Saving...' : (isSaving ? 'Saving...' : (saveLabel || 'Save & Return to Preview'));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            draft={localDraft}
            onUpdate={handleLocalUpdate}
          />
        );
      case 'location':
        return (
          <LocationTab
            draft={localDraft}
            onUpdate={handleLocalUpdate}
          />
        );
      case 'providers':
        return (
          <ProvidersTab
            draft={localDraft}
            onUpdate={handleLocalUpdate}
          />
        );
      case 'procedures':
        return (
          <ProceduresTab
            draft={localDraft}
            onUpdate={handleLocalUpdate}
          />
        );
      case 'photos':
        return (
          <PhotosTab
            draft={localDraft}
            onUpdate={handleLocalUpdate}
            clinicId={clinicId}
          />
        );
      case 'datasources':
        return (
          <DataSourcesTab
            draft={localDraft}
            photoSource={photoSource}
            setPhotoSource={setPhotoSource}
            ratingSource={ratingSource}
            setRatingSource={setRatingSource}
            manualRating={manualRating}
            setManualRating={setManualRating}
            manualReviewCount={manualReviewCount}
            setManualReviewCount={setManualReviewCount}
            onDraftUpdate={(updatedDraft) => {
              setLocalDraft(updatedDraft);
              onDraftUpdate(updatedDraft);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="edit-tabs border-b border-border p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`edit-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="mr-2">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {renderTabContent()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-border">
        <button
          onClick={onCancel}
          disabled={isSaving || saving}
          className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isButtonDisabled}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            saveDisabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-opacity-90'
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default EditTabs;

