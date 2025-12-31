// useSearchState.js
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage search filters and persist them in URL params
 */
const useSearchState = (defaultValues = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Track if we're currently syncing from URL to prevent circular updates
  const isSyncingFromUrl = useRef(false);
  
  // Track the last URL we synced from to avoid re-syncing the same URL
  const lastSyncedUrl = useRef('');
  
  // Initialize state from URL params or default values
  const [searchState, setSearchState] = useState(() => {
    // Only use default values if there are NO URL params at all
    const hasAnyUrlParams = Array.from(searchParams.keys()).length > 0;
    
    return {
      searchQuery: searchParams.get('searchQuery') || (hasAnyUrlParams ? '' : defaultValues.searchQuery || ''),
      category: searchParams.get('category') || (hasAnyUrlParams ? '' : defaultValues.category || ''),
      minPrice: searchParams.get('minPrice') || (hasAnyUrlParams ? '' : defaultValues.minPrice || ''),
      maxPrice: searchParams.get('maxPrice') || (hasAnyUrlParams ? '' : defaultValues.maxPrice || ''),
      sortBy: searchParams.get('sortBy') || (hasAnyUrlParams ? 'relevance' : defaultValues.sortBy || 'relevance'),
      page: parseInt(searchParams.get('page')) || (hasAnyUrlParams ? 1 : defaultValues.page || 1)
    };
  });
  
  // Sync state when URL params change (for direct URL access or browser back/forward)
  useEffect(() => {
    const currentUrl = searchParams.toString();
    
    // If we just updated the URL from state, skip this sync
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      lastSyncedUrl.current = currentUrl; // Remember we synced this URL
      return;
    }
    
    // If this is the same URL we just synced, skip
    if (lastSyncedUrl.current === currentUrl) {
      return;
    }
    
    const urlState = {
      searchQuery: searchParams.get('searchQuery') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'relevance',
      page: parseInt(searchParams.get('page')) || 1
    };
    
    // Only update state if URL params are different from current state
    const hasChanges = Object.keys(urlState).some(key => {
      return String(urlState[key]) !== String(searchState[key]);
    });
    
    if (hasChanges) {
      lastSyncedUrl.current = currentUrl; // Remember we synced this URL
      setSearchState(urlState);
    }
  }, [searchParams, searchState]); // Add searchState to dependencies so we use current values

  // Update URL when search state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Only add parameters with values to the URL
    Object.entries(searchState).forEach(([key, value]) => {
      // Don't add page=1 to URL unless there are other params
      if (key === 'page' && value === 1) {
        return; // Skip adding page=1
      }
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    
    // Check if the URL params are actually different before updating
    const currentParamsString = searchParams.toString();
    const newParamsString = params.toString();
    
    if (currentParamsString !== newParamsString) {
      isSyncingFromUrl.current = true; // Mark that we're updating URL so the other effect doesn't react
      setSearchParams(params);
    }
  }, [searchState, setSearchParams, searchParams]);
  
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
      sortBy: defaultValues.sortBy || 'relevance',
      page: 1
    });
  };
  
  // Navigate to search page with current filters
  const navigateToSearch = (baseUrl = '/search') => {
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