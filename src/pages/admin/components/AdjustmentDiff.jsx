import React from 'react';

/**
 * Component to display a diff view for adjustment submissions
 * Shows what's being added/modified compared to the existing clinic
 */
const AdjustmentDiff = ({ draft, existingClinic }) => {
  if (!existingClinic) {
    return null;
  }

  // Compare basic fields
  const fieldChanges = [];
  const basicFields = [
    { key: 'clinicName', label: 'Clinic Name', existing: existingClinic.ClinicName },
    { key: 'address', label: 'Address', existing: existingClinic.Address },
    { key: 'phone', label: 'Phone', existing: existingClinic.Phone },
    { key: 'website', label: 'Website', existing: existingClinic.Website },
    { key: 'email', label: 'Email', existing: existingClinic.Email },
    { key: 'category', label: 'Category', existing: existingClinic.Category },
  ];

  basicFields.forEach(field => {
    const draftValue = draft[field.key];
    const existingValue = field.existing;
    
    if (draftValue && draftValue !== existingValue) {
      fieldChanges.push({
        field: field.label,
        old: existingValue || '(empty)',
        new: draftValue,
        type: existingValue ? 'changed' : 'added',
      });
    }
  });

  // Find new providers
  const existingProviderNames = (existingClinic.providers || []).map(p => 
    p.ProviderName?.toLowerCase()
  );
  const newProviders = (draft.providers || []).filter(p => 
    !existingProviderNames.includes(p.providerName?.toLowerCase())
  );

  // Find new procedures
  const existingProcedureNames = (existingClinic.procedures || []).map(p => 
    p.ProcedureName?.toLowerCase()
  );
  const newProcedures = (draft.procedures || []).filter(p => 
    !existingProcedureNames.includes(p.procedureName?.toLowerCase())
  );

  // Find new photos
  const newPhotos = (draft.photos || []).filter(p => p.source === 'user');

  const hasChanges = fieldChanges.length > 0 || newProviders.length > 0 || 
                     newProcedures.length > 0 || newPhotos.length > 0;

  if (!hasChanges) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          ⚠️ No changes detected in this adjustment submission.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden mb-6">
      <div className="bg-purple-50 border-b border-purple-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="font-semibold text-purple-900">Adjustment Request</h3>
        </div>
        <p className="text-sm text-purple-700 mt-1">
          Updating existing clinic #{existingClinic.ClinicID || existingClinic.id}
        </p>
        <a
          href={`/clinic/${existingClinic.ClinicID || existingClinic.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline mt-1 inline-block"
        >
          View Current Listing →
        </a>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-dark mb-3">Proposed Changes</h4>

        {/* Field Changes */}
        {fieldChanges.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-text mb-2">Modified Fields:</p>
            <div className="space-y-2">
              {fieldChanges.map((change, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    change.type === 'changed' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {change.type === 'changed' ? 'CHANGED' : 'ADDED'}
                  </span>
                  <span className="text-dark">{change.field}:</span>
                  {change.type === 'changed' && (
                    <>
                      <span className="text-red-600 line-through">{change.old}</span>
                      <span className="text-text">→</span>
                    </>
                  )}
                  <span className="text-green-700">{change.new}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Providers */}
        {newProviders.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-text mb-2">
              New Providers to Add ({newProviders.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {newProviders.map((provider, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-sm border border-green-200"
                >
                  <span className="text-xs">👨‍⚕️</span>
                  {provider.providerName}
                  {provider.specialty && (
                    <span className="text-green-600 text-xs">
                      - {provider.specialty}
                    </span>
                  )}
                  <span className="ml-1 px-1.5 py-0.5 bg-green-200 text-green-900 rounded text-xs font-medium">
                    NEW
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* New Procedures */}
        {newProcedures.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-text mb-2">
              New Procedures to Add ({newProcedures.length}):
            </p>
            <div className="space-y-2">
              {newProcedures.map((proc, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">💉</span>
                    <span className="text-sm font-medium text-dark">
                      {proc.procedureName}
                    </span>
                    <span className="text-xs text-text">
                      ({proc.category})
                    </span>
                    <span className="px-1.5 py-0.5 bg-green-200 text-green-900 rounded text-xs font-medium">
                      NEW
                    </span>
                  </div>
                  {(proc.priceMin || proc.priceMax) && (
                    <span className="text-sm text-primary font-medium">
                      ${proc.priceMin || 0}
                      {proc.priceMax && `-$${proc.priceMax}`}
                      {proc.priceUnit || ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Photos */}
        {newPhotos.length > 0 && (
          <div>
            <p className="text-sm font-medium text-text mb-2">
              New Photos to Add ({newPhotos.length}):
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {newPhotos.map((photo, idx) => (
                <div 
                  key={idx}
                  className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-green-300"
                >
                  <img
                    src={photo.photoUrl || photo.photoData}
                    alt={`New ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-green-500 text-white rounded text-xs font-medium">
                    NEW
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdjustmentDiff;

