# Logo & Provider Photos API Documentation

This document describes how to submit **clinic logo photos** and **provider photos** through the "List Your Clinic" wizard form submission API.

## Overview

The submission API now supports:
1. **Clinic Logo Photos** - A special photo type for clinic logos/branding
2. **Provider Photos** - Headshot photos for individual providers

Both are submitted as part of the existing `/api/clinic-management/submissions` endpoint.

---

## 1. Clinic Logo Photos

### How It Works

Clinic photos have a `photoType` field that determines how they're used:
- `"clinic"` - Regular clinic gallery photos (exterior, interior, etc.)
- `"logo"` - Clinic logo/branding image
- `"icon"` - Alternative name for logo (backwards compatible)

### Schema

```typescript
interface ClinicPhoto {
  photoType: "clinic" | "logo" | "icon";  // Use "logo" for logos
  photoData?: string;    // Base64 encoded image (data:image/jpeg;base64,...)
  photoURL?: string;     // OR external URL (one of photoData or photoURL required)
  fileName?: string;     // Original filename (optional)
  mimeType?: string;     // e.g., "image/jpeg", "image/png", "image/webp"
  isPrimary?: boolean;   // Set to true for the main display photo
  displayOrder?: number; // Order in gallery (0 = first)
  caption?: string;      // Alt text / caption (optional)
}
```

### Allowed MIME Types
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

### Max File Size
- 10MB (base64 encoded)

### Example - Adding a Logo Photo

```json
{
  "flow": "new_clinic",
  "clinic": {
    "clinicName": "Skin Solutions Miami",
    "address": "123 Collins Ave, Suite 400",
    "city": "Miami Beach",
    "state": "Florida",
    "category": "Med Spa / Aesthetics"
  },
  "photos": [
    {
      "photoType": "logo",
      "photoData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      "fileName": "skin-solutions-logo.png",
      "mimeType": "image/png",
      "isPrimary": false
    },
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
      "fileName": "clinic-exterior.jpg",
      "mimeType": "image/jpeg",
      "isPrimary": true,
      "displayOrder": 0,
      "caption": "Our beautiful clinic exterior"
    }
  ]
}
```

---

## 2. Provider Photos

### How It Works

Each provider in the `providers` array can include a photo (headshot). Provider photos are stored separately from clinic photos and are linked to the specific provider.

### Schema

```typescript
interface Provider {
  providerName: string;     // Required - Full name and credentials
  specialty?: string;       // Optional - One of the allowed specialties
  photoData?: string;       // Base64 encoded headshot image
  photoURL?: string;        // OR external URL to headshot
}
```

### Allowed Specialties
- `"Plastic Surgery"`
- `"Med Spa / Aesthetics"`
- `"Medical"`
- `"Dermatology"`
- `"Other"`

### Example - Adding Provider Photos

```json
{
  "flow": "new_clinic",
  "clinic": {
    "clinicName": "Skin Solutions Miami",
    "address": "123 Collins Ave, Suite 400",
    "city": "Miami Beach",
    "state": "Florida",
    "category": "Med Spa / Aesthetics"
  },
  "providers": [
    {
      "providerName": "Dr. Sarah Johnson, MD",
      "specialty": "Plastic Surgery",
      "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
    },
    {
      "providerName": "Dr. Michael Chen, DO",
      "specialty": "Dermatology",
      "photoURL": "https://example.com/images/dr-chen.jpg"
    }
  ]
}
```

---

## 3. Complete Submission Example

Here's a full example with logo, clinic photos, and provider photos:

```json
{
  "flow": "new_clinic",
  "submitterKey": "optional-tracking-key",
  "clinic": {
    "clinicName": "Radiant Aesthetics",
    "address": "456 Wellness Blvd, Suite 200",
    "city": "Beverly Hills",
    "state": "California",
    "zipCode": "90210",
    "category": "Med Spa / Aesthetics",
    "website": "https://radiantaesthetics.com",
    "phone": "(310) 555-1234",
    "email": "info@radiantaesthetics.com"
  },
  "photos": [
    {
      "photoType": "logo",
      "photoData": "data:image/png;base64,iVBORw0KGgo...",
      "fileName": "radiant-logo.png",
      "mimeType": "image/png"
    },
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ...",
      "fileName": "lobby.jpg",
      "mimeType": "image/jpeg",
      "isPrimary": true,
      "displayOrder": 0,
      "caption": "Our welcoming reception area"
    },
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4BBQ...",
      "fileName": "treatment-room.jpg",
      "mimeType": "image/jpeg",
      "displayOrder": 1,
      "caption": "State-of-the-art treatment room"
    }
  ],
  "providers": [
    {
      "providerName": "Dr. Emily White, MD, FACS",
      "specialty": "Plastic Surgery",
      "photoData": "data:image/jpeg;base64,/9j/4CCQ..."
    },
    {
      "providerName": "Jessica Martinez, RN, BSN",
      "specialty": "Med Spa / Aesthetics",
      "photoData": "data:image/jpeg;base64,/9j/4DDQ..."
    }
  ],
  "procedures": [
    {
      "procedureName": "Botox",
      "category": "Injectables",
      "priceMin": 12,
      "priceMax": 15,
      "unit": "/unit",
      "providerNames": ["Dr. Emily White, MD, FACS", "Jessica Martinez, RN, BSN"]
    }
  ]
}
```

---

## 4. API Details

### Endpoint
```
POST /api/clinic-management/submissions
```

### Headers
```
Content-Type: application/json
```

**Note:** This is a PUBLIC endpoint - no API key required for submissions.

### Success Response (201 Created)

```json
{
  "success": true,
  "submissionId": "GLW-2024-0042",
  "draftId": 123,
  "status": "pending_review",
  "message": "Submission received. We'll review it within 1-2 business days.",
  "duplicateWarning": null
}
```

### Validation Error Response (400 Bad Request)

```json
{
  "success": false,
  "errors": [
    {
      "field": "photos[0].photoData",
      "message": "Invalid image data. Must be base64 encoded with data URL prefix"
    }
  ]
}
```

---

## 5. Retrieving Draft with Photos

When fetching a draft (for preview/review), photos and provider photos are included:

### Endpoint
```
GET /api/clinic-management/drafts/{draftId}
```

### Response

```json
{
  "DraftID": 123,
  "ClinicName": "Radiant Aesthetics",
  "Address": "456 Wellness Blvd, Suite 200",
  "City": "Beverly Hills",
  "State": "California",
  "Status": "pending_review",
  "providers": [
    {
      "DraftProviderID": 1,
      "ProviderName": "Dr. Emily White, MD, FACS",
      "Specialty": "Plastic Surgery",
      "PhotoURL": "https://...",
      "PhotoData": null
    }
  ],
  "procedures": [...],
  "photos": [
    {
      "DraftPhotoID": 1,
      "PhotoType": "logo",
      "PhotoURL": null,
      "FileName": "radiant-logo.png",
      "MimeType": "image/png",
      "IsPrimary": false,
      "DisplayOrder": 0,
      "Caption": null
    },
    {
      "DraftPhotoID": 2,
      "PhotoType": "clinic",
      "PhotoURL": null,
      "FileName": "lobby.jpg",
      "MimeType": "image/jpeg",
      "IsPrimary": true,
      "DisplayOrder": 0,
      "Caption": "Our welcoming reception area"
    }
  ]
}
```

---

## 6. Schema Endpoint

To get all available enum values for form validation:

### Endpoint
```
GET /api/clinic-management/submissions/schema
```

### Response

```json
{
  "success": true,
  "schema": {
    "clinicCategories": ["Plastic Surgery", "Med Spa / Aesthetics", "Medical", "Dermatology", "Other"],
    "providerSpecialties": ["Plastic Surgery", "Med Spa / Aesthetics", "Medical", "Dermatology", "Other"],
    "procedureCategories": [...],
    "priceUnits": [...],
    "usStates": ["Alabama", "Alaska", ...],
    "photoTypes": ["clinic", "icon", "logo"],
    "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"]
  }
}
```

---

## 7. Frontend Implementation Tips

### Converting File to Base64

```javascript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Usage
const file = document.getElementById('logoInput').files[0];
const base64 = await fileToBase64(file);

const submission = {
  photos: [{
    photoType: 'logo',
    photoData: base64,
    fileName: file.name,
    mimeType: file.type
  }]
};
```

### Validation Before Submit

```javascript
// Validate file size (10MB max)
const MAX_SIZE = 10 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  alert('File too large. Maximum size is 10MB.');
  return;
}

// Validate file type
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!ALLOWED_TYPES.includes(file.type)) {
  alert('Invalid file type. Please use JPEG, PNG, WebP, or GIF.');
  return;
}
```

### Displaying Provider Photos in Form

```jsx
// React example
{providers.map((provider, index) => (
  <div key={index}>
    <input 
      type="text" 
      value={provider.providerName}
      onChange={(e) => updateProvider(index, 'providerName', e.target.value)}
    />
    <select
      value={provider.specialty}
      onChange={(e) => updateProvider(index, 'specialty', e.target.value)}
    >
      <option value="">Select Specialty</option>
      <option value="Plastic Surgery">Plastic Surgery</option>
      <option value="Med Spa / Aesthetics">Med Spa / Aesthetics</option>
      {/* ... */}
    </select>
    <input 
      type="file" 
      accept="image/jpeg,image/png,image/webp,image/gif"
      onChange={async (e) => {
        const base64 = await fileToBase64(e.target.files[0]);
        updateProvider(index, 'photoData', base64);
      }}
    />
    {provider.photoData && (
      <img src={provider.photoData} alt="Preview" style={{maxWidth: 100}} />
    )}
  </div>
))}
```

---

## 8. Photo Flow Summary

| Photo Type | Field Location | Use Case |
|------------|----------------|----------|
| `logo` | `photos[]` | Clinic logo/branding |
| `clinic` | `photos[]` | Gallery photos (exterior, interior, treatment rooms) |
| Provider photo | `providers[].photoData` or `providers[].photoURL` | Provider headshot |

---

## Questions?

Contact the backend team if you have any questions about the API or need additional fields.

