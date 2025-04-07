// useSearchState.js
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage search filters and persist them in URL params
 */
const useSearchState = (defaultValues = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state from URL params or default values
  const [searchState, setSearchState] = useState({
    searchQuery: searchParams.get('q') || defaultValues.searchQuery || '',
    category: searchParams.get('category') || defaultValues.category || '',
    minPrice: searchParams.get('minPrice') || defaultValues.minPrice || '',
    maxPrice: searchParams.get('maxPrice') || defaultValues.maxPrice || '',
    specialty: searchParams.get('specialty') || defaultValues.specialty || '',
    page: parseInt(searchParams.get('page')) || defaultValues.page || 1
  });
  
  // Update URL when search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Only add parameters with values to the URL
    Object.entries(searchState).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    
    // Update the URL with new search params
    setSearchParams(params);
  }, [searchState, setSearchParams]);
  
  // Update individual search state fields
  const updateSearchState = (field, value) => {
    setSearchState(prev => ({
      ...prev,
      [field]: value,
      // Reset to page 1 when changing filters
      ...(field !== 'page' ? { page: 1 } : {})
    }));
  };
  
  // Reset all search filters
  const resetSearch = () => {
    setSearchState({
      searchQuery: '',
      category: defaultValues.category || '',
      minPrice: defaultValues.minPrice || '',
      maxPrice: defaultValues.maxPrice || '',
      specialty: defaultValues.specialty || '',
      page: 1
    });
  };
  
  // Navigate to search page with current filters
  const navigateToSearch = (baseUrl = '/procedures') => {
    const params = new URLSearchParams();
    
    Object.entries(searchState).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    
    navigate(`${baseUrl}?${params.toString()}`);
  };
  
  return {
    searchState,
    updateSearchState,
    resetSearch,
    navigateToSearch
  };

};

export default useSearchState;