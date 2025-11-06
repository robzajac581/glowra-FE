// searchUtils.js
import lunr from 'lunr';

/**
 * Popular procedures dictionary - ranked by popularity within each category
 * Used when showing procedures for location-based searches
 */
const POPULAR_PROCEDURES = {
  'Breast': ['Breast Augmentation', 'Breast Lift', 'Breast Reduction'],
  'Face': ['Facelift', 'Rhinoplasty', 'Blepharoplasty'],
  'Body': ['Liposuction', 'Tummy Tuck', 'Brazilian Butt Lift'],
  'Injectibles': ['Botox', 'Dermal Fillers', 'Lip Fillers'],
  'Skin': ['Laser Treatment', 'Chemical Peel', 'Microneedling'],
  'Other': []
};

/**
 * Deduplicate procedures by name (keep first occurrence)
 * @param {Array} procedures - Array of procedure objects
 * @returns {Array} Deduplicated procedures
 */
const deduplicateProcedures = (procedures) => {
  const seen = new Set();
  return procedures.filter(proc => {
    // Create a unique key based on procedure name and category
    const key = `${proc.procedureName}_${proc.category}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Get popular procedures from a clinic's procedure list
 * @param {Array} procedures - Array of procedure objects
 * @returns {Array} Up to 5 popular procedures
 */
export const getPopularProcedures = (procedures) => {
  // First deduplicate all procedures
  const uniqueProcedures = deduplicateProcedures(procedures);
  
  const selected = [];
  const perCategory = {};

  // Select up to 2 per category, prioritize by ranking
  for (const [category, rankedNames] of Object.entries(POPULAR_PROCEDURES)) {
    perCategory[category] = 0;
    
    for (const name of rankedNames) {
      if (selected.length >= 5) break;
      if (perCategory[category] >= 2) break;
      
      const proc = uniqueProcedures.find(p => 
        p.category === category && p.procedureName === name
      );
      
      if (proc) {
        selected.push(proc);
        perCategory[category]++;
      }
    }
  }

  // Fill remaining slots with any procedures not yet selected
  if (selected.length < 5) {
    const selectedNames = new Set(selected.map(p => `${p.procedureName}_${p.category}`.toLowerCase()));
    for (const proc of uniqueProcedures) {
      if (selected.length >= 5) break;
      const key = `${proc.procedureName}_${proc.category}`.toLowerCase();
      if (!selectedNames.has(key)) {
        selected.push(proc);
      }
    }
  }

  return selected;
};

/**
 * Get procedures to display on a clinic card based on search context
 * @param {Object} clinic - Clinic object with procedures array
 * @param {String} searchQuery - Current search query
 * @returns {Array} Up to 5 procedures to display
 */
export const getDisplayProcedures = (clinic, searchQuery) => {
  if (!clinic.procedures || clinic.procedures.length === 0) {
    return [];
  }

  // First deduplicate all procedures from the clinic
  const uniqueProcedures = deduplicateProcedures(clinic.procedures);

  const query = (searchQuery || '').toLowerCase().trim();
  
  // If no search query, return popular procedures
  if (!query) {
    return getPopularProcedures(uniqueProcedures);
  }

  const matchedProcedures = [];
  const categoryMatches = new Set();

  // Find directly matching procedures
  uniqueProcedures.forEach(proc => {
    if (proc.procedureName.toLowerCase().includes(query)) {
      matchedProcedures.push(proc);
      categoryMatches.add(proc.category);
    }
  });

  // If we found matches, add other procedures from same categories
  if (matchedProcedures.length > 0) {
    const matchedKeys = new Set(matchedProcedures.map(m => `${m.procedureName}_${m.category}`.toLowerCase()));
    const relatedProcedures = uniqueProcedures.filter(proc => {
      const key = `${proc.procedureName}_${proc.category}`.toLowerCase();
      return categoryMatches.has(proc.category) && !matchedKeys.has(key);
    });

    // Combine matched + related, limit to 5 total
    return [...matchedProcedures, ...relatedProcedures].slice(0, 5);
  }

  // If no direct matches (location search), return popular procedures
  return getPopularProcedures(uniqueProcedures);
};

/**
 * Creates an enhanced Lunr search index for clinic-based search
 * @param {Array} clinics - Array of clinic objects to index
 * @param {Object} options - Indexing options with field configurations
 * @returns {Object} Lunr search index and transformed data
 */
export const createSearchIndex = (clinics, options = {}) => {
  // Transform clinics for indexing
  const indexData = clinics.map((clinic, index) => {
    // Concatenate all procedure names for searchability
    const procedureNames = clinic.procedures.map(p => p.procedureName).join(' ');
    const procedureCategories = [...new Set(clinic.procedures.map(p => p.category))].join(' ');
    
    return {
      id: index.toString(),
      clinicName: clinic.clinicName || '',
      city: clinic.city || '',
      state: clinic.state || '',
      address: clinic.address || '',
      clinicCategory: clinic.clinicCategory || '',
      zipCode: clinic.zipCode || '',
      procedureNames: procedureNames,
      procedureCategories: procedureCategories,
      // Store original index for retrieval
      _originalIndex: index
    };
  });

  // Default field configurations for clinic-based search
  const fields = options.fields || {
    zipCode: { boost: 9 },
    state: { boost: 9 },
    city: { boost: 9 },
    clinicName: { boost: 10 },
    procedureNames: { boost: 7 },
    procedureCategories: { boost: 7 },
    clinicCategory: { boost: 5 },
    address: { boost: 3 }
  };

  // Create the Lunr index with enhanced configuration
  const idx = lunr(function() {
    this.ref('id');
    
    // Configure the pipeline for better fuzzy matching
    this.pipeline.remove(lunr.stemmer);
    this.searchPipeline.remove(lunr.stemmer);
    
    // Add the fields to the index
    Object.entries(fields).forEach(([fieldName, config]) => {
      this.field(fieldName, config);
    });
    
    // Add documents to the index
    indexData.forEach(doc => this.add(doc));
  });

  return { idx, indexData };
};

/**
 * Check if a query string is a zip code (5 digits)
 * @param {String} query - Search query
 * @returns {Boolean} True if query is a zip code
 */
const isZipCode = (query) => {
  const trimmed = query.trim();
  // Check if it's exactly 5 digits
  return /^\d{5}$/.test(trimmed);
};

/**
 * Get nearby zip codes (zip codes starting with same first 3 digits)
 * @param {String} zipCode - 5-digit zip code
 * @returns {String} First 3 digits of zip code
 */
const getZipCodePrefix = (zipCode) => {
  if (!zipCode || zipCode.length < 3) return null;
  return zipCode.substring(0, 3);
};

/**
 * Performs a search with fallback to simple filtering for complex queries
 * @param {Object} searchIndex - Lunr search index
 * @param {Array} clinics - Original clinics array
 * @param {String} query - Search query
 * @returns {Array} Matched clinics
 */
export const performSearch = (searchIndex, clinics, query) => {
  if (!query || !query.trim()) {
    return clinics;
  }

  const trimmedQuery = query.trim();

  // Check if query is a zip code - if so, filter by zip code only
  if (isZipCode(trimmedQuery)) {
    const zipPrefix = getZipCodePrefix(trimmedQuery);
    
    // Filter clinics by zip code (exact match or nearby - same first 3 digits)
    return clinics.filter(clinic => {
      if (!clinic.zipCode) return false;
      
      // Exact match
      if (clinic.zipCode === trimmedQuery) {
        return true;
      }
      
      // Nearby zip codes (same first 3 digits)
      if (zipPrefix && clinic.zipCode.length >= 3) {
        const clinicZipPrefix = getZipCodePrefix(clinic.zipCode);
        return clinicZipPrefix === zipPrefix;
      }
      
      return false;
    });
  }

  try {
    // Strategy 1: Try exact search first
    let searchResults = searchIndex.search(query);
    
    // Strategy 2: If no results, try with fuzzy matching
    if (searchResults.length === 0) {
      // Add fuzzy matching operator to each term
      const fuzzyQuery = query
        .trim()
        .split(/\s+/)
        .map(term => `${term}~1`) // ~1 specifies edit distance of 1 (more fuzzy with ~2)
        .join(' ');
      
      searchResults = searchIndex.search(fuzzyQuery);
    }
    
    // Strategy 3: If still no results, try with wildcard matching
    if (searchResults.length === 0) {
      // Add wildcard operator to each term
      const wildcardQuery = query
        .trim()
        .split(/\s+/)
        .map(term => `${term}*`) // * is wildcard for prefix matching
        .join(' ');
      
      searchResults = searchIndex.search(wildcardQuery);
    }

    // Strategy 4: If still no results, try removing extra characters (like "breasts" -> "breast")
    if (searchResults.length === 0) {
      // Try progressively shortening each term by 1-3 characters from the end
      const terms = query.trim().split(/\s+/);
      
      for (const term of terms) {
        if (term.length < 5) continue; // Only process longer terms that might have suffixes
        
        // Try removing 1, 2, or 3 characters from the end
        for (let i = 1; i <= Math.min(3, term.length - 2); i++) {
          const shortenedTerm = term.substring(0, term.length - i);
          if (shortenedTerm.length < 3) continue; // Keep terms reasonably long
          
          const shortenedResults = searchIndex.search(shortenedTerm);
          if (shortenedResults.length > 0) {
            searchResults = [...searchResults, ...shortenedResults];
          }
        }
      }
      
      // Remove duplicates if we found results
      if (searchResults.length > 0) {
        const uniqueRefs = new Set();
        searchResults = searchResults.filter(result => {
          if (uniqueRefs.has(result.ref)) return false;
          uniqueRefs.add(result.ref);
          return true;
        });
      }
    }
    
    // Strategy 5: If still no results, try individual terms with fuzzy matching
    if (searchResults.length === 0 && query.includes(' ')) {
      const terms = query.trim().split(/\s+/);
      
      // Search for each term individually with fuzzy matching
      for (const term of terms) {
        if (term.length < 2) continue; // Skip very short terms
        
        const termResults = searchIndex.search(`${term}~1`);
        searchResults = [...searchResults, ...termResults];
      }
      
      // Remove duplicates
      const uniqueRefs = new Set();
      searchResults = searchResults.filter(result => {
        if (uniqueRefs.has(result.ref)) return false;
        uniqueRefs.add(result.ref);
        return true;
      });
    }
    
    // If we have results from any strategy, map them back to the original clinics
    if (searchResults.length > 0) {
      return searchResults.map(result => clinics[parseInt(result.ref)]);
    }
    
    // Final fallback: simple contains search on clinic data
    return clinics.filter(clinic => {
      const searchLower = query.toLowerCase();
      const procedureNames = clinic.procedures.map(p => p.procedureName.toLowerCase()).join(' ');
      const categories = clinic.procedures.map(p => p.category.toLowerCase()).join(' ');
      
      return (
        (clinic.clinicName && clinic.clinicName.toLowerCase().includes(searchLower)) ||
        (clinic.city && clinic.city.toLowerCase().includes(searchLower)) ||
        (clinic.state && clinic.state.toLowerCase().includes(searchLower)) ||
        (clinic.address && clinic.address.toLowerCase().includes(searchLower)) ||
        (clinic.clinicCategory && clinic.clinicCategory.toLowerCase().includes(searchLower)) ||
        procedureNames.includes(searchLower) ||
        categories.includes(searchLower)
      );
    });
  } catch (error) {
    console.error('Search error:', error);
    
    // Fall back to simple text matching if Lunr search fails
    return clinics.filter(clinic => {
      const searchLower = query.toLowerCase();
      const procedureNames = clinic.procedures.map(p => p.procedureName.toLowerCase()).join(' ');
      
      return (
        (clinic.clinicName && clinic.clinicName.toLowerCase().includes(searchLower)) ||
        (clinic.city && clinic.city.toLowerCase().includes(searchLower)) ||
        (clinic.state && clinic.state.toLowerCase().includes(searchLower)) ||
        procedureNames.includes(searchLower)
      );
    });
  }
};

/**
 * Applies filters to a set of clinics based on clinic category and procedure prices
 * @param {Array} clinics - Array of clinics to filter
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered clinics with procedures filtered to match criteria
 */
export const applyFilters = (clinics, filters) => {
  if (!clinics || clinics.length === 0) {
    return [];
  }

  return clinics
    .filter(clinic => {
      // Category filter - filter by clinic category, not procedure category
      if (filters.category) {
        if (!clinic.clinicCategory) {
          return false;
        }
        return clinic.clinicCategory.toLowerCase() === filters.category.toLowerCase();
      }
      return true;
    })
    .map(clinic => {
      // Filter the procedures within the clinic for price ranges only
      let filteredProcedures = [...clinic.procedures];

      // Price range filters - only keep procedures in price range
      if (filters.minPrice) {
        filteredProcedures = filteredProcedures.filter(proc => 
          proc.price >= parseFloat(filters.minPrice)
        );
      }

      if (filters.maxPrice) {
        filteredProcedures = filteredProcedures.filter(proc => 
          proc.price <= parseFloat(filters.maxPrice)
        );
      }

      // Return clinic with filtered procedures
      return {
        ...clinic,
        procedures: filteredProcedures
      };
    })
    // Only keep clinics that have procedures after filtering
    .filter(clinic => clinic.procedures.length > 0);
};

/**
 * Handles pagination of results
 * @param {Array} results - Array of filtered results
 * @param {Number} page - Current page number (1-based)
 * @param {Number} limit - Number of items per page
 * @returns {Object} Pagination information and paginated results
 */
export const paginateResults = (results, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    total: results.length,
    totalPages: Math.ceil(results.length / limit),
    currentPage: page,
    results: results.slice(startIndex, endIndex)
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of first point
 * @param {Number} lon1 - Longitude of first point
 * @param {Number} lat2 - Latitude of second point
 * @param {Number} lon2 - Longitude of second point
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate relevance score for a clinic based on search context
 * @param {Object} clinic - Clinic object
 * @param {String} searchQuery - Search query string
 * @param {Object} searchResult - Lunr search result (contains score)
 * @param {Object} userLocation - User's location { lat, lng }
 * @returns {Number} Relevance score (higher is more relevant)
 */
export const calculateRelevanceScore = (clinic, searchQuery, searchResult = null, userLocation = null) => {
  let score = 0;
  const query = (searchQuery || '').toLowerCase().trim();
  
  // 1. Search Match Score (0-100 points, weight: 10x)
  let searchMatchScore = 0;
  
  if (query && searchResult) {
    // Base score from Lunr (0-10, normalize to 0-10)
    searchMatchScore = Math.min(searchResult.score || 0, 10);
    
    // Exact match bonuses
    const clinicName = (clinic.clinicName || '').toLowerCase();
    const city = (clinic.city || '').toLowerCase();
    const state = (clinic.state || '').toLowerCase();
    
    if (clinicName === query) searchMatchScore += 5; // Exact clinic name match
    else if (clinicName.includes(query)) searchMatchScore += 2; // Partial clinic name match
    
    if (city === query || state === query) searchMatchScore += 3; // Exact location match
    else if (city.includes(query) || state.includes(query)) searchMatchScore += 1; // Partial location match
  } else if (!query) {
    // No search query - base score for all
    searchMatchScore = 5;
  }
  
  score += searchMatchScore * 10; // 0-100 points
  
  // 2. Procedure Match Score (0-50 points, weight: 5x)
  let procedureMatchScore = 0;
  
  if (query && clinic.procedures && clinic.procedures.length > 0) {
    let exactMatches = 0;
    let partialMatches = 0;
    let categoryMatches = 0;
    
    clinic.procedures.forEach(proc => {
      const procName = (proc.procedureName || '').toLowerCase();
      const procCategory = (proc.category || '').toLowerCase();
      
      if (procName === query) {
        exactMatches++;
      } else if (procName.includes(query)) {
        partialMatches++;
      }
      
      if (procCategory === query || procCategory.includes(query)) {
        categoryMatches++;
      }
    });
    
    procedureMatchScore = Math.min(
      (exactMatches * 3) + (partialMatches * 1) + (categoryMatches * 0.5),
      10
    );
  } else if (!query && clinic.procedures) {
    // No query - score based on procedure variety
    procedureMatchScore = Math.min(clinic.procedures.length * 0.1, 5);
  }
  
  score += procedureMatchScore * 5; // 0-50 points
  
  // 3. Rating Score (0-10 points, weight: 2x)
  const rating = clinic.rating || 0;
  score += rating * 2; // 0-10 points
  
  // 4. Review Count Score (0-5 points, weight: 0.1x)
  const reviewCount = clinic.reviewCount || 0;
  score += Math.min(reviewCount, 50) * 0.1; // 0-5 points
  
  // 5. Distance Penalty (subtract points based on distance)
  if (!query && userLocation && clinic.latitude && clinic.longitude) {
    // When no search query, prioritize nearby locations
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      clinic.latitude,
      clinic.longitude
    );
    score -= distance * 0.01; // Penalty increases with distance
  }
  
  return score;
};

/**
 * Sort clinics based on specified sort mode
 * @param {Array} clinics - Array of clinics to sort
 * @param {String} sortBy - Sort mode: 'relevance', 'rating', 'reviewCount'
 * @param {String} searchQuery - Current search query
 * @param {Array} searchResults - Lunr search results (for relevance scoring)
 * @param {Object} userLocation - User's location { lat, lng }
 * @returns {Array} Sorted clinics
 */
export const sortResults = (clinics, sortBy = 'relevance', searchQuery = '', searchResults = [], userLocation = null) => {
  if (!clinics || clinics.length === 0) {
    return [];
  }
  
  // Create a copy to avoid mutating original array
  const clinicsToSort = [...clinics];
  
  switch (sortBy) {
    case 'rating':
      // Sort by average rating (highest first), then by review count as tiebreaker
      return clinicsToSort.sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
      
    case 'reviewCount':
      // Sort by review count (most reviews first), then by rating as tiebreaker
      return clinicsToSort.sort((a, b) => {
        const reviewDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return (b.rating || 0) - (a.rating || 0);
      });
      
    case 'relevance':
    default:
      // Build a map of clinic IDs to search results for quick lookup
      const searchResultMap = {};
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach(result => {
          const clinicIndex = parseInt(result.ref);
          searchResultMap[clinicIndex] = result;
        });
      }
      
      // Calculate relevance score for each clinic and sort
      const clinicsWithScores = clinicsToSort.map((clinic, index) => {
        const searchResult = searchResultMap[index] || null;
        const relevanceScore = calculateRelevanceScore(
          clinic,
          searchQuery,
          searchResult,
          userLocation
        );
        
        return {
          clinic,
          score: relevanceScore
        };
      });
      
      // Sort by relevance score (highest first)
      clinicsWithScores.sort((a, b) => b.score - a.score);
      
      return clinicsWithScores.map(item => item.clinic);
  }
};