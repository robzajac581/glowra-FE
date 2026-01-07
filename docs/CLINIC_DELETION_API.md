# Clinic Deletion API Documentation

This document describes the API endpoints for deleting, restoring, and managing deleted clinics in the admin dashboard.

## Overview

The clinic deletion system provides:
1. **Soft Delete** - Moves clinics to a deleted state (preserves data for 30 days)
2. **Restore** - Restore previously deleted clinics
3. **List Deleted** - View all deleted clinics with pagination and search

All endpoints require admin authentication via Bearer token.

---

## Authentication

All endpoints require the `Authorization` header:

```
Authorization: Bearer <admin_jwt_token>
```

---

## 1. Delete Clinic

Soft delete a clinic by moving it to the deleted clinics table. The clinic will be automatically permanently deleted after 30 days.

### Endpoint

```
DELETE /admin/clinics/:clinicId
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clinicId` | integer | Yes | The ID of the clinic to delete |

### Response

**Success (200 OK)**

```json
{
  "success": true,
  "deletedClinicId": 123,
  "deletedAt": "2025-01-15T10:30:00.000Z",
  "clinicName": "Miami Aesthetics Clinic"
}
```

**Error Responses**

```json
// Clinic not found (404)
{
  "success": false,
  "error": "Clinic not found"
}

// Invalid clinic ID (400)
{
  "success": false,
  "error": "Invalid clinic ID"
}

// Server error (500)
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

### Example Request

```javascript
const response = await fetch('/admin/clinics/42', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log(`Clinic "${result.clinicName}" deleted successfully`);
  console.log(`Deleted clinic ID: ${result.deletedClinicId}`);
  console.log(`Deleted at: ${result.deletedAt}`);
}
```

### Notes

- Deletion is atomic - either all related data (clinic, Google Places data, photos) is moved or nothing is deleted
- The clinic will no longer appear in regular clinic listings
- Related data (Google Places data, photos) is preserved in deleted tables
- The clinic can be restored within 30 days
- After 30 days, the clinic is permanently deleted by a scheduled job

---

## 2. Restore Clinic

Restore a previously deleted clinic back to the active clinics table.

### Endpoint

```
POST /admin/clinics/deleted/:deletedClinicId/restore
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deletedClinicId` | integer | Yes | The ID of the deleted clinic (from DeletedClinics table) |

### Response

**Success (200 OK)**

```json
{
  "success": true,
  "clinicId": 42,
  "clinicName": "Miami Aesthetics Clinic",
  "restoredAt": "2025-01-20T14:15:00.000Z"
}
```

**Error Responses**

```json
// Deleted clinic not found (404)
{
  "success": false,
  "error": "Deleted clinic not found"
}

// Invalid deleted clinic ID (400)
{
  "success": false,
  "error": "Invalid deleted clinic ID"
}

// Server error (500)
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

### Example Request

```javascript
const response = await fetch('/admin/clinics/deleted/123/restore', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log(`Clinic "${result.clinicName}" restored successfully`);
  console.log(`New clinic ID: ${result.clinicId}`);
  console.log(`Restored at: ${result.restoredAt}`);
}
```

### Notes

- Restoration is atomic - either all data is restored or nothing is restored
- If the original ClinicID is available, it will be reused; otherwise a new ID is assigned
- All related data (Google Places data, photos) is restored along with the clinic
- The clinic is removed from the deleted clinics table after successful restoration
- The clinic will immediately appear in regular clinic listings

---

## 3. List Deleted Clinics

Get a paginated list of deleted clinics with optional search functionality.

### Endpoint

```
GET /admin/clinics/deleted
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-based) |
| `limit` | integer | No | 20 | Results per page (max 100) |
| `search` | string | No | - | Search term (searches clinic name, address, deleted by) |

### Response

**Success (200 OK)**

```json
{
  "success": true,
  "clinics": [
    {
      "id": 123,
      "originalClinicId": 42,
      "clinicName": "Miami Aesthetics Clinic",
      "address": "123 Collins Ave, Miami Beach, FL 33139",
      "phone": "(305) 555-1234",
      "website": "https://miamiaesthetics.com",
      "rating": 4.5,
      "reviewCount": 127,
      "deletedAt": "2025-01-15T10:30:00.000Z",
      "deletedBy": "admin@example.com"
    },
    {
      "id": 124,
      "originalClinicId": 43,
      "clinicName": "Beauty Solutions",
      "address": "456 Ocean Dr, Miami, FL 33140",
      "phone": "(305) 555-5678",
      "website": "https://beautysolutions.com",
      "rating": 4.8,
      "reviewCount": 89,
      "deletedAt": "2025-01-14T08:15:00.000Z",
      "deletedBy": "admin@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### Response Schema

#### Deleted Clinic Object

```typescript
interface DeletedClinic {
  id: number;                    // DeletedClinicID (from DeletedClinics table)
  originalClinicId: number;      // Original ClinicID before deletion
  clinicName: string;            // Clinic name
  address: string;               // Full address
  phone: string | null;          // Phone number
  website: string | null;        // Website URL
  rating: number | null;         // Google rating (1-5)
  reviewCount: number | null;   // Number of Google reviews
  deletedAt: string;             // ISO 8601 timestamp when deleted
  deletedBy: string | null;      // Email of admin who deleted
}
```

#### Pagination Object

```typescript
interface Pagination {
  page: number;        // Current page number (1-based)
  limit: number;       // Results per page
  total: number;       // Total number of deleted clinics
  totalPages: number;  // Total number of pages
}
```

### Example Request

```javascript
// Get first page of deleted clinics
const response = await fetch('/admin/clinics/deleted?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const result = await response.json();
if (result.success) {
  console.log(`Found ${result.pagination.total} deleted clinics`);
  result.clinics.forEach(clinic => {
    console.log(`${clinic.clinicName} - Deleted ${clinic.deletedAt}`);
  });
}

// Search deleted clinics
const searchResponse = await fetch('/admin/clinics/deleted?search=Miami&page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const searchResult = await searchResponse.json();
```

### Notes

- Results are ordered by `deletedAt` descending (most recently deleted first)
- Search searches across clinic name, address, and deleted by email
- Maximum `limit` is 100 per page
- Clinics older than 30 days are automatically permanently deleted by a scheduled job

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found (clinic or deleted clinic not found) |
| 500 | Internal Server Error |

---

## Data Flow

### Deletion Flow

```
1. Admin calls DELETE /admin/clinics/:clinicId
2. Backend copies clinic data to DeletedClinics table
3. Backend copies GooglePlacesData to DeletedGooglePlacesData table
4. Backend copies ClinicPhotos to DeletedClinicPhotos table
5. Backend handles foreign key constraints (sets ClinicDrafts.DuplicateClinicID to NULL)
6. Backend deletes from original tables
7. Clinic no longer appears in regular listings
```

### Restoration Flow

```
1. Admin calls POST /admin/clinics/deleted/:id/restore
2. Backend retrieves data from Deleted* tables
3. Backend checks if original ClinicID is available
4. Backend restores clinic to Clinics table (reusing original ID if available)
5. Backend restores GooglePlacesData to GooglePlacesData table
6. Backend restores ClinicPhotos to ClinicPhotos table
7. Backend deletes from Deleted* tables
8. Clinic immediately appears in regular listings
```

### Automatic Cleanup Flow

```
1. Scheduled job runs daily at 3 AM
2. Finds clinics where DeletedAt < 30 days ago
3. Permanently deletes from DeletedClinics table
4. Cascade deletes related records from DeletedGooglePlacesData and DeletedClinicPhotos
5. Clinics cannot be restored after permanent deletion
```

---

## Frontend Integration Examples

### Delete Button Handler

```javascript
async function handleDeleteClinic(clinicId, clinicName) {
  if (!confirm(`Are you sure you want to delete "${clinicName}"? This can be undone within 30 days.`)) {
    return;
  }

  try {
    const response = await fetch(`/admin/clinics/${clinicId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Show success message
      showNotification(`Clinic "${clinicName}" deleted successfully`);
      // Refresh clinic list
      loadClinics();
    } else {
      // Show error message
      showError(result.error || 'Failed to delete clinic');
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  }
}
```

### Restore Button Handler

```javascript
async function handleRestoreClinic(deletedClinicId, clinicName) {
  if (!confirm(`Restore "${clinicName}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/admin/clinics/deleted/${deletedClinicId}/restore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      showNotification(`Clinic "${clinicName}" restored successfully`);
      // Refresh deleted clinics list
      loadDeletedClinics();
      // Optionally refresh regular clinic list
      loadClinics();
    } else {
      showError(result.error || 'Failed to restore clinic');
    }
  } catch (error) {
    showError('Network error: ' + error.message);
  }
}
```

### Deleted Clinics List Component

```javascript
async function loadDeletedClinics(page = 1, searchTerm = '') {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20'
  });
  
  if (searchTerm) {
    params.append('search', searchTerm);
  }

  try {
    const response = await fetch(`/admin/clinics/deleted?${params}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Render deleted clinics list
      renderDeletedClinics(result.clinics);
      // Render pagination
      renderPagination(result.pagination);
    }
  } catch (error) {
    showError('Failed to load deleted clinics');
  }
}

function renderDeletedClinics(clinics) {
  return clinics.map(clinic => ({
    id: clinic.id,
    name: clinic.clinicName,
    address: clinic.address,
    deletedAt: new Date(clinic.deletedAt).toLocaleDateString(),
    deletedBy: clinic.deletedBy,
    daysUntilPermanentDeletion: Math.max(0, 30 - Math.floor((Date.now() - new Date(clinic.deletedAt)) / (1000 * 60 * 60 * 24))),
    onRestore: () => handleRestoreClinic(clinic.id, clinic.clinicName)
  }));
}
```

---

## Important Notes

1. **30-Day Retention**: Deleted clinics are automatically permanently deleted after 30 days. Warn users about this in the UI.

2. **Restoration Window**: Clinics can only be restored within 30 days of deletion. After that, they are permanently deleted.

3. **ID Changes**: When restoring, if the original ClinicID is still available, it will be reused. Otherwise, a new ID is assigned. The `originalClinicId` field in deleted clinics shows the original ID.

4. **Related Data**: All related data (Google Places data, photos) is preserved during deletion and restored during restoration.

5. **Search Functionality**: The search parameter searches across clinic name, address, and the email of the admin who deleted it.

6. **Pagination**: Use pagination for large lists of deleted clinics. Maximum 100 results per page.

7. **Error Handling**: Always handle 401 (unauthorized) errors by redirecting to login or refreshing the token.

