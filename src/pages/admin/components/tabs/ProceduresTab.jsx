import React from 'react';
import { PROCEDURE_CATEGORIES, PRICE_UNITS } from '../../../list-your-clinic/constants';

const ProceduresTab = ({ draft, onUpdate }) => {
  const procedures = draft.procedures || [];
  const providers = draft.providers || [];

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
    onUpdate({
      procedures: [
        ...procedures,
        {
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
    </div>
  );
};

export default ProceduresTab;

