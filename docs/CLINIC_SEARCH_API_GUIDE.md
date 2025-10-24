# Clinic-Based Search API Guide for Frontend Team

## Overview
This document details the new clinic-based search API that replaces the procedure-centric search approach. The API now returns clinics with their complete procedure lists, enabling the frontend to build a more intuitive search experience where users find clinics that offer specific procedures.

**Document Version:** 1.0  
**Last Updated:** October 23, 2025  
**Breaking Changes:** Yes - this is a complete paradigm shift from procedure-based to clinic-based search

---

## Section 1: Endpoint Overview

### New Endpoint
```
GET http://localhost:3001/api/clinics/search-index
```

### Purpose
Returns all clinics with their complete procedure lists in a single response. This endpoint is designed for client-side search implementation where the frontend:
1. Fetches all data once on page load
2. Builds a search index (e.g., using Lunr.js)
3. Handles all search, filtering, and pagination client-side

### When to Use
- On search page initial load
- When refreshing the search data cache
- When user navigates back to search page (if not cached)

### Performance Characteristics
- **Expected clinics:** ~150 clinics
- **Expected procedures per clinic:** ~20 average
- **Total records in response:** ~3,000 procedure entries
- **Response size:** 500KB - 2MB (estimated)
- **Response time:** < 2 seconds (typical)
- **Caching:** Recommended to cache for 5-10 minutes client-side

---

## Section 2: Response Structure

### Response Format
```typescript
{
  clinics: Clinic[],
  meta: {
    totalClinics: number,
    timestamp: string (ISO 8601)
  }
}
```

### Clinic Object Structure
```typescript
interface Clinic {
  clinicId: number;           // Unique clinic identifier
  clinicName: string;         // Display name of the clinic
  address: string;            // Full street address
  city: string;               // City name
  state: string;              // State/Province abbreviation (e.g., "CA", "IL")
  rating: number;             // Google rating (0-5), defaults to 0 if null
  reviewCount: number;        // Number of Google reviews, defaults to 0 if null
  clinicCategory: string;     // Primary clinic category (e.g., "Medical Spa", "Plastic Surgery")
  photoURL: string | null;    // Google Places photo URL, null if not available
  procedures: Procedure[];    // Array of all procedures offered by this clinic
}
```

### Procedure Object Structure
```typescript
interface Procedure {
  procedureId: number;        // Unique procedure identifier
  procedureName: string;      // Display name of the procedure
  price: number;              // Average cost, defaults to 0 if null
  category: string;           // Procedure category (e.g., "Breast", "Face", "Body", "Injectibles", "Skin", "Other")
}
```

### Field Nullability
- **Can be null/0:** `rating`, `reviewCount`, `price`, `city`, `state`, `address`, `photoURL`
- **Always present:** `clinicId`, `clinicName`, `clinicCategory`, `procedures` (array, may be empty)
- **Procedure array:** Always an array, never null (but can be empty if clinic has no valid procedures)

### Example Response
```json
{
  "clinics": [
    {
      "clinicId": 1,
      "clinicName": "Chicago Cosmetic Surgery Center",
      "address": "123 N Michigan Ave, Suite 500",
      "city": "Chicago",
      "state": "IL",
      "rating": 4.8,
      "reviewCount": 245,
      "clinicCategory": "Plastic Surgery",
      "photoURL": "https://lh3.googleusercontent.com/places/ANXAkqF...",
      "procedures": [
        {
          "procedureId": 101,
          "procedureName": "Breast Augmentation",
          "price": 6500,
          "category": "Breast"
        },
        {
          "procedureId": 102,
          "procedureName": "Breast Lift",
          "price": 7200,
          "category": "Breast"
        },
        {
          "procedureId": 203,
          "procedureName": "Liposuction",
          "price": 4500,
          "category": "Body"
        },
        {
          "procedureId": 305,
          "procedureName": "Botox",
          "price": 450,
          "category": "Injectibles"
        }
      ]
    },
    {
      "clinicId": 2,
      "clinicName": "Beverly Hills Aesthetics",
      "address": "456 Rodeo Drive",
      "city": "Beverly Hills",
      "state": "CA",
      "rating": 4.9,
      "reviewCount": 892,
      "clinicCategory": "Medical Spa",
      "photoURL": null,
      "procedures": [
        {
          "procedureId": 401,
          "procedureName": "Facelift",
          "price": 12000,
          "category": "Face"
        },
        {
          "procedureId": 402,
          "procedureName": "Rhinoplasty",
          "price": 8500,
          "category": "Face"
        }
      ]
    }
  ],
  "meta": {
    "totalClinics": 2,
    "timestamp": "2025-10-23T14:32:10.123Z"
  }
}
```

---

## Section 3: Frontend Responsibilities

### 3.1 Data Fetching
```javascript
// Fetch data once on page load
const response = await fetch('http://localhost:3001/api/clinics/search-index');
const { clinics, meta } = await response.json();

// Consider caching the response for 5-10 minutes
localStorage.setItem('clinicsCache', JSON.stringify({ clinics, timestamp: Date.now() }));
```

### 3.2 Build Search Index
Create a Lunr.js index that includes clinic information and all procedure names:

```javascript
import lunr from 'lunr';

function buildSearchIndex(clinics) {
  // Transform data for indexing
  const indexData = clinics.map(clinic => {
    // Concatenate all procedure names for searchability
    const procedureNames = clinic.procedures.map(p => p.procedureName).join(' ');
    const procedureCategories = [...new Set(clinic.procedures.map(p => p.category))].join(' ');
    
    return {
      id: clinic.clinicId.toString(),
      clinicName: clinic.clinicName,
      city: clinic.city || '',
      state: clinic.state || '',
      address: clinic.address || '',
      clinicCategory: clinic.clinicCategory,
      procedureNames: procedureNames,
      procedureCategories: procedureCategories,
      // Store original clinic data for retrieval
      _clinic: clinic
    };
  });

  // Create Lunr index with field boosting
  const idx = lunr(function() {
    this.ref('id');
    this.field('clinicName', { boost: 8 });
    this.field('city', { boost: 9 });
    this.field('state', { boost: 9 });
    this.field('procedureNames', { boost: 7 });
    this.field('procedureCategories', { boost: 7 });
    this.field('clinicCategory', { boost: 5 });
    this.field('address', { boost: 3 });

    indexData.forEach(doc => this.add(doc));
  });

  return { idx, indexData };
}
```

### 3.3 Procedure Display Logic

#### When Search Matches a Procedure
Display the matched procedure(s) plus other procedures from the same category:

```javascript
function getDisplayProcedures(clinic, searchQuery) {
  const query = searchQuery.toLowerCase();
  const matchedProcedures = [];
  const categoryMatches = new Set();

  // Find directly matching procedures
  clinic.procedures.forEach(proc => {
    if (proc.procedureName.toLowerCase().includes(query)) {
      matchedProcedures.push(proc);
      categoryMatches.add(proc.category);
    }
  });

  // If we found matches, add other procedures from same categories
  if (matchedProcedures.length > 0) {
    const relatedProcedures = clinic.procedures.filter(proc => 
      categoryMatches.has(proc.category) && 
      !matchedProcedures.find(m => m.procedureId === proc.procedureId)
    );

    // Combine matched + related, limit to 5 total
    return [...matchedProcedures, ...relatedProcedures].slice(0, 5);
  }

  // If no direct matches (location search), return popular procedures
  return getPopularProcedures(clinic.procedures);
}
```

#### When Search is Location-Based
Display the most popular procedures (up to 5):

```javascript
// This function should be implemented based on the backend's popular procedures dictionary
// Or use a similar client-side ranking
function getPopularProcedures(procedures) {
  const popularByCategory = {
    'Breast': ['Breast Augmentation', 'Breast Lift', 'Breast Reduction'],
    'Face': ['Facelift', 'Rhinoplasty', 'Blepharoplasty'],
    'Body': ['Liposuction', 'Tummy Tuck', 'Brazilian Butt Lift'],
    'Injectibles': ['Botox', 'Dermal Fillers', 'Lip Fillers'],
    'Skin': ['Laser Treatment', 'Chemical Peel', 'Microneedling']
  };

  const selected = [];
  const perCategory = {};

  // Select up to 2 per category, prioritize by ranking
  for (const [category, rankedNames] of Object.entries(popularByCategory)) {
    perCategory[category] = 0;
    
    for (const name of rankedNames) {
      if (selected.length >= 5) break;
      if (perCategory[category] >= 2) break;
      
      const proc = procedures.find(p => 
        p.category === category && p.procedureName === name
      );
      
      if (proc) {
        selected.push(proc);
        perCategory[category]++;
      }
    }
  }

  // Fill remaining slots with any procedures
  if (selected.length < 5) {
    const selectedIds = new Set(selected.map(p => p.procedureId));
    for (const proc of procedures) {
      if (selected.length >= 5) break;
      if (!selectedIds.has(proc.procedureId)) {
        selected.push(proc);
      }
    }
  }

  return selected;
}
```

### 3.4 Client-Side Filtering
Apply filters after search results are generated:

```javascript
function applyFilters(clinics, filters) {
  return clinics.filter(clinic => {
    // Category filter (on clinic procedures)
    if (filters.category) {
      const hasCategory = clinic.procedures.some(p => 
        p.category.toLowerCase() === filters.category.toLowerCase()
      );
      if (!hasCategory) return false;
    }

    // Price range filter (any procedure in range)
    if (filters.minPrice) {
      const hasInRange = clinic.procedures.some(p => p.price >= parseFloat(filters.minPrice));
      if (!hasInRange) return false;
    }

    if (filters.maxPrice) {
      const hasInRange = clinic.procedures.some(p => p.price <= parseFloat(filters.maxPrice));
      if (!hasInRange) return false;
    }

    // Location filter
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      const matchesLocation = 
        clinic.city?.toLowerCase().includes(loc) ||
        clinic.state?.toLowerCase().includes(loc);
      if (!matchesLocation) return false;
    }

    return true;
  });
}
```

### 3.5 Client-Side Pagination
```javascript
const CLINICS_PER_PAGE = 9;

function paginateResults(clinics, page) {
  const startIndex = (page - 1) * CLINICS_PER_PAGE;
  const endIndex = startIndex + CLINICS_PER_PAGE;
  
  return {
    results: clinics.slice(startIndex, endIndex),
    totalPages: Math.ceil(clinics.length / CLINICS_PER_PAGE),
    currentPage: page,
    totalResults: clinics.length
  };
}
```

---

## Section 4: Search Strategy Recommendations

### 4.1 Lunr.js Field Boosting
Recommended boost values for optimal search relevance:

| Field | Boost | Rationale |
|-------|-------|-----------|
| `state` | 9 | Highest priority for location searches |
| `city` | 9 | Highest priority for location searches |
| `clinicName` | 8 | Very important for direct clinic searches |
| `procedureNames` | 7 | High priority for procedure searches |
| `procedureCategories` | 7 | High priority for category searches |
| `clinicCategory` | 5 | Moderate importance |
| `address` | 3 | Lower priority, used for specific address searches |

### 4.2 Fuzzy Matching Strategy
Use a multi-tier fallback approach similar to the current implementation:

1. **Exact match**: Direct search for user's query
2. **Fuzzy match (~1 edit distance)**: `query~1`
3. **Wildcard match**: `query*`
4. **Suffix removal**: Try removing 1-3 characters
5. **Individual terms**: Split multi-word queries
6. **Fallback**: Simple `.includes()` search

### 4.3 Handling Procedure Arrays in Search
The recommended approach is to concatenate all procedure names into a single searchable string:

```javascript
const procedureNames = clinic.procedures.map(p => p.procedureName).join(' ');
```

This allows Lunr.js to match any procedure name within the clinic's offerings.

---

## Section 5: Migration Guide

### 5.1 Breaking Changes

#### Old Endpoint (Procedure-Centric)
```
GET /api/procedures/search-index
```

**Returned:** Array of procedures (each with clinic info)
```json
[
  {
    "ProcedureID": 1,
    "ClinicID": 101,
    "ProcedureName": "Breast Augmentation",
    "AverageCost": 6500,
    "ClinicName": "Chicago Cosmetic Surgery",
    "City": "Chicago",
    "State": "IL",
    ...
  }
]
```

#### New Endpoint (Clinic-Centric)
```
GET /api/clinics/search-index
```

**Returns:** Object with clinics array and metadata
```json
{
  "clinics": [
    {
      "clinicId": 101,
      "clinicName": "Chicago Cosmetic Surgery",
      "city": "Chicago",
      "state": "IL",
      "procedures": [
        {
          "procedureId": 1,
          "procedureName": "Breast Augmentation",
          "price": 6500,
          ...
        }
      ]
    }
  ],
  "meta": { ... }
}
```

### 5.2 Field Name Mappings

| Old Field (Procedure) | New Field (Clinic) | Notes |
|-----------------------|--------------------|-------|
| `ClinicID` | `clinicId` | Now at top level |
| `ClinicName` | `clinicName` | Now at top level |
| `City` | `city` | Now at top level |
| `State` | `state` | Now at top level |
| `ProcedureID` | `procedures[].procedureId` | Now nested |
| `ProcedureName` | `procedures[].procedureName` | Now nested |
| `AverageCost` | `procedures[].price` | Renamed field |
| `Category` | `procedures[].category` | Now nested |
| N/A | `rating` | New field (Google rating) |
| N/A | `reviewCount` | New field (Google reviews) |
| N/A | `clinicCategory` | New field (clinic type) |
| N/A | `photoURL` | New field (Google Places photo) |

### 5.3 Code Migration Example

#### Before (Procedure-Centric)
```javascript
const response = await fetch('/api/procedures/search-index');
const procedures = await response.json();

// Build index from procedures
const idx = lunr(function() {
  this.ref('ProcedureID');
  this.field('ProcedureName', { boost: 7 });
  this.field('City', { boost: 8 });
  // ...
  procedures.forEach(proc => this.add(proc));
});

// Display results (multiple procedures per clinic)
results.forEach(proc => {
  console.log(`${proc.ProcedureName} at ${proc.ClinicName}`);
});
```

#### After (Clinic-Centric)
```javascript
const response = await fetch('/api/clinics/search-index');
const { clinics } = await response.json();

// Build index from clinics
const idx = lunr(function() {
  this.ref('clinicId');
  this.field('clinicName', { boost: 8 });
  this.field('city', { boost: 9 });
  this.field('procedureNames', { boost: 7 }); // Concatenated
  // ...
  
  clinics.forEach(clinic => {
    this.add({
      clinicId: clinic.clinicId.toString(),
      clinicName: clinic.clinicName,
      city: clinic.city,
      procedureNames: clinic.procedures.map(p => p.procedureName).join(' ')
    });
  });
});

// Display results (one card per clinic with multiple procedures)
results.forEach(clinic => {
  console.log(`${clinic.clinicName} - ${clinic.procedures.length} procedures`);
  
  // Show relevant procedures (up to 5)
  const displayProcs = getDisplayProcedures(clinic, searchQuery);
  displayProcs.forEach(proc => {
    console.log(`  - ${proc.procedureName} ($${proc.price})`);
  });
});
```

---

## Section 6: Performance Considerations

### 6.1 Initial Load Performance
- **First load:** ~2 seconds to fetch and build index
- **Subsequent loads:** Instant if cached
- **Memory usage:** ~5-10MB for 150 clinics with index

### 6.2 Caching Strategy
```javascript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getClinicsWithCache() {
  const cached = localStorage.getItem('clinicsCache');
  
  if (cached) {
    const { clinics, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age < CACHE_DURATION) {
      return clinics;
    }
  }

  // Fetch fresh data
  const response = await fetch('/api/clinics/search-index');
  const { clinics } = await response.json();
  
  localStorage.setItem('clinicsCache', JSON.stringify({
    clinics,
    timestamp: Date.now()
  }));
  
  return clinics;
}
```

### 6.3 Search Performance
- **Index build time:** ~200-500ms for 150 clinics
- **Search time:** ~5-20ms per query
- **Filter time:** ~1-5ms
- **Pagination:** Instant (array slicing)

### 6.4 When to Move to Server-Side Search
Consider moving search to the backend if:
- Clinic count exceeds 1,000
- Response size exceeds 5MB
- Initial load time exceeds 5 seconds
- Mobile performance suffers

At that point, implement:
- Server-side full-text search (SQL Server Full-Text Search)
- Server-side pagination
- Server-side filtering
- Incremental loading strategies

---

## Section 7: UI/UX Recommendations

### 7.1 Search Result Card
Each clinic card should display:
- **Clinic name** (large, prominent)
- **Rating & review count** (⭐ 4.8 • 245 reviews)
- **Location** (City, State)
- **Clinic category** (badge: "Plastic Surgery", "Medical Spa")
- **Procedures** (up to 5, with prices)
  - Show matched procedures first
  - Then related procedures from same category
  - Or popular procedures if location search

### 7.2 Loading States
```javascript
// Show loading indicator during initial fetch
<LoadingSpinner text="Loading clinics..." />

// Show skeleton cards while building index
<SkeletonCard count={9} />

// Search results load instantly (already in memory)
```

### 7.3 Empty States
```javascript
// No results found
if (searchResults.length === 0) {
  return (
    <EmptyState
      title="No clinics found"
      message="Try adjusting your search or filters"
      action="Clear Filters"
    />
  );
}
```

---

## Section 8: Testing Checklist

### Functional Tests
- [ ] Fetch clinics on page load
- [ ] Build search index successfully
- [ ] Search by procedure name returns relevant clinics
- [ ] Search by city/state returns local clinics
- [ ] Search by clinic name returns specific clinic
- [ ] Filters work (category, price range, location)
- [ ] Pagination displays 9 clinics per page
- [ ] Display correct procedures based on search context
- [ ] Handle null/missing data gracefully

### Performance Tests
- [ ] Initial load completes in < 3 seconds
- [ ] Search responds in < 50ms
- [ ] Pagination is instant
- [ ] Cache prevents redundant API calls
- [ ] Memory usage is acceptable (< 20MB)

### Edge Cases
- [ ] Clinics with no procedures (should not appear)
- [ ] Clinics with missing location data
- [ ] Clinics with 0 rating/reviews
- [ ] Procedures with price = 0
- [ ] Very long clinic/procedure names
- [ ] Special characters in search queries

---

## Section 9: API Examples

### Example 1: Fetch All Clinics
```bash
curl http://localhost:3001/api/clinics/search-index
```

### Example 2: Check Response Size
```bash
curl -w "\nSize: %{size_download} bytes\n" \
  http://localhost:3001/api/clinics/search-index \
  -o /dev/null -s
```

### Example 3: Measure Response Time
```javascript
const start = performance.now();
const response = await fetch('http://localhost:3001/api/clinics/search-index');
const data = await response.json();
const end = performance.now();

console.log(`Fetch time: ${end - start}ms`);
console.log(`Clinics: ${data.clinics.length}`);
console.log(`Total procedures: ${data.clinics.reduce((sum, c) => sum + c.procedures.length, 0)}`);
```

---

## Section 10: Support & Questions

### Common Questions

**Q: Why return all procedures if we only display 5?**  
A: Frontend needs all procedures for filtering (e.g., price range filter) and to select the most relevant ones based on search context.

**Q: Should we deduplicate procedure names?**  
A: Yes, the backend already deduplicates procedures by `ProcedureID`. If a clinic has the same procedure from multiple providers, it appears once.

**Q: How do we handle clinics with 50+ procedures?**  
A: Return all procedures in the response. Frontend will intelligently select which 5 to display based on search query.

**Q: What if a clinic has no procedures after filtering out "Please Request Consult" providers?**  
A: That clinic will not appear in the response.

**Q: Can we filter procedures server-side?**  
A: Not in this version. Keep implementation simple and client-side. If performance becomes an issue, we can add server-side filtering later.

---

**Document Version:** 1.0  
**Last Updated:** October 23, 2025  
**Next Review:** When clinic count exceeds 500 or performance degrades

