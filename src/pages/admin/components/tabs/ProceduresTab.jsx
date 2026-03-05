import React, { useState, useMemo } from 'react';
import { PROCEDURE_CATEGORIES, PRICE_UNITS } from '../../../list-your-clinic/constants';
import { cn } from '../../../../utils/cn';
import { parseBulkInput } from '../../../../utils/bulkEntryUtils';

const ProceduresTab = ({ draft, onUpdate }) => {
  const procedures = draft.procedures || [];
  const providers = draft.providers || [];
  const [entryMode, setEntryMode] = useState('individual');
  const [bulkInput, setBulkInput] = useState('');

  const parsedProcedures = useMemo(() => {
    if (!bulkInput.trim()) return [];
    return parseBulkInput(bulkInput);
  }, [bulkInput]);

  const handleBulkAdd = () => {
    if (parsedProcedures.length === 0) return;
    const newProcedures = parsedProcedures.map((name, idx) => ({
      draftProcedureId: `new-procedure-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      procedureName: name,
      category: '',
      priceMin: null,
      priceMax: null,
      priceUnit: '',
      averagePrice: null,
      providerNames: [],
    }));
    const existingNames = new Set(procedures.map((p) => (p.procedureName || '').toLowerCase()));
    const uniqueNewProcedures = newProcedures.filter(
      (p) => !existingNames.has(p.procedureName.toLowerCase())
    );
    onUpdate({ procedures: [...procedures, ...uniqueNewProcedures] });
    setBulkInput('');
    setEntryMode('individual');
  };

  const handleBulkReplace = () => {
    if (parsedProcedures.length === 0) return;
    const newProcedures = parsedProcedures.map((name, idx) => ({
      draftProcedureId: `new-procedure-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      procedureName: name,
      category: '',
      priceMin: null,
      priceMax: null,
      priceUnit: '',
      averagePrice: null,
      providerNames: [],
    }));
    onUpdate({ procedures: newProcedures });
    setBulkInput('');
    setEntryMode('individual');
  };

  const handleProcedureChange = (index, field, value) => {
    const updatedProcedures = [...procedures];
    updatedProcedures[index] = {
      ...updatedProcedures[index],
      [field]: value,
    };
    onUpdate({ procedures: updatedProcedures });
  };

  const handleProviderAssignment = (index, providerName, isAssigned) => {
    const updatedProcedures = [...procedures];
    const currentProviders = updatedProcedures[index].providerNames || [];
    
    if (isAssigned) {
      updatedProcedures[index].providerNames = [...currentProviders, providerName];
    } else {
      updatedProcedures[index].providerNames = currentProviders.filter(p => p !== providerName);
    }
    
    onUpdate({ procedures: updatedProcedures });
  };

  const handleAddProcedure = () => {
    // Generate a temporary ID for new procedures
    // This helps the backend distinguish between new procedures (temp IDs) and existing ones (numeric IDs)
    const tempId = `new-procedure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    onUpdate({
      procedures: [
        ...procedures,
        {
          draftProcedureId: tempId,
          procedureName: '',
          category: '',
          priceMin: null,
          priceMax: null,
          priceUnit: '',
          averagePrice: null,
          providerNames: [],
        },
      ],
    });
  };

  const handleRemoveProcedure = (index) => {
    const updatedProcedures = procedures.filter((_, i) => i !== index);
    onUpdate({ procedures: updatedProcedures });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark">
          Procedures ({procedures.length})
        </h3>
        <button
          onClick={handleAddProcedure}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors"
        >
          + Add Procedure
        </button>
      </div>

      {/* Entry Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text">Entry Mode:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryMode('individual')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                entryMode === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text border border-border hover:bg-gray-50'
              )}
            >
              Individual Entry
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('bulk')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                entryMode === 'bulk'
                  ? 'bg-primary text-white'
                  : 'bg-white text-text border border-border hover:bg-gray-50'
              )}
            >
              Bulk Entry
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Entry Mode */}
      {entryMode === 'bulk' && (
        <div className="p-4 border border-border rounded-lg bg-blue-50">
          <label className="block text-sm font-medium text-dark mb-2">
            Paste Procedure Names (semicolon-separated)
          </label>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Botox; Dermal Fillers; Chemical Peel; Laser Hair Removal; Microneedling"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary mb-4 font-mono text-sm"
            rows={6}
          />
          {parsedProcedures.length > 0 && (
            <div className="mb-4 p-3 bg-white border border-border rounded-lg">
              <p className="text-sm font-medium text-dark mb-2">
                Preview: {parsedProcedures.length} procedure{parsedProcedures.length !== 1 ? 's' : ''} will be added
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Note: You&apos;ll need to fill in category and pricing for each procedure after adding them.
              </p>
              <div className="max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm text-text space-y-1">
                  {parsedProcedures.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBulkAdd}
              disabled={parsedProcedures.length === 0}
              className={cn(
                'px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium text-sm',
                parsedProcedures.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              Add to List ({parsedProcedures.length})
            </button>
            <button
              type="button"
              onClick={handleBulkReplace}
              disabled={parsedProcedures.length === 0}
              className={cn(
                'px-4 py-2 bg-white border border-border text-text rounded-lg hover:bg-gray-50 transition-all font-medium text-sm',
                parsedProcedures.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              Replace All ({parsedProcedures.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkInput('');
                setEntryMode('individual');
              }}
              className="px-4 py-2 bg-white border border-border text-text rounded-lg hover:bg-gray-50 transition-all font-medium text-sm ml-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Individual Entry Mode */}
      {entryMode === 'individual' && (
        <>
      {procedures.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <div className="text-3xl mb-2">💉</div>
          <p className="text-text mb-4">No procedures added yet</p>
          <button
            onClick={handleAddProcedure}
            className="px-4 py-2 text-primary hover:underline text-sm"
          >
            Add your first procedure
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {procedures.map((procedure, index) => (
            <div
              key={procedure.draftProcedureId || index}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-text">
                  Procedure #{index + 1}
                </span>
                <button
                  onClick={() => handleRemoveProcedure(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove procedure"
                >
                  🗑️
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Procedure Name *
                  </label>
                  <input
                    type="text"
                    value={procedure.procedureName || ''}
                    onChange={(e) => handleProcedureChange(index, 'procedureName', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Botox"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Category *
                  </label>
                  <select
                    value={procedure.category || ''}
                    onChange={(e) => handleProcedureChange(index, 'category', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    <option value="">Select Category</option>
                    {PROCEDURE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={procedure.priceMin || ''}
                    onChange={(e) => handleProcedureChange(index, 'priceMin', parseFloat(e.target.value) || null)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="$0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={procedure.priceMax || ''}
                    onChange={(e) => handleProcedureChange(index, 'priceMax', parseFloat(e.target.value) || null)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="$0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Unit
                  </label>
                  <select
                    value={procedure.priceUnit || ''}
                    onChange={(e) => handleProcedureChange(index, 'priceUnit', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  >
                    {PRICE_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Avg Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={procedure.averagePrice || ''}
                    onChange={(e) => handleProcedureChange(index, 'averagePrice', parseFloat(e.target.value) || null)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Auto"
                  />
                </div>
              </div>

              {/* Provider Assignment */}
              {providers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Assigned Providers
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {providers.map((provider) => {
                      const isAssigned = (procedure.providerNames || []).includes(provider.providerName);
                      return (
                        <label
                          key={provider.providerName}
                          className={`inline-flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isAssigned
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-dark hover:bg-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => handleProviderAssignment(index, provider.providerName, e.target.checked)}
                            className="sr-only"
                          />
                          <span className="text-sm">{provider.providerName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ProceduresTab;

