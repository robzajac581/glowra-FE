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
      procedureNames: procedureNames,
      procedureCategories: procedureCategories,
      // Store original index for retrieval
      _originalIndex: index
    };
  });

  // Default field configurations for clinic-based search
  const fields = options.fields || {
    state: { boost: 9 },
    city: { boost: 9 },
    clinicName: { boost: 8 },
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
 * Applies filters to a set of clinics based on their procedures
 * @param {Array} clinics - Array of clinics to filter
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered clinics with procedures filtered to match criteria
 */
export const applyFilters = (clinics, filters) => {
  if (!clinics || clinics.length === 0) {
    return [];
  }

  return clinics
    .map(clinic => {
      // Filter the procedures within the clinic
      let filteredProcedures = [...clinic.procedures];

      // Category filter - only keep procedures in this category
      if (filters.category) {
        filteredProcedures = filteredProcedures.filter(proc => 
          proc.category && proc.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

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