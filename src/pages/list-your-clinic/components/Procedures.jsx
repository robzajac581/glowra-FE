import React, { useState } from 'react';
import { PROCEDURE_CATEGORIES, PRICE_UNITS } from '../constants';
import { cn } from '../../../utils/cn';

const Procedures = ({ initialProcedures, providers, onContinue, onSkip, onBack }) => {
  const [procedures, setProcedures] = useState(
    initialProcedures && initialProcedures.length > 0
      ? initialProcedures
      : [{
          procedureName: '',
          category: '',
          priceMin: '',
          priceMax: '',
          unit: '',
          averagePrice: '',
          providerNames: []
        }]
  );

  const addProcedure = () => {
    setProcedures([...procedures, {
      procedureName: '',
      category: '',
      priceMin: '',
      priceMax: '',
      unit: '',
      averagePrice: '',
      providerNames: []
    }]);
  };

  const removeProcedure = (index) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((_, i) => i !== index));
    }
  };

  const updateProcedure = (index, field, value) => {
    const updated = [...procedures];
    updated[index][field] = value;
    
    // Auto-calculate average if priceMin and priceMax are set but averagePrice isn't
    if ((field === 'priceMin' || field === 'priceMax') && !updated[index].averagePrice) {
      const min = parseFloat(updated[index].priceMin) || 0;
      const max = parseFloat(updated[index].priceMax) || 0;
      if (min > 0 && max > 0) {
        updated[index].averagePrice = ((min + max) / 2).toString();
      }
    }
    
    setProcedures(updated);
  };

  const toggleProvider = (procedureIndex, providerName) => {
    const updated = [...procedures];
    const providerNames = updated[procedureIndex].providerNames || [];
    
    if (providerNames.includes(providerName)) {
      updated[procedureIndex].providerNames = providerNames.filter(p => p !== providerName);
    } else {
      updated[procedureIndex].providerNames = [...providerNames, providerName];
    }
    
    setProcedures(updated);
  };

  const handleContinue = () => {
    // Filter out empty procedures and format data
    const filledProcedures = procedures
      .filter(p => p.procedureName.trim() && p.category)
      .map(p => ({
        ...p,
        priceMin: p.priceMin ? parseFloat(p.priceMin) : null,
        priceMax: p.priceMax ? parseFloat(p.priceMax) : null,
        averagePrice: p.averagePrice ? parseFloat(p.averagePrice) : null,
      }));
    onContinue(filledProcedures);
  };

  const handleSkip = () => {
    onSkip([]);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-text hover:text-dark mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Back
      </button>

      <h2 className="text-3xl font-bold mb-6">Procedures Offered</h2>
      
      <p className="text-text mb-6">
        Add procedures and their pricing. You can skip this step.
      </p>

      <div className="space-y-6 mb-6">
        {procedures.map((procedure, index) => (
          <div
            key={index}
            className="p-6 border border-border rounded-lg"
          >
            {/* Procedure Name & Category */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Procedure Name {index === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={procedure.procedureName}
                  onChange={(e) => updateProcedure(index, 'procedureName', e.target.value)}
                  placeholder="Botox"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category {index === 0 && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={procedure.category}
                  onChange={(e) => updateProcedure(index, 'category', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
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

            {/* Price Range & Unit */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Min
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={procedure.priceMin}
                  onChange={(e) => updateProcedure(index, 'priceMin', e.target.value)}
                  placeholder="12"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Max
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={procedure.priceMax}
                  onChange={(e) => updateProcedure(index, 'priceMax', e.target.value)}
                  placeholder="15"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Unit
                </label>
                <select
                  value={procedure.unit}
                  onChange={(e) => updateProcedure(index, 'unit', e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  {PRICE_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Average Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Average Price (optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={procedure.averagePrice}
                onChange={(e) => updateProcedure(index, 'averagePrice', e.target.value)}
                placeholder="13.50"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text mt-1">
                If not provided, we'll calculate from price range
              </p>
            </div>

            {/* Provider Selection */}
            {providers && providers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Provider(s)
                </label>
                <div className="space-y-2">
                  {providers.map((provider, providerIndex) => (
                    provider.providerName && (
                      <label
                        key={providerIndex}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={procedure.providerNames?.includes(provider.providerName)}
                          onChange={() => toggleProvider(index, provider.providerName)}
                          className="mr-2"
                        />
                        <span className="text-sm">{provider.providerName}</span>
                      </label>
                    )
                  ))}
                </div>
              </div>
            )}

            {procedures.length > 1 && (
              <button
                onClick={() => removeProcedure(index)}
                className="text-red-500 hover:text-red-700 text-sm transition-colors"
              >
                ✕ Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addProcedure}
        className="w-full py-3 border-2 border-dashed border-border rounded-lg text-primary hover:border-primary transition-all mb-6"
      >
        + Add Another Procedure
      </button>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button
          onClick={handleSkip}
          className="text-text hover:text-dark transition-colors"
        >
          Skip this step
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Procedures;

