# Backend API Standardization Changes

**Date:** January 3, 2026  
**Last Updated:** January 3, 2026  
**Related to:** Admin Dashboard Refactoring - Draft Review & Edit Flow

## Summary

The backend API has been fully standardized to address the frontend's data consistency issues. **All endpoints** now return consistent **camelCase** field names, eliminating the need for dual-casing guards like `getField(obj, 'PascalCase', 'camelCase')`.

---

## Key Changes

### 1. All Draft Responses Are Now camelCase

**Before:**
```json
{
  "DraftID": 123,
  "ClinicName": "Example Clinic",
  "PlaceID": "abc123",
  "providers": [
    { "DraftProviderID": 1, "ProviderName": "Dr. Smith", "PhotoURL": "..." }
  ]
}
```

**After:**
```json
{
  "draftId": 123,
  "clinicName": "Example Clinic",
  "placeId": "abc123",
  "providers": [
    { "draftProviderId": 1, "providerName": "Dr. Smith", "photoUrl": "..." }
  ]
}
```

### 2. Provider Photo Field Standardized to `photoUrl`

All variations (`PhotoURL`, `PhotoUrl`, `photoURL`) are now normalized to `photoUrl`:

```json
{
  "providerId": 1,
  "providerName": "Dr. Smith",
  "photoUrl": "https://api.example.com/provider-photos/1",
  "hasPhoto": true
}
```

### 3. Draft Endpoint Now Includes Full Existing Clinic Data

`GET /api/admin/drafts/:draftId` now returns complete `existingClinic` data when applicable:

```json
{
  "success": true,
  "draft": { ... },
  "existingClinic": {
    "clinicId": 123,
    "clinicName": "Example Clinic",
    "address": "123 Main St",
    "city": "Miami",
    "state": "FL",
    "phone": "(305) 555-1234",
    "website": "https://example.com",
    "googleRating": 4.8,
    "googleReviewCount": 150,
    "latitude": 25.7617,
    "longitude": -80.1918,
    "placeId": "ChIJ...",
    "category": "Med Spa / Aesthetics",
    "providers": [
      {
        "providerId": 1,
        "providerName": "Dr. Smith",
        "photoUrl": "https://api.example.com/api/provider-photos/1",
        "hasPhoto": true
      }
    ],
    "procedures": [
      {
        "procedureId": 101,
        "procedureName": "Botox",
        "averageCost": 450,
        "category": "Injectables",
        "categoryId": 5
      }
    ]
  }
}
```

### 4. Clinic Detail Endpoint Now Returns camelCase + Optional Includes

`GET /api/clinics/:clinicId` now returns all fields in camelCase:

```json
{
  "clinicId": 123,
  "clinicName": "Example Clinic",
  "address": "123 Main St",
  "phone": "(305) 555-1234",
  "website": "https://example.com",
  "latitude": 25.7617,
  "longitude": -80.1918,
  "placeId": "ChIJ...",
  "city": "Miami",
  "state": "FL",
  "zipCode": "33139",
  "googleRating": 4.8,
  "googleReviewCount": 150,
  "rating": 4.8,
  "reviewCount": 150,
  "reviews": [...],
  "photo": "https://...",
  "logo": "https://...",
  "description": "...",
  "workingHours": {...},
  "category": "Med Spa / Aesthetics",
  "facebook": "https://...",
  "instagram": "https://...",
  "googleProfileLink": "https://...",
  "bookingAppointmentLink": "https://..."
}
```

**New Feature: `?include=` parameter**

Reduce API calls by including related data:

```
GET /api/clinics/:clinicId?include=providers
GET /api/clinics/:clinicId?include=procedures
GET /api/clinics/:clinicId?include=providers,procedures
```

With `?include=providers,procedures`:

```json
{
  "clinicId": 123,
  "clinicName": "Example Clinic",
  // ... all clinic fields ...
  
  "providers": [
    {
      "providerId": 1,
      "providerName": "Dr. Smith",
      "photoUrl": "https://api.example.com/api/provider-photos/1",
      "hasPhoto": true
    }
  ],
  
  "procedures": [
    {
      "procedureId": 101,
      "procedureName": "Botox",
      "price": 450,
      "averageCost": 450,
      "category": "Injectables",
      "categoryId": 5
    }
  ]
}
```

### 5. Providers Endpoint Now Returns camelCase

`GET /api/clinics/:clinicId/providers` now returns camelCase:

```json
{
  "providers": [
    {
      "providerId": 1,
      "providerName": "Dr. Smith",
      "photoUrl": "https://api.example.com/api/provider-photos/1",
      "hasPhoto": true
    }
  ],
  "requiresConsultRequest": false,
  "message": null
}
```

### 6. Procedures Endpoint Now Supports Flat Format

`GET /api/clinics/:clinicId/procedures?flat=true`

**Grouped (default):**
```json
{
  "Face": {
    "categoryId": 1,
    "procedures": [
      { "id": 101, "name": "Facelift", "price": 8500 }
    ]
  },
  "Injectables": {
    "categoryId": 5,
    "procedures": [
      { "id": 102, "name": "Botox", "price": 450 }
    ]
  }
}
```

**Flat (`?flat=true`):**
```json
[
  {
    "procedureId": 101,
    "procedureName": "Facelift",
    "price": 8500,
    "averageCost": 8500,
    "category": "Face",
    "categoryId": 1
  },
  {
    "procedureId": 102,
    "procedureName": "Botox",
    "price": 450,
    "averageCost": 450,
    "category": "Injectables",
    "categoryId": 5
  }
]
```

---

## Frontend Migration Guide

### 1. Remove Dual-Casing Guards

**Before:**
```javascript
const getField = (draft, pascalKey, camelKey) => {
  return draft[pascalKey] ?? draft[camelKey] ?? null;
};

const clinicName = getField(draft, 'ClinicName', 'clinicName') || '';
```

**After:**
```javascript
const clinicName = draft.clinicName || '';
```

### 2. Update Photo URL Access

**Before:**
```javascript
const photoUrl = getField(provider, 'PhotoURL', 'photoUrl') ||
                 getField(provider, 'PhotoUrl', 'photoUrl') ||
                 provider.photoURL;
```

**After:**
```javascript
const photoUrl = provider.photoUrl;
```

### 3. Use Flat Procedures for Edit Mode

When you need a flat array for editing (e.g., in `ProceduresTab`):

```javascript
// Option 1: Request flat format from API
const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}/procedures?flat=true`);
const flatProcedures = await response.json();

// Option 2: Use the existingClinic.procedures from draft endpoint
// (already includes category field)
const flatProcedures = existingClinic.procedures;
```

### 4. Remove Local Transformation Functions

You can now remove or simplify these functions:
- `clinicToDraftFormat()` in ReviewPage.jsx (if only used for casing conversion)
- `flattenExistingProcedures()` (use `?flat=true` instead)
- `getField()` helper (no longer needed)

### 5. Update Field References

| Old (PascalCase) | New (camelCase) |
|------------------|-----------------|
| `draft.DraftID` | `draft.draftId` |
| `draft.ClinicName` | `draft.clinicName` |
| `draft.PlaceID` | `draft.placeId` |
| `draft.DuplicateClinicID` | `draft.duplicateClinicId` |
| `draft.SubmissionFlow` | `draft.submissionFlow` |
| `provider.ProviderName` | `provider.providerName` |
| `provider.PhotoURL` | `provider.photoUrl` |
| `procedure.ProcedureName` | `procedure.procedureName` |
| `procedure.AverageCost` | `procedure.averageCost` |
| `procedure.PriceMin` | `procedure.priceMin` |
| `procedure.PriceMax` | `procedure.priceMax` |
| `photo.PhotoURL` | `photo.photoUrl` |
| `photo.Source` | `photo.source` |
| `photo.IsPrimary` | `photo.isPrimary` |
| `photo.DisplayOrder` | `photo.displayOrder` |

---

## Recommended Architecture Simplifications

### 1. Single Normalization Layer

Since the backend now returns consistent camelCase, you can remove the frontend normalization layer or simplify it to a pass-through:

```javascript
// src/utils/normalizeClinicData.js
export const normalizeApiResponse = (data) => {
  // Backend now handles normalization
  // This function can be simplified or removed
  return data;
};
```

### 2. Immutable Draft State

With consistent data from the backend, you can simplify state management:

```javascript
// ReviewPage.jsx
const [draft, setDraft] = useState(null);

// No need for separate localDraft in EditTabs
// Pass draft directly and update via onDraftUpdate
```

### 3. Centralized Procedure Helpers

If you still need local transformations:

```javascript
// src/utils/procedureHelpers.js
export const flattenProcedures = (groupedProcedures) => {
  const flat = [];
  for (const [category, data] of Object.entries(groupedProcedures)) {
    for (const proc of data.procedures) {
      flat.push({ ...proc, category });
    }
  }
  return flat;
};

export const groupProcedures = (flatProcedures) => {
  return flatProcedures.reduce((acc, proc) => {
    const category = proc.category || 'Other';
    if (!acc[category]) {
      acc[category] = { procedures: [] };
    }
    acc[category].procedures.push(proc);
    return acc;
  }, {});
};
```

---

## Request Body Format

All endpoints continue to accept **camelCase** in request bodies:

```javascript
// Creating/updating a draft
await fetch(`${API_BASE_URL}/api/admin/drafts/${draftId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clinicName: 'New Clinic Name',
    address: '123 Main St',
    providers: [
      { providerName: 'Dr. Smith', photoUrl: 'https://...' }
    ],
    procedures: [
      { procedureName: 'Botox', category: 'Injectables', priceMin: 10, priceMax: 15 }
    ]
  })
});
```

---

## Affected Endpoints

| Endpoint | Changes |
|----------|---------|
| `GET /api/admin/drafts` | Returns camelCase draft list |
| `GET /api/admin/drafts/:draftId` | Returns camelCase draft + full existingClinic with providers/procedures |
| `PUT /api/admin/drafts/:draftId` | No change (already accepts camelCase) |
| `GET /api/admin/clinics` | Already returns camelCase |
| `GET /api/clinics/:clinicId` | **Now returns camelCase** + new `?include=providers,procedures` option |
| `GET /api/clinics/:clinicId/providers` | **Now returns camelCase** (`providerId`, `providerName`, `photoUrl`) |
| `GET /api/clinics/:clinicId/procedures` | New `?flat=true` query param |
| `GET /api/clinics/:clinicId/photos` | Already returns camelCase |

---

## Testing Checklist

- [ ] Draft list loads correctly with camelCase fields
- [ ] Draft detail view shows normalized camelCase data
- [ ] Existing clinic data populates with providers and procedures
- [ ] Edit mode works with camelCase field names
- [ ] Preview mode renders correctly from camelCase data
- [ ] Procedures display correctly in both grouped and flat formats
- [ ] Provider photos load using `photoUrl` field
- [ ] Draft updates save correctly with camelCase request body

---

## Questions?

If you encounter any issues with the API response format or need additional fields, please reach out to the backend team.

