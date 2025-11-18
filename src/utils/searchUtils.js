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
 * US State abbreviations and full names for location detection
 */
const US_STATES = {
  // Abbreviations
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia',
  // Full names (lowercase for matching)
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC'
};

/**
 * State adjacency mapping - defines which states are geographically adjacent
 * Used for finding nearby results when searching by state
 */
const STATE_ADJACENCY = {
  'AL': ['FL', 'GA', 'MS', 'TN'],
  'AK': [], // Alaska has no adjacent states
  'AZ': ['CA', 'CO', 'NM', 'NV', 'UT'],
  'AR': ['LA', 'MO', 'MS', 'OK', 'TN', 'TX'],
  'CA': ['AZ', 'NV', 'OR'],
  'CO': ['AZ', 'KS', 'NE', 'NM', 'OK', 'UT', 'WY'],
  'CT': ['MA', 'NY', 'RI'],
  'DE': ['MD', 'NJ', 'PA'],
  'FL': ['AL', 'GA'],
  'GA': ['AL', 'FL', 'NC', 'SC', 'TN'],
  'HI': [], // Hawaii has no adjacent states
  'ID': ['MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  'IL': ['IN', 'IA', 'KY', 'MO', 'WI'],
  'IN': ['IL', 'KY', 'MI', 'OH'],
  'IA': ['IL', 'MN', 'MO', 'NE', 'SD', 'WI'],
  'KS': ['CO', 'MO', 'NE', 'OK'],
  'KY': ['IL', 'IN', 'MO', 'OH', 'TN', 'VA', 'WV'],
  'LA': ['AR', 'MS', 'TX'],
  'ME': ['NH'],
  'MD': ['DE', 'PA', 'VA', 'WV'],
  'MA': ['CT', 'NH', 'NY', 'RI', 'VT'],
  'MI': ['IN', 'OH', 'WI'],
  'MN': ['IA', 'ND', 'SD', 'WI'],
  'MS': ['AL', 'AR', 'LA', 'TN'],
  'MO': ['AR', 'IL', 'IA', 'KS', 'KY', 'NE', 'OK', 'TN'],
  'MT': ['ID', 'ND', 'SD', 'WY'],
  'NE': ['CO', 'IA', 'KS', 'MO', 'SD', 'WY'],
  'NV': ['AZ', 'CA', 'ID', 'OR', 'UT'],
  'NH': ['ME', 'MA', 'VT'],
  'NJ': ['DE', 'NY', 'PA'],
  'NM': ['AZ', 'CO', 'OK', 'TX'],
  'NY': ['CT', 'MA', 'NJ', 'PA', 'VT'],
  'NC': ['GA', 'SC', 'TN', 'VA'],
  'ND': ['MN', 'MT', 'SD'],
  'OH': ['IN', 'KY', 'MI', 'PA', 'WV'],
  'OK': ['AR', 'CO', 'KS', 'MO', 'NM', 'TX'],
  'OR': ['CA', 'ID', 'NV', 'WA'],
  'PA': ['DE', 'MD', 'NJ', 'NY', 'OH', 'WV'],
  'RI': ['CT', 'MA'],
  'SC': ['GA', 'NC'],
  'SD': ['IA', 'MN', 'MT', 'ND', 'NE', 'WY'],
  'TN': ['AL', 'AR', 'GA', 'KY', 'MO', 'MS', 'NC', 'VA'],
  'TX': ['AR', 'LA', 'NM', 'OK'],
  'UT': ['AZ', 'CO', 'ID', 'NV', 'WY'],
  'VT': ['MA', 'NH', 'NY'],
  'VA': ['KY', 'MD', 'NC', 'TN', 'WV'],
  'WA': ['ID', 'OR'],
  'WV': ['KY', 'MD', 'OH', 'PA', 'VA'],
  'WI': ['IL', 'IA', 'MI', 'MN'],
  'WY': ['CO', 'ID', 'MT', 'NE', 'SD', 'UT'],
  'DC': ['MD', 'VA']
};

/**
 * Common procedure abbreviations for detection
 */
const PROCEDURE_ABBREVIATIONS = {
  'bbl': 'brazilian butt lift',
  'tummy tuck': 'abdominoplasty',
  'nose job': 'rhinoplasty',
  'boob job': 'breast augmentation',
  'botox': 'botulinum toxin',
  'filler': 'dermal filler',
  'lip filler': 'lip augmentation',
  'face lift': 'facelift',
  'eye lift': 'blepharoplasty',
  'lipo': 'liposuction',
  'mommy makeover': 'mommy makeover',
  'breast aug': 'breast augmentation',
  'breast lift': 'mastopexy'
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
 * Parse search query to detect location and procedure terms
 * @param {String} query - Search query string
 * @param {Array} clinics - Array of all clinics (to check for valid cities/states)
 * @returns {Object} Parsed query with location and procedure terms
 */
export const parseSearchQuery = (query, clinics = []) => {
  if (!query || !query.trim()) {
    return { locationTerms: [], procedureTerms: [], remainingTerms: [] };
  }

  const trimmed = query.trim().toLowerCase();
  const terms = trimmed.split(/\s+/).filter(t => t.length > 0);
  
  const locationTerms = [];
  const procedureTerms = [];
  const remainingTerms = [];
  
  // Extract unique cities and states from clinics for matching
  const validCities = new Set();
  const validStates = new Set();
  clinics.forEach(clinic => {
    if (clinic.city) validCities.add(clinic.city.toLowerCase());
    if (clinic.state) validStates.add(clinic.state.toLowerCase());
  });

  // Check each term
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    let matched = false;

    // Check for zip code
    if (isZipCode(term)) {
      locationTerms.push({ type: 'zip', value: term });
      matched = true;
    }
    // Check for state abbreviation (2 letters, uppercase)
    else if (term.length === 2 && US_STATES[term.toUpperCase()]) {
      locationTerms.push({ type: 'state', value: term.toUpperCase() });
      matched = true;
    }
    // Check for state full name
    else if (US_STATES[term]) {
      locationTerms.push({ type: 'state', value: US_STATES[term] });
      matched = true;
    }
    // Check for procedure abbreviations FIRST (before city matching to avoid false positives)
    else if (PROCEDURE_ABBREVIATIONS[term]) {
      procedureTerms.push({ 
        type: 'abbreviation', 
        value: term, 
        fullName: PROCEDURE_ABBREVIATIONS[term] 
      });
      matched = true;
    }
    // Check for valid city (must match a city in our clinic data)
    else if (validCities.has(term)) {
      locationTerms.push({ type: 'city', value: term });
      matched = true;
    }
    // Check for multi-word city names (e.g., "Palo Alto", "New York")
    // This handles both cities in our data and potential city names
    else if (i < terms.length - 1) {
      const twoWordCity = `${term} ${terms[i + 1]}`;
      if (validCities.has(twoWordCity)) {
        // Exact match in our clinic data
        locationTerms.push({ type: 'city', value: twoWordCity });
        i++; // Skip next term since we used it
        matched = true;
      } else {
        // Check if it looks like a city name (capitalized words, common patterns)
        // Common city name patterns: "Palo Alto", "New York", "San Francisco", etc.
        const cityPatterns = ['palo', 'san', 'santa', 'los', 'las', 'new', 'mount', 'saint', 'st.', 'fort', 'lake'];
        const firstWord = term.toLowerCase();
        const secondWord = terms[i + 1].toLowerCase();
        
        // If first word matches a common city prefix, treat as potential city
        if (cityPatterns.includes(firstWord) || 
            (firstWord.length > 2 && secondWord.length > 2 && 
             !PROCEDURE_ABBREVIATIONS[twoWordCity] && 
             !PROCEDURE_ABBREVIATIONS[term] && 
             !PROCEDURE_ABBREVIATIONS[secondWord])) {
          locationTerms.push({ type: 'city', value: twoWordCity });
          i++; // Skip next term since we used it
          matched = true;
        }
      }
    }
    
    if (!matched) {
      remainingTerms.push(term);
    }
  }

  // If we have remaining terms and no procedure terms yet, check if they might be procedures
  // by checking against common procedure names
  if (remainingTerms.length > 0 && procedureTerms.length === 0) {
    const remainingQuery = remainingTerms.join(' ');
    // Check if any remaining term matches a procedure abbreviation
    for (const term of remainingTerms) {
      if (PROCEDURE_ABBREVIATIONS[term]) {
        const idx = remainingTerms.indexOf(term);
        if (idx !== -1) {
          procedureTerms.push({ 
            type: 'abbreviation', 
            value: term, 
            fullName: PROCEDURE_ABBREVIATIONS[term] 
          });
          remainingTerms.splice(idx, 1);
        }
      }
    }
  }

  return {
    locationTerms,
    procedureTerms,
    remainingTerms,
    hasLocation: locationTerms.length > 0,
    hasProcedure: procedureTerms.length > 0 || remainingTerms.length > 0
  };
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
 * Filter clinics by exact location match (city, state, or zip)
 * Returns only clinics that exactly match ALL location terms (AND logic)
 * @param {Array} clinics - Array of clinics to filter
 * @param {Array} locationTerms - Array of location term objects from parseSearchQuery
 * @returns {Array} Filtered clinics matching exact location criteria
 */
export const filterByLocationExact = (clinics, locationTerms) => {
  if (!locationTerms || locationTerms.length === 0) {
    return clinics;
  }

  // If multiple location terms, use AND logic (clinic must match ALL terms)
  // If single location term, use OR logic (clinic matches the term)
  if (locationTerms.length > 1) {
    return clinics.filter(clinic => {
      return locationTerms.every(locationTerm => {
        if (locationTerm.type === 'zip') {
          return clinic.zipCode && clinic.zipCode === locationTerm.value;
        }
        else if (locationTerm.type === 'state') {
          // State matching: compare uppercase values
          // locationTerm.value is already normalized to abbreviation (e.g., "FL")
          const stateValue = locationTerm.value.toUpperCase();
          const clinicState = clinic.state ? clinic.state.toUpperCase().trim() : '';
          return clinicState === stateValue;
        }
        else if (locationTerm.type === 'city') {
          const cityLower = locationTerm.value.toLowerCase();
          return clinic.city && clinic.city.toLowerCase() === cityLower;
        }
        return false;
      });
    });
  }

  // Single location term - use OR logic (original behavior)
  const matchedClinics = new Set();
  
  locationTerms.forEach(locationTerm => {
    if (locationTerm.type === 'zip') {
      // Exact zip code match only
      clinics.forEach(clinic => {
        if (clinic.zipCode && clinic.zipCode === locationTerm.value) {
          matchedClinics.add(clinic);
        }
      });
    }
    else if (locationTerm.type === 'state') {
      // Exact state match only - compare uppercase values
      // locationTerm.value is already normalized to abbreviation (e.g., "FL")
      const stateValue = locationTerm.value.toUpperCase();
      clinics.forEach(clinic => {
        if (clinic.state) {
          const clinicState = clinic.state.toUpperCase().trim();
          if (clinicState === stateValue) {
            matchedClinics.add(clinic);
          }
        }
      });
    }
    else if (locationTerm.type === 'city') {
      // Exact city match only
      const cityLower = locationTerm.value.toLowerCase();
      clinics.forEach(clinic => {
        if (clinic.city && clinic.city.toLowerCase() === cityLower) {
          matchedClinics.add(clinic);
        }
      });
    }
  });

  return Array.from(matchedClinics);
};

/**
 * Filter clinics by nearby location (city, state, or zip)
 * Returns clinics from nearby areas when exact matches are insufficient
 * @param {Array} clinics - Array of clinics to filter
 * @param {Array} locationTerms - Array of location term objects from parseSearchQuery
 * @param {Array} exactMatches - Array of clinics that already matched exactly (to exclude)
 * @returns {Array} Filtered clinics from nearby areas
 */
export const filterByLocationNearby = (clinics, locationTerms, exactMatches = []) => {
  if (!locationTerms || locationTerms.length === 0) {
    return [];
  }

  // Create a set of exact match clinic IDs for exclusion
  const exactMatchIds = new Set(exactMatches.map(c => c.clinicId));

  // Group clinics by state and city for proximity matching
  const clinicsByState = {};
  const clinicsByCity = {};
  clinics.forEach(clinic => {
    if (clinic.state) {
      const state = clinic.state.toLowerCase();
      if (!clinicsByState[state]) {
        clinicsByState[state] = [];
      }
      clinicsByState[state].push(clinic);
    }
    if (clinic.city) {
      const city = clinic.city.toLowerCase();
      if (!clinicsByCity[city]) {
        clinicsByCity[city] = [];
      }
      clinicsByCity[city].push(clinic);
    }
  });

  const nearbyClinics = new Set();
  
  locationTerms.forEach(locationTerm => {
    if (locationTerm.type === 'zip') {
      // Nearby zip codes: same first 3 digits (excluding exact matches)
      const zipPrefix = getZipCodePrefix(locationTerm.value);
      if (zipPrefix) {
        clinics.forEach(clinic => {
          if (clinic.zipCode && 
              clinic.zipCode.length >= 3 && 
              !exactMatchIds.has(clinic.clinicId)) {
            const clinicZipPrefix = getZipCodePrefix(clinic.zipCode);
            if (clinicZipPrefix === zipPrefix) {
              nearbyClinics.add(clinic);
            }
          }
        });
      }
    }
    else if (locationTerm.type === 'state') {
      // Nearby states: adjacent states (excluding exact matches)
      const stateAbbr = locationTerm.value.toUpperCase();
      const adjacentStates = STATE_ADJACENCY[stateAbbr] || [];
      
      adjacentStates.forEach(adjState => {
        const adjStateLower = adjState.toLowerCase();
        if (clinicsByState[adjStateLower]) {
          clinicsByState[adjStateLower].forEach(clinic => {
            if (!exactMatchIds.has(clinic.clinicId)) {
              nearbyClinics.add(clinic);
            }
          });
        }
      });
    }
    else if (locationTerm.type === 'city') {
      // Nearby cities: other cities in same state first, then adjacent states
      const cityLower = locationTerm.value.toLowerCase();
      
      // Find the state(s) of the searched city from exact matches
      const searchedStates = new Set();
      exactMatches.forEach(clinic => {
        if (clinic.state) {
          searchedStates.add(clinic.state.toUpperCase());
        }
      });
      
      // Also check if we have a state term in the location terms (e.g., "Miami Florida")
      // This helps us know which state to use for nearby searches
      const stateTerm = locationTerms.find(lt => lt.type === 'state');
      if (stateTerm) {
        searchedStates.add(stateTerm.value.toUpperCase());
      }
      
      // If we have exact matches or a state term, get nearby cities in same state(s)
      if (searchedStates.size > 0) {
        searchedStates.forEach(stateAbbr => {
          const stateLower = stateAbbr.toLowerCase();
          if (clinicsByState[stateLower]) {
            clinicsByState[stateLower].forEach(clinic => {
              // Exclude exact matches and the searched city itself
              if (!exactMatchIds.has(clinic.clinicId) && 
                  clinic.city && 
                  clinic.city.toLowerCase() !== cityLower) {
                nearbyClinics.add(clinic);
              }
            });
          }
        });
        
        // Also include clinics from adjacent states (cross-border cities)
        searchedStates.forEach(stateAbbr => {
          const adjacentStates = STATE_ADJACENCY[stateAbbr] || [];
          adjacentStates.forEach(adjState => {
            const adjStateLower = adjState.toLowerCase();
            if (clinicsByState[adjStateLower]) {
              clinicsByState[adjStateLower].forEach(clinic => {
                if (!exactMatchIds.has(clinic.clinicId)) {
                  nearbyClinics.add(clinic);
                }
              });
            }
          });
        });
      }
    }
  });

  return Array.from(nearbyClinics);
};

/**
 * Filter clinics by procedure terms
 * @param {Array} clinics - Array of clinics to filter
 * @param {Array} procedureTerms - Array of procedure term objects from parseSearchQuery
 * @param {Array} remainingTerms - Remaining search terms that might be procedure names
 * @returns {Array} Filtered clinics that offer matching procedures
 */
export const filterByProcedure = (clinics, procedureTerms, remainingTerms) => {
  if ((!procedureTerms || procedureTerms.length === 0) && (!remainingTerms || remainingTerms.length === 0)) {
    return clinics;
  }

  const searchTerms = [];
  
  // Add procedure abbreviation full names
  procedureTerms.forEach(term => {
    if (term.fullName) {
      searchTerms.push(term.fullName.toLowerCase());
    }
    searchTerms.push(term.value.toLowerCase());
  });
  
  // Add remaining terms as potential procedure names
  if (remainingTerms && remainingTerms.length > 0) {
    searchTerms.push(...remainingTerms.map(t => t.toLowerCase()));
  }

  return clinics.filter(clinic => {
    if (!clinic.procedures || clinic.procedures.length === 0) {
      return false;
    }

    // Check if any procedure matches any search term
    return clinic.procedures.some(proc => {
      const procNameLower = (proc.procedureName || '').toLowerCase();
      return searchTerms.some(term => procNameLower.includes(term));
    });
  });
};

/**
 * Performs a search with location-aware filtering and AND logic for combined queries
 * Returns exact matches first, then nearby results if exact matches < 9
 * @param {Object} searchIndex - Lunr search index
 * @param {Array} clinics - Original clinics array
 * @param {String} query - Search query
 * @param {Number} minResults - Minimum number of results to fill (default: 9)
 * @returns {Object} Object with exactResults, nearbyResults, and metadata
 */
export const performSearch = (searchIndex, clinics, query, minResults = 9) => {
  if (!query || !query.trim()) {
    return { 
      exactResults: clinics, 
      nearbyResults: [], 
      isLocationSearch: false,
      hasNearbyResults: false
    };
  }

  const trimmedQuery = query.trim();

  // Parse the query to detect location and procedure terms
  const parsed = parseSearchQuery(trimmedQuery, clinics);
  
  // If we detected location terms, use location-first filtering with exact/nearby separation
  if (parsed.hasLocation) {
    // Get exact location matches first (ALL clinics from exact location, regardless of procedure)
    let exactLocationMatches = filterByLocationExact(clinics, parsed.locationTerms);
    
    // Get nearby location matches (for potential use if we need more results)
    let nearbyLocationMatches = filterByLocationNearby(clinics, parsed.locationTerms, exactLocationMatches);
    
    // If we have procedure terms, filter both exact and nearby by procedure
    let exactMatches = exactLocationMatches;
    let nearbyCandidates = nearbyLocationMatches;
    
    if (parsed.hasProcedure) {
      exactMatches = filterByProcedure(exactLocationMatches, parsed.procedureTerms, parsed.remainingTerms);
      nearbyCandidates = filterByProcedure(nearbyLocationMatches, parsed.procedureTerms, parsed.remainingTerms);
    }
    
    // If we have fewer than minResults exact matches, get nearby results to fill up to minResults
    let nearbyResults = [];
    const hasNearbyResults = exactMatches.length < minResults;
    
    if (hasNearbyResults) {
      // Limit nearby results to fill up to minResults total
      const needed = minResults - exactMatches.length;
      nearbyResults = nearbyCandidates.slice(0, needed);
    }
    
    return { 
      exactResults: exactMatches,
      nearbyResults: nearbyResults,
      isLocationSearch: true,
      hasNearbyResults: hasNearbyResults,
      hasProcedure: parsed.hasProcedure
    };
  }
  
  // If we only have procedure terms (no location), use existing search logic
  // But still check for zip code as a special case
  if (isZipCode(trimmedQuery)) {
    const zipPrefix = getZipCodePrefix(trimmedQuery);
    
    // Get exact zip code matches
    const exactZipMatches = clinics.filter(clinic => {
      if (!clinic.zipCode) return false;
      return clinic.zipCode === trimmedQuery;
    });
    
    // If we have fewer than minResults, get nearby zip codes
    let nearbyZipResults = [];
    const hasNearbyZipResults = exactZipMatches.length < minResults;
    
    if (hasNearbyZipResults) {
      const nearbyZipCandidates = clinics.filter(clinic => {
        if (!clinic.zipCode || clinic.zipCode === trimmedQuery) return false;
        
        // Nearby zip codes (same first 3 digits)
        if (zipPrefix && clinic.zipCode.length >= 3) {
          const clinicZipPrefix = getZipCodePrefix(clinic.zipCode);
          return clinicZipPrefix === zipPrefix;
        }
        
        return false;
      });
      
      const needed = minResults - exactZipMatches.length;
      nearbyZipResults = nearbyZipCandidates.slice(0, needed);
    }
    
    return { 
      exactResults: exactZipMatches,
      nearbyResults: nearbyZipResults,
      isLocationSearch: true,
      hasNearbyResults: hasNearbyZipResults
    };
  }

  // If we have procedure terms but no location, filter by procedure first
  if (parsed.hasProcedure && !parsed.hasLocation) {
    const procedureFiltered = filterByProcedure(clinics, parsed.procedureTerms, parsed.remainingTerms);
    return { 
      exactResults: procedureFiltered,
      nearbyResults: [],
      isLocationSearch: false,
      hasNearbyResults: false
    };
  }

  // Fall back to existing Lunr.js search for general queries
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
      const lunrResults = searchResults.map(result => clinics[parseInt(result.ref)]);
      return { 
        exactResults: lunrResults,
        nearbyResults: [],
        isLocationSearch: false,
        hasNearbyResults: false
      };
    }
    
    // Final fallback: simple contains search on clinic data
    const fallbackResults = clinics.filter(clinic => {
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
    
    return { 
      exactResults: fallbackResults,
      nearbyResults: [],
      isLocationSearch: false,
      hasNearbyResults: false
    };
  } catch (error) {
    console.error('Search error:', error);
    
    // Fall back to simple text matching if Lunr search fails
    const errorFallbackResults = clinics.filter(clinic => {
      const searchLower = query.toLowerCase();
      const procedureNames = clinic.procedures.map(p => p.procedureName.toLowerCase()).join(' ');
      
      return (
        (clinic.clinicName && clinic.clinicName.toLowerCase().includes(searchLower)) ||
        (clinic.city && clinic.city.toLowerCase().includes(searchLower)) ||
        (clinic.state && clinic.state.toLowerCase().includes(searchLower)) ||
        procedureNames.includes(searchLower)
      );
    });
    
    return { 
      exactResults: errorFallbackResults,
      nearbyResults: [],
      isLocationSearch: false,
      hasNearbyResults: false
    };
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