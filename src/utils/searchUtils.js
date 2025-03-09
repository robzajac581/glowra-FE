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
    name: { boost: 10 },
    doctorInfo: { boost: 5 },
    doctor: { boost: 3 },
    category: { boost: 7 },
    specialty: { boost: 5 },
    City: { boost: 2 },
    State: { boost: 1 }
  };

  // Create the Lunr index
  const idx = lunr(function() {
    // Add the fields to the index
    Object.entries(fields).forEach(([fieldName, config]) => {
      this.field(fieldName, config);
    });

    // Register a pipeline function for word stemming (optional, Lunr does this by default)
    // Add a custom tokenizer to improve matching or handling special characters if needed
    
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
    // Try the Lunr search first (handles complex queries better)
    const searchResults = searchIndex.search(query);
    
    // If we have results, map them back to the original documents
    if (searchResults.length > 0) {
      return searchResults.map(result => documents[parseInt(result.ref)]);
    }
    
    // If no results from Lunr search, try simple contains search
    // This helps with partial or fuzzy matches that Lunr might miss
    const processedQuery = query.toLowerCase().trim();
    return documents.filter(doc => 
      (doc.name && doc.name.toLowerCase().includes(processedQuery)) ||
      (doc.doctorInfo && doc.doctorInfo.toLowerCase().includes(processedQuery)) ||
      (doc.doctor && doc.doctor.toLowerCase().includes(processedQuery)) ||
      (doc.category && doc.category.toLowerCase().includes(processedQuery)) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(processedQuery))
    );
  } catch (error) {
    console.error('Search error:', error);
    
    // Fall back to simple text matching if Lunr search fails
    const processedQuery = query.toLowerCase().trim();
    return documents.filter(doc => 
      (doc.name && doc.name.toLowerCase().includes(processedQuery)) ||
      (doc.doctorInfo && doc.doctorInfo.toLowerCase().includes(processedQuery))
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
    
    // Location filter
    if (filters.location) {
      const [city] = filters.location.split(',');
      if (!proc.City || !proc.City.toLowerCase().includes(city.toLowerCase())) {
        return false;
      }
    }
    
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