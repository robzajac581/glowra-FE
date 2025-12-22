import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../../config/api';
import { cn } from '../../../utils/cn';

const SearchClinic = ({ onSelectClinic, onAddNew, onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/clinics/search?q=${encodeURIComponent(query)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to search clinics');
        }
        
        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic);
  };

  const handleContinue = () => {
    if (selectedClinic) {
      onSelectClinic(selectedClinic);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-text hover:text-dark mb-6 transition-colors"
      >
        <span className="mr-2">←</span> Back
      </button>

      <h2 className="text-3xl font-bold mb-6">Find Your Clinic</h2>
      
      <p className="text-text mb-6">
        Search by clinic name or address
      </p>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search clinics..."
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary text-lg"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-3 mb-6">
          {results.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => handleSelectClinic(clinic)}
              className={cn(
                'w-full p-4 border-2 rounded-lg text-left transition-all',
                {
                  'border-primary bg-primary bg-opacity-5': selectedClinic?.id === clinic.id,
                  'border-border hover:border-gray-400': selectedClinic?.id !== clinic.id
                }
              )}
            >
              <div className="flex items-start">
                {selectedClinic?.id === clinic.id && (
                  <span className="text-primary mr-2">✓</span>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{clinic.clinicName}</h3>
                  <p className="text-text text-sm mb-1">
                    {clinic.address}, {clinic.city}, {clinic.state}
                  </p>
                  {clinic.category && (
                    <p className="text-text2 text-sm">
                      {clinic.category}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="text-center py-8 text-text">
          No clinics found matching "{query}"
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-border">
        <button
          onClick={onAddNew}
          className="text-primary hover:underline"
        >
          Don't see your clinic? Add it as new
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!selectedClinic}
          className={cn(
            'px-6 py-3 rounded-lg font-medium transition-all',
            {
              'bg-primary text-white hover:bg-opacity-90': selectedClinic,
              'bg-gray-200 text-gray-400 cursor-not-allowed': !selectedClinic
            }
          )}
        >
          Continue with Selected →
        </button>
      </div>
    </div>
  );
};

export default SearchClinic;

