// searchUtils.js
import lunr from 'lunr';

/**
 * Creates an enhanced Lunr search index with better handling for partial matches
 * @param {Array} documents - Array of documents to index
 * @param {Object} options - Indexing options with field configurations
 * @returns {Object} Lunr search index
 */
export const createSearchIndex = (documents, options = {}) => {
  // Default field configurations
  const fields = options.fields || {
      name: { boost: 7 },       // Procedure name
      doctorInfo: { boost: 4 },  // Clinic name
      doctor: { boost: 2 },      // Provider name
      category: { boost: 7 },
      specialty: { boost: 4 },
      City: { boost: 8 },
      State: { boost: 9 }
  };

  // Create the Lunr index with enhanced configuration
  const idx = lunr(function() {
    // Configure the pipeline for better fuzzy matching
    this.pipeline.remove(lunr.stemmer);
    this.searchPipeline.remove(lunr.stemmer);
    
    // Add the fields to the index
    Object.entries(fields).forEach(([fieldName, config]) => {
      this.field(fieldName, config);
    });
    
    // Add documents to the index
    documents.forEach((doc, index) => {
      // Create a copy of the document with a stringified ID for Lunr
      const indexDoc = {
        ...doc,
        id: index.toString()
      };
      this.add(indexDoc);
    });
  });

  return idx;
};

/**
 * Performs a search with fallback to simple filtering for complex queries
 * @param {Object} searchIndex - Lunr search index
 * @param {Array} documents - Original documents array
 * @param {String} query - Search query
 * @returns {Array} Matched documents
 */
export const performSearch = (searchIndex, documents, query) => {
  if (!query || !query.trim()) {
    return documents;
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
    
    // If we have results from any strategy, map them back to the original documents
    if (searchResults.length > 0) {
      return searchResults.map(result => documents[parseInt(result.ref)]);
    }
    
    // Final fallback: simple contains search
    return documents.filter(doc => 
      (doc.name && doc.name.toLowerCase().includes(query.toLowerCase())) ||
      (doc.City && doc.City.toLowerCase().includes(query.toLowerCase())) ||
      (doc.State && doc.State.toLowerCase().includes(query.toLowerCase())) ||
      (doc.doctorInfo && doc.doctorInfo.toLowerCase().includes(query.toLowerCase())) ||
      (doc.doctor && doc.doctor.toLowerCase().includes(query.toLowerCase())) ||
      (doc.category && doc.category.toLowerCase().includes(query.toLowerCase())) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(query.toLowerCase()))
    );
  } catch (error) {
    console.error('Search error:', error);
    
    // Fall back to simple text matching if Lunr search fails
    return documents.filter(doc => 
      (doc.name && doc.name.toLowerCase().includes(query.toLowerCase())) ||
      (doc.City && doc.City.toLowerCase().includes(query.toLowerCase())) ||
      (doc.State && doc.State.toLowerCase().includes(query.toLowerCase())) ||
      (doc.doctorInfo && doc.doctorInfo.toLowerCase().includes(query.toLowerCase()))
    );
  }
};

/**
 * Applies filters to a set of procedures
 * @param {Array} procedures - Array of procedures to filter
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered procedures
 */
export const applyFilters = (procedures, filters) => {
  if (!procedures || procedures.length === 0) {
    return [];
  }

  return procedures.filter(proc => {
    // Category filter
    if (filters.category && 
        proc.category && 
        proc.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    
    // Location filter is removed - now handled through search query
    
    // Specialty filter
    if (filters.specialty && 
        proc.specialty && 
        proc.specialty.toLowerCase() !== filters.specialty.toLowerCase()) {
      return false;
    }
    
    // Price range filters
    if (filters.minPrice && proc.price < parseFloat(filters.minPrice)) {
      return false;
    }
    
    if (filters.maxPrice && proc.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    
    return true;
  });
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