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

  // Sync localDraft with draft prop when it changes
  useEffect(() => {
    setLocalDraft(draft);
  }, [draft]);

  // Update local draft state
  const handleLocalUpdate = (updates) => {
    setLocalDraft((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Save draft to server
  const handleSave = async () => {
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
          disabled={isSaving}
          className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save & Return to Preview'}
        </button>
      </div>
    </div>
  );
};

export default EditTabs;

