# Draft Save Field Validation - Backend API Requirements

**Date:** January 5, 2026  
**Status:** Active Investigation  
**Related to:** Admin Dashboard Draft Review & Edit Flow

## Summary

The frontend is experiencing issues where certain draft fields are not being persisted when saving via `PUT /api/admin/drafts/:draftId`. This document outlines the complete draft schema, identifies fields that are not being saved properly, and provides recommendations for backend fixes.

---

## Problem Statement

When saving draft data, some fields (notably `googleRating` and `googleReviewCount`) are being sent to the backend but are not being persisted or returned in the response. The frontend has implemented debugging utilities to identify all fields with this issue.

**Current Known Issues:**
- `googleRating` - Sent but not persisted
- `googleReviewCount` - Sent but not persisted

**Investigation Method:**
The frontend now includes comprehensive field validation logging that compares sent vs received data. All discrepancies are logged to the browser console for analysis.

---

## Complete Draft Schema Reference

### Basic Information Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clinicName` | string | Yes | Name of the clinic |
| `address` | string | Yes | Street address |
| `city` | string | Yes | City name |
| `state` | string | Yes | State name |
| `zipCode` | string \| null | No | ZIP/postal code |
| `category` | string | Yes | Clinic category (e.g., "Medspa / Aesthetics") |
| `website` | string \| null | No | Clinic website URL |
| `phone` | string \| null | No | Phone number |
| `email` | string \| null | No | Email address |
| `description` | string \| null | No | Clinic description |

### Location Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | number \| null | No | Geographic latitude |
| `longitude` | number \| null | No | Geographic longitude |
| `placeId` | string \| null | No | Google Places API Place ID |

### Google Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `googleRating` | number \| null | No | Google rating (0-5) |
| `googleReviewCount` | number \| null | No | Number of Google reviews |
| `googleReviewsJSON` | string \| null | No | JSON string of review data |
| `reviewsLink` | string \| null | No | Link to Google reviews page |

### Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | Draft status: 'pending_review', 'approved', 'rejected', 'merged' |
| `source` | string | Yes | Source: 'wizard', 'bulk_import', 'manual' |
| `submissionFlow` | string | Yes | Flow type: 'new_clinic', 'add_to_existing' |
| `duplicateClinicId` | number \| null | No | ID of duplicate clinic (if applicable) |
| `notes` | string \| null | No | Admin notes |

### Related Data Arrays

#### Providers Array

```typescript
interface DraftProvider {
  draftProviderId: number | string;  // Can be temp ID like "provider-0"
  providerName: string;
  photoUrl: string | null;
  photoData?: string | null;  // Base64 for newly uploaded photos
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}
```

#### Procedures Array

```typescript
interface DraftProcedure {
  draftProcedureId: number | string;  // Can be temp ID like "procedure-0"
  procedureName: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  priceUnit: string;
  averagePrice: number | null;
  providerNames: string[];
}
```

#### Photos Array

```typescript
interface DraftPhoto {
  draftPhotoId: number | string;  // Can be temp ID like "photo-0"
  photoUrl: string;
  photoData?: string | null;  // Base64 for newly uploaded photos
  source: 'user' | 'google';
  isPrimary: boolean;
  photoType?: 'clinic' | 'provider' | 'procedure' | 'gallery' | 'logo' | 'icon';
  width?: number;
  height?: number;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  selected?: boolean;  // For Google photos selection
}
```

---

## API Endpoint Requirements

### PUT /api/admin/drafts/:draftId

**Purpose:** Update an existing draft with new or modified field values.

**Request Body:**
The endpoint should accept a partial draft object with any combination of the fields listed above. Fields not included in the request should remain unchanged.

**Expected Behavior:**
1. Accept all fields listed in the schema above
2. Persist all provided fields to the database
3. Return the complete updated draft object in the response
4. Return all fields that were sent, confirming they were saved

**Response Format:**
```json
{
  "success": true,
  "draft": {
    "draftId": 29,
    "clinicName": "Wicker Park Med Spa",
    "address": "1755 W North Ave suite 103",
    "city": "Chicago",
    "state": "Illinois",
    "zipCode": "60622",
    "category": "Medspa / Aesthetics",
    "googleRating": 4.9,
    "googleReviewCount": 68,
    "latitude": 41.9107,
    "longitude": -87.6778,
    "placeId": "ChIJQ8wV3-XTD4gRlquuVGkjnvw",
    // ... all other fields
  }
}
```

**Critical Requirements:**
- All fields sent in the request body MUST be persisted
- All persisted fields MUST be returned in the response
- Field values MUST match what was sent (no transformation unless documented)

---

### POST /api/admin/drafts/:draftId/fetch-google-data

**Purpose:** Fetch Google Places data and optionally save it to the draft.

**Request Body:**
```json
{
  "placeId": "ChIJQ8wV3-XTD4gRlquuVGkjnvw",
  "save": true
}
```

**Expected Behavior:**
When `save: true` is provided:
1. Fetch Google Places data using the provided `placeId`
2. Extract `rating` and `reviewCount` from the Google data
3. Save `googleRating` and `googleReviewCount` to the draft record
4. Return the fetched data AND the updated draft

**Response Format:**
```json
{
  "success": true,
  "googleData": {
    "rating": 4.9,
    "reviewCount": 68,
    "businessStatus": "OPERATIONAL",
    "openingHours": ["Monday: 9:00 AM – 7:00 PM", ...],
    "reviews": [...]
  },
  "draft": {
    "draftId": 29,
    "googleRating": 4.9,
    "googleReviewCount": 68,
    // ... other draft fields
  }
}
```

**Current Issue:**
When `save: true` is provided, the endpoint appears to fetch the data successfully but does not persist `googleRating` and `googleReviewCount` to the draft. The frontend must make a separate PUT request to save these fields.

---

## Example Request/Response

### Example 1: Saving Rating Data

**Request:**
```http
PUT /api/admin/drafts/29
Content-Type: application/json
Authorization: Bearer <token>

{
  "googleRating": 4.9,
  "googleReviewCount": 68
}
```

**Expected Response:**
```json
{
  "success": true,
  "draft": {
    "draftId": 29,
    "googleRating": 4.9,
    "googleReviewCount": 68,
    // ... all other draft fields
  }
}
```

**Current Issue:**
The response does not include `googleRating` and `googleReviewCount`, indicating they were not persisted.

---

### Example 2: Full Draft Save

**Request:**
```http
PUT /api/admin/drafts/29
Content-Type: application/json
Authorization: Bearer <token>

{
  "clinicName": "Wicker Park Med Spa",
  "address": "1755 W North Ave suite 103",
  "city": "Chicago",
  "state": "Illinois",
  "zipCode": "60622",
  "category": "Medspa / Aesthetics",
  "googleRating": 4.9,
  "googleReviewCount": 68,
  "latitude": 41.9107,
  "longitude": -87.6778,
  "placeId": "ChIJQ8wV3-XTD4gRlquuVGkjnvw"
}
```

**Expected Response:**
```json
{
  "success": true,
  "draft": {
    "draftId": 29,
    "clinicName": "Wicker Park Med Spa",
    "address": "1755 W North Ave suite 103",
    "city": "Chicago",
    "state": "Illinois",
    "zipCode": "60622",
    "category": "Medspa / Aesthetics",
    "googleRating": 4.9,
    "googleReviewCount": 68,
    "latitude": 41.9107,
    "longitude": -87.6778,
    "placeId": "ChIJQ8wV3-XTD4gRlquuVGkjnvw",
    // ... all other fields
  }
}
```

---

## Field Validation Checklist

The frontend validates the following field categories:

### Basic Info Fields
- [x] `clinicName` - Working
- [x] `address` - Working
- [x] `city` - Working
- [x] `state` - Working
- [x] `zipCode` - Working
- [x] `category` - Working
- [x] `website` - Working
- [x] `phone` - Working
- [x] `email` - Working
- [x] `description` - Working

### Location Fields
- [x] `latitude` - Working
- [x] `longitude` - Working
- [x] `placeId` - Working

### Google Data Fields
- [ ] `googleRating` - **NOT PERSISTING**
- [ ] `googleReviewCount` - **NOT PERSISTING**
- [ ] `googleReviewsJSON` - Unknown
- [ ] `reviewsLink` - Unknown

### Metadata Fields
- [x] `status` - Working (read-only)
- [x] `source` - Working (read-only)
- [x] `submissionFlow` - Working (read-only)
- [ ] `duplicateClinicId` - Unknown
- [ ] `notes` - Unknown

### Array Fields
- [x] `providers` - Working
- [x] `procedures` - Working
- [x] `photos` - Working

---

## Recommendations

### 1. Fix PUT /api/admin/drafts/:draftId Endpoint

**Issue:** The endpoint is not accepting or persisting `googleRating` and `googleReviewCount` fields.

**Recommendation:**
- Ensure the endpoint accepts all fields listed in the schema
- Verify database schema includes columns for `googleRating` and `googleReviewCount`
- Ensure the update query includes these fields
- Return all updated fields in the response

**Database Check:**
Verify the `drafts` table includes:
```sql
googleRating DECIMAL(3,1) NULL,
googleReviewCount INT NULL,
```

### 2. Fix POST /api/admin/drafts/:draftId/fetch-google-data Endpoint

**Issue:** When `save: true` is provided, the endpoint does not persist rating data.

**Recommendation:**
- When `save: true` is provided, persist `googleRating` and `googleReviewCount` to the draft
- Return the updated draft in the response
- Ensure the save operation is atomic (all or nothing)

### 3. Field Validation

**Recommendation:**
- Implement backend validation to ensure all sent fields are persisted
- Return an error if a field cannot be saved (rather than silently ignoring it)
- Log warnings for fields that are sent but not recognized

### 4. Response Consistency

**Recommendation:**
- Always return the complete draft object after updates
- Ensure all persisted fields are included in the response
- Maintain field type consistency (e.g., `null` vs `0` for numeric fields)

---

## Testing Instructions

1. **Test Rating Field Persistence:**
   ```bash
   # Send PUT request with rating data
   curl -X PUT https://api.example.com/api/admin/drafts/29 \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"googleRating": 4.9, "googleReviewCount": 68}'
   
   # Verify response includes these fields
   # Verify GET request returns these fields
   ```

2. **Test fetch-google-data with save:**
   ```bash
   # Send POST request with save=true
   curl -X POST https://api.example.com/api/admin/drafts/29/fetch-google-data \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"placeId": "ChIJ...", "save": true}'
   
   # Verify draft.googleRating and draft.googleReviewCount are set
   # Verify GET request returns these fields
   ```

3. **Test Full Draft Save:**
   ```bash
   # Send PUT request with all fields
   # Verify all fields are persisted and returned
   ```

---

## Frontend Debugging

The frontend now includes comprehensive logging that will help identify all fields with persistence issues. When saving a draft, check the browser console for:

- `🔍 Draft Save Validation: PUT /api/admin/drafts/:id` - Shows field-by-field comparison
- `📊 Draft Comparison: Fetch Google Data` - Shows before/after state changes
- `❌ X field(s) not persisted` - Lists fields that were sent but not returned
- `⚠️ X field(s) changed` - Lists fields with value mismatches

**To Use:**
1. Open browser DevTools Console
2. Perform draft save operations
3. Review validation logs
4. Document any fields showing as "not persisted"
5. Update this document with findings

---

## Next Steps

1. Backend team reviews this document
2. Backend team fixes field persistence issues
3. Frontend team tests with real data
4. Update field validation checklist with test results
5. Remove frontend workarounds once backend is fixed
6. Remove console logging after issues are resolved

---

## Related Documentation

- [Admin Review UI Specification](./ADMIN_REVIEW_UI_SPECIFICATION.md)
- [API Standardization Changes](./API_STANDARDIZATION_CHANGES.md)
- [Database Structure](../../DATABASE_STRUCTURE.md)

