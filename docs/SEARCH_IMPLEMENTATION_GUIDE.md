# Frontend Search Implementation Guide for Backend Team

## Overview
This document explains how the frontend currently handles search functionality, what responsibilities it manages, and what it expects from the backend API.

---

## Backend API Endpoint

### Current Endpoint
```
GET http://localhost:3001/api/procedures/search-index
```

### What Backend Currently Provides
The backend provides a **complete dataset** of all procedures with the following fields:

```javascript
{
  ProcedureID: number,
  ClinicID: number,
  ProviderName: string,
  ClinicName: string,
  ProcedureName: string,
  AverageCost: number,
  City: string,
  State: string,
  Website: string,
  Category: string,    // e.g., "Breast", "Body", "Face", "Injectibles", "Skin", "Other"
  Specialty: string
}
```

### Key Backend Responsibilities
- **Data retrieval**: Fetching all procedures from the database
- **Data structure**: Providing complete, properly formatted records
- **Data integrity**: Ensuring all fields are populated and valid
- **No filtering**: Backend currently returns ALL procedures (no server-side filtering)
- **No pagination**: Backend returns the complete dataset in one response
- **No sorting**: Backend does not apply any sort order
- **No search logic**: Backend does not perform any text search

---

## Frontend Responsibilities

### 1. **Complete Search Indexing** (Client-Side)
The frontend builds a **Lunr.js search index** from all procedures on initial page load:

```javascript
// Frontend creates search index with field-specific boosting
const idx = createSearchIndex(transformedData, {
  fields: {
    name: { boost: 7 },       // Procedure name (highest priority)
    doctorInfo: { boost: 4 }, // Clinic name
    doctor: { boost: 2 },     // Provider name
    category: { boost: 7 },   // Category
    specialty: { boost: 4 },  // Specialty
    City: { boost: 8 },       // City (very high priority)
    State: { boost: 9 }       // State (highest priority)
  }
});
```

**Field Boosting Explained:**
- Higher boost values (7-9) mean those fields are prioritized in search results
- City and State have the highest boost because location searches are critical
- Category and ProcedureName also have high priority


### 2. **Advanced Fuzzy Matching** (Client-Side)
Frontend implements a **5-tier fallback search strategy**:

#### Strategy 1: Exact Match
- Direct search for the user's query as entered

#### Strategy 2: Fuzzy Matching (~1 edit distance)
```javascript
// Example: "Botx" matches "Botox"
const fuzzyQuery = "Botx~1"
```

#### Strategy 3: Wildcard/Prefix Matching
```javascript
// Example: "Breas" matches "Breast"
const wildcardQuery = "Breas*"
```

#### Strategy 4: Suffix Removal
```javascript
// Example: "Breasts" matches "Breast" by removing "s"
// Tries removing 1-3 characters from end of terms
```

#### Strategy 5: Individual Term Fuzzy Search
```javascript
// For multi-word queries like "breast surgery"
// Searches each term separately with fuzzy matching
```

#### Final Fallback: Simple String Contains
```javascript
// If all Lunr strategies fail, uses JavaScript .includes()
// Searches across all fields: name, city, state, clinic, provider, category, specialty
```


### 3. **Client-Side Filtering**
After search results are generated, frontend applies filters:

```javascript
// Category filter (exact match, case-insensitive)
if (filters.category) {
  proc.category.toLowerCase() === filters.category.toLowerCase()
}

// Specialty filter (exact match, case-insensitive)
if (filters.specialty) {
  proc.specialty.toLowerCase() === filters.specialty.toLowerCase()
}

// Price range filters (numeric comparison)
if (filters.minPrice) {
  proc.price >= parseFloat(filters.minPrice)
}

if (filters.maxPrice) {
  proc.price <= parseFloat(filters.maxPrice)
}
```


### 4. **Client-Side Pagination**
Frontend handles all pagination logic:

```javascript
const NUMBER_OF_CARDS_PER_PAGE = 9;

// Calculates start/end indices
const startIndex = (page - 1) * limit;
const endIndex = startIndex + limit;

// Slices results array
const paginatedResults = results.slice(startIndex, endIndex);
```

**Pagination Features:**
- 9 results per page
- Dynamic page number generation
- Previous/Next buttons
- URL-synced page state (e.g., `?page=2`)


### 5. **URL State Management**
All search parameters are stored in URL query params:

```
/search?searchQuery=botox&category=Face&minPrice=300&maxPrice=1000&page=2
```

**Synced Parameters:**
- `searchQuery`: User's search text
- `category`: Selected category filter
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `specialty`: Specialty filter
- `page`: Current page number

**Benefits:**
- Shareable search URLs
- Browser back/forward navigation works
- Bookmark-friendly
- Preserves search state across navigation


### 6. **Data Transformation**
Frontend transforms backend data to internal format:

```javascript
// Backend format → Frontend format
{
  ProcedureID → id
  ClinicID → clinicId
  ProviderName → doctor
  ClinicName → doctorInfo
  ProcedureName → name
  AverageCost → price
  City → City (unchanged)
  State → State (unchanged)
  Category → category
  Specialty → specialty
  // Frontend adds:
  img: `/img/procedures/${(id % 6) + 1}.png`  // Cycles through 6 images
  website: Website (passthrough)
}
```


### 7. **User Geolocation**
Frontend handles browser geolocation API:

```javascript
// Gets user's lat/lng coordinates
navigator.geolocation.getCurrentPosition()

// Falls back to Chicago, IL (41.8781, -87.6298) if:
// - User denies permission
// - Browser doesn't support geolocation
// - Geolocation times out (5 second timeout)
```

Used for displaying "Nearest Locations" map (Google Maps embed).

---

## What Backend Should NOT Do

Based on current frontend implementation:

❌ **No server-side search/text matching**
- Frontend handles all search logic with Lunr.js

❌ **No server-side filtering**
- Frontend applies all filters (category, specialty, price range)

❌ **No server-side pagination**
- Frontend slices results for pagination

❌ **No server-side sorting**
- Search relevance is determined by Lunr.js field boosting

❌ **No geolocation calculations**
- Backend doesn't need to calculate distances or filter by proximity

---

## What Backend MUST Provide

✅ **Complete dataset in single response**
- All procedures, all clinics, all providers
- No pagination, no limits
- Frontend will handle everything else

✅ **Consistent data structure**
- All fields properly populated
- No null/undefined critical fields (ProcedureName, AverageCost, City, State)

✅ **Fast response time**
- Frontend makes ONE request on initial page load
- Consider caching strategy if dataset is large

✅ **Valid data types**
- `AverageCost` as number (not string)
- `ProcedureID` and `ClinicID` as numbers
- Strings for all text fields

---

## Search Flow Diagram

```
1. User visits /search page
   ↓
2. Frontend fetches ALL procedures from backend
   GET /api/procedures/search-index
   ↓
3. Frontend builds Lunr.js search index
   (Indexes: name, clinic, provider, city, state, category, specialty)
   ↓
4. User types search query
   ↓
5. Frontend performs client-side search
   - Try exact match
   - Try fuzzy match (~1 edit distance)
   - Try wildcard match
   - Try suffix removal
   - Try individual terms
   - Fallback to .includes()
   ↓
6. Frontend applies filters
   - Category filter
   - Specialty filter  
   - Min/Max price range
   ↓
7. Frontend paginates results
   - Slice to 9 items per page
   ↓
8. Frontend displays results
   - Updates URL with all parameters
   - Renders SearchResultCard components
```

---

## Performance Considerations

### Current Approach Limitations
- **Memory**: All procedures loaded into browser memory
- **Initial load**: Single large request on page load
- **Scalability**: Works well for 100-10,000 procedures, may struggle beyond that
- **Network**: One-time data transfer, but could be large (100KB - 5MB depending on dataset size)

### When Backend Should Take Over Search
If the dataset grows significantly (e.g., >10,000 procedures), consider moving search to backend:

**Backend would need to implement:**
1. Full-text search (e.g., PostgreSQL Full-Text Search, Elasticsearch)
2. Fuzzy matching (Levenshtein distance, trigram matching)
3. Relevance scoring (field boosting)
4. Server-side pagination
5. Server-side filtering
6. Geolocation distance calculations (if needed)

**Frontend would then:**
1. Send search params as query string: `?q=botox&category=Face&page=2&minPrice=300`
2. Receive paginated, filtered, sorted results
3. Display results (no client-side search logic)

---

## Testing the Search

### Sample Search Queries to Test

1. **Exact match**: "Botox" → should match procedures with "Botox" in name
2. **Fuzzy match**: "Botx" → should match "Botox" (1 letter off)
3. **Partial match**: "Breas" → should match "Breast Augmentation"
4. **City search**: "Chicago" → should match all Chicago procedures
5. **State search**: "IL" or "Illinois" → should match all Illinois procedures
6. **Multi-word**: "breast surgery" → should match procedures with both/either term
7. **Category**: "Face" → should filter to Face category
8. **Price range**: min=500, max=2000 → should filter by price

### Expected Backend Response Example
```json
[
  {
    "ProcedureID": 1,
    "ClinicID": 101,
    "ProviderName": "Dr. Jane Smith",
    "ClinicName": "Chicago Cosmetic Surgery",
    "ProcedureName": "Breast Augmentation",
    "AverageCost": 6500,
    "City": "Chicago",
    "State": "IL",
    "Website": "https://example.com",
    "Category": "Breast",
    "Specialty": "Plastic Surgery"
  },
  {
    "ProcedureID": 2,
    "ClinicID": 101,
    "ProviderName": "Dr. Jane Smith",
    "ClinicName": "Chicago Cosmetic Surgery",
    "ProcedureName": "Botox Injections",
    "AverageCost": 450,
    "City": "Chicago",
    "State": "IL",
    "Website": "https://example.com",
    "Category": "Injectibles",
    "Specialty": "Dermatology"
  }
  // ... all other procedures
]
```

---

## Questions for Backend Team

If you're considering changes to the search API:

1. **How large is the current dataset?** (Number of procedures)
2. **What's the expected growth rate?** (Will it scale to 10K+?)
3. **Is response time acceptable?** (Current single-request approach)
4. **Should we add server-side search?** (For better performance/scalability)
5. **Should we add distance-based sorting?** (Requires geolocation calculations)
6. **Should ratings/reviews be included?** (Currently hardcoded to 4.8 on frontend)

---

## Contact
For questions about frontend implementation, contact the frontend development team.
For questions about backend API, contact the backend development team.

**Document Version:** 1.0  
**Last Updated:** October 23, 2025

