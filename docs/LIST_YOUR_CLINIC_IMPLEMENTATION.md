# List Your Clinic - Frontend Implementation Documentation

**Version**: 1.0  
**Date**: December 2024  
**Status**: Implemented  
**API Endpoint**: `POST /api/clinic-management/submissions`

---

## Overview

The "List Your Clinic" feature is a multi-step wizard that allows users (clinic owners, staff, or data scrapers) to submit clinic information for review before it goes live on Glowra. The wizard consists of 7 steps (0-6) with a clean, user-friendly interface.

---

## User Flows

### Flow 1: Add New Clinic
```
Step 0 → Step 1 (Clinic Info) → Step 2 (Providers) → Step 3 (Procedures) → Step 4 (Photos) → Step 5 (Review) → Step 6 (Success)
```

### Flow 2: Add to Existing Clinic
```
Step 0 → Step 1 (Search Clinic) → Step 2 (Providers) → Step 3 (Procedures) → Step 4 (Photos) → Step 5 (Review) → Step 6 (Success)
```

---

## Step-by-Step Breakdown

### Step 0: Choose Action

**Purpose**: User selects whether to add a new clinic or add information to an existing clinic.

**Fields**:
- Flow selection: `new_clinic` or `add_to_existing`
- Submitter Key (optional, collapsible): For internal tracking

**URL Parameters Supported**:
- `?clinicId=123` - Pre-fills existing clinic and skips to Step 2
- `?submitterKey=xyz` - Pre-fills submitter key field

---

### Step 1A: Search Clinic (Add to Existing Flow)

**Purpose**: Search for existing clinic in database

**API Called**: `GET /api/clinics/search?q={query}`

**Behavior**: 
- User types clinic name or address
- Results display with clinic details
- User selects clinic → proceeds to Step 2 with clinic info pre-filled
- "Don't see your clinic?" → switches to new clinic flow

---

### Step 1B: Clinic Information (New Clinic Flow)

**Purpose**: Collect basic clinic details

#### Required Fields:
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `clinicName` | string | Required, max 255 chars | Official clinic name |
| `address` | string | Required, max 500 chars | Street address |
| `city` | string | Required, max 100 chars | |
| `state` | string | Required | Must be valid US state |
| `category` | string | Required | From enum |

#### Optional Fields:
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `zipCode` | string | Optional, 5 digits | |
| `website` | string | Must start with http:// or https:// | |
| `phone` | string | Format: (XXX) XXX-XXXX or XXX-XXX-XXXX | |
| `email` | string | Valid email format | |

#### Category Enum:
- `Plastic Surgery`
- `Med Spa / Aesthetics`
- `Medical`
- `Dermatology`
- `Other`

#### Advanced Information (Collapsible, All Optional):

**Location Data**:
- `latitude` (number): -90 to 90
- `longitude` (number): -180 to 180
- `placeID` (string): Google Place ID
- `googleProfileLink` (string): Google Maps URL

**Additional Details**:
- `description` (string): Max 2000 characters

**Working Hours** (object):
- Keys: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`
- Values: Time string (e.g., "9:00AM-5:00PM") or "Closed"

---

### Step 2: Providers

**Purpose**: Add providers/practitioners at the clinic

**Structure**: Array of provider objects (optional, can skip entire step)

#### Provider Fields:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `providerName` | string | Yes (if provider exists) | Max 255 chars |
| `specialty` | string | No | From enum |
| `photoData` | string | No | Base64 image data |
| `photoURL` | string | No | External URL alternative |
| `fileName` | string | No | Original filename |
| `mimeType` | string | No | Image MIME type |
| `fileSize` | number | No | File size in bytes |

#### Specialty Enum:
- `Plastic Surgery`
- `Med Spa / Aesthetics`
- `Medical`
- `Dermatology`
- `Other`

#### Photo Upload:
- Accepts: JPEG, PNG, WebP, GIF
- Max size: 10MB
- Auto-compressed to max 2MB, 1920px max dimension
- Converted to base64 for submission

**Behavior**:
- User can add multiple providers
- Each provider can have one photo
- Can skip entire step (empty array)

---

### Step 3: Procedures

**Purpose**: Add procedures and pricing information

**Structure**: Array of procedure objects (optional, can skip entire step)

#### Procedure Fields:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `procedureName` | string | Yes (if procedure exists) | Max 255 chars |
| `category` | string | Yes | From enum |
| `priceMin` | number | No | Minimum price |
| `priceMax` | number | No | Maximum price, must be >= priceMin |
| `unit` | string | No | Price unit from enum |
| `averagePrice` | number | No | Auto-calculated if not provided: (min + max) / 2 |
| `providerNames` | array | No | Array of provider names from Step 2 |

#### Category Enum:
- `Face`
- `Body`
- `Breast`
- `Butt`
- `Injectables`
- `Skin`
- `Other`

#### Unit Enum:
- `(none/blank)`
- `/unit`
- `/session`
- `/injection`
- `/area`
- `/treatment`
- `/syringe`
- `/vial`

**Behavior**:
- User can add multiple procedures
- Can associate procedures with specific providers
- Frontend auto-calculates averagePrice if not provided
- Can skip entire step (empty array)

---

### Step 4: Photos

**Purpose**: Upload clinic photos, icon/logo

**Structure**: Array of photo objects (optional, can skip entire step)

#### Photo Object:
| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Client-side temporary ID |
| `photoType` | string | `clinic` or `icon` |
| `photoData` | string | Base64 data URL |
| `photoURL` | string | External URL (alternative to photoData) |
| `fileName` | string | Original filename |
| `mimeType` | string | Image MIME type |
| `fileSize` | number | Compressed file size in bytes |
| `isPrimary` | boolean | Only one clinic photo can be primary |
| `displayOrder` | number | Order for display |
| `caption` | string | Optional photo caption |

#### Photo Upload Specifications:
- **Drag-and-drop enabled** via react-dropzone
- **Formats**: JPEG, PNG, WebP, GIF
- **Max original size**: 10MB per image
- **Auto-compression**: Max 2MB, 1920px max dimension
- **Clinic photos**: Multiple allowed, user selects primary
- **Icon/Logo**: One only, recommended 200x200px square
- **Primary photo**: Displayed on search result cards

**Behavior**:
- User can drag-and-drop or click to upload
- Images automatically compressed before adding to state
- User can set one clinic photo as "primary"
- User can remove any photo
- Can skip entire step (empty array)

---

### Step 5: Review & Submit

**Purpose**: Display all entered data for review before submission

**Features**:
- Shows all clinic information, advanced info, providers, procedures, photos
- Each section has "Edit" button to jump back to that step
- Data persists when jumping back
- Submit button sends data to API

**API Endpoint**: `POST /api/clinic-management/submissions`

**API Base URL**: 
- Development: `http://localhost:3001`
- Production: Configured via `REACT_APP_API_URL` env variable

---

### Step 6: Success

**Purpose**: Confirm submission and set expectations

**Displays**:
- Success message
- Submission ID (if provided by API)
- Expected review timeline (1-2 business days)
- Duplicate warning (if provided by API)
- Options: "List Another Clinic" or "Return to Homepage"

---

## Complete API Payload Structure

```json
{
  "submitterKey": "optional-key-for-internal-tracking",
  "flow": "new_clinic",
  "existingClinicId": null,
  
  "clinic": {
    "clinicName": "Wicker Park Med Spa",
    "address": "1755 W North Ave suite 103",
    "city": "Chicago",
    "state": "Illinois",
    "zipCode": "60622",
    "category": "Med Spa / Aesthetics",
    "website": "https://example.com",
    "phone": "(312) 555-1234",
    "email": "info@example.com"
  },
  
  "advanced": {
    "latitude": 41.91027,
    "longitude": -87.6722,
    "placeID": "ChIJO8wV3-XTD4gRuVGkjnvw",
    "description": "A premier med spa offering...",
    "googleProfileLink": "https://maps.google.com/?cid=...",
    "workingHours": {
      "Monday": "9:00AM-5:00PM",
      "Tuesday": "9:00AM-5:00PM",
      "Wednesday": "9:00AM-5:00PM",
      "Thursday": "9:00AM-5:00PM",
      "Friday": "9:00AM-8:00PM",
      "Saturday": "10:00AM-3:00PM",
      "Sunday": "Closed"
    }
  },
  
  "photos": [
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ...",
      "fileName": "exterior.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245000,
      "isPrimary": true,
      "displayOrder": 0,
      "caption": "Clinic exterior"
    },
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ...",
      "fileName": "lobby.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 180000,
      "isPrimary": false,
      "displayOrder": 1,
      "caption": null
    },
    {
      "photoType": "icon",
      "photoData": "data:image/png;base64,iVBORw0KGgo...",
      "fileName": "logo.png",
      "mimeType": "image/png",
      "fileSize": 12000,
      "isPrimary": false,
      "displayOrder": 0,
      "caption": null
    }
  ],
  
  "providers": [
    {
      "providerName": "Dr. Sarah Johnson",
      "specialty": "Plastic Surgery",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ...",
      "photoURL": null
    },
    {
      "providerName": "Maria Garcia, RN",
      "specialty": "Med Spa / Aesthetics",
      "photoData": null,
      "photoURL": "https://example.com/maria.jpg"
    }
  ],
  
  "procedures": [
    {
      "procedureName": "Botox",
      "category": "Injectables",
      "priceMin": 12,
      "priceMax": 15,
      "unit": "/unit",
      "averagePrice": null,
      "providerNames": ["Dr. Sarah Johnson", "Maria Garcia, RN"]
    },
    {
      "procedureName": "Rhinoplasty",
      "category": "Face",
      "priceMin": 8000,
      "priceMax": 15000,
      "unit": null,
      "averagePrice": 11500,
      "providerNames": ["Dr. Sarah Johnson"]
    }
  ]
}
```

---

## Expected API Response

```json
{
  "success": true,
  "submissionId": "GLW-2024-0042",
  "status": "pending_review",
  "message": "Submission received. We'll review it within 1-2 business days.",
  "duplicateWarning": null
}
```

### Or with Duplicate Warning:

```json
{
  "success": true,
  "submissionId": "GLW-2024-0043",
  "status": "pending_review",
  "message": "Submission received. We'll review it within 1-2 business days.",
  "duplicateWarning": {
    "message": "We found a potential match",
    "existingClinic": {
      "id": 15,
      "name": "Wicker Park Med Spa",
      "address": "1755 W North Ave"
    }
  }
}
```

### Error Response:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "clinicName": "Clinic name is required",
    "category": "Invalid category"
  }
}
```

---

## Field Validation Rules

### Clinic Fields

| Field | Rule |
|-------|------|
| clinicName | Required, max 255 chars |
| address | Required, max 500 chars |
| city | Required, max 100 chars |
| state | Required, must be valid US state |
| zipCode | Optional, 5 digits |
| category | Required, must be from enum |
| website | Optional, must start with http:// or https:// |
| phone | Optional, format (XXX) XXX-XXXX or XXX-XXX-XXXX |
| email | Optional, valid email format |

### Advanced Fields

| Field | Rule |
|-------|------|
| latitude | Number between -90 and 90 |
| longitude | Number between -180 and 180 |
| placeID | String, max 500 chars |
| description | String, max 2000 chars |
| googleProfileLink | Valid URL |
| workingHours | Object with day keys and time string values |

### Provider Fields

| Field | Rule |
|-------|------|
| providerName | Required if provider row exists, max 255 chars |
| specialty | Optional, must be from enum |
| photoData | Optional, base64 string |

### Procedure Fields

| Field | Rule |
|-------|------|
| procedureName | Required if procedure row exists, max 255 chars |
| category | Required, must be from enum |
| priceMin | Optional, positive number |
| priceMax | Optional, must be >= priceMin |
| unit | Optional, must be from enum |
| averagePrice | Optional, auto-calculate if not provided |
| providerNames | Optional, array of strings |

### Photo Fields

| Field | Rule |
|-------|------|
| photoType | Required, 'clinic' or 'icon' |
| photoData or photoURL | At least one required |
| isPrimary | Boolean, only one clinic photo can be true |
| fileSize | Max 10MB original, compressed to max 2MB |
| mimeType | Must be image/jpeg, image/png, image/webp, or image/gif |

---

## State Persistence

**localStorage Key**: `glowra_list_clinic_wizard`

The wizard automatically saves progress to localStorage after each step, so users don't lose data on page refresh. Data is cleared after successful submission or when user clicks "List Another Clinic".

---

## Entry Points

| Entry Point | URL | Behavior |
|-------------|-----|----------|
| Header "List Your Clinic" link | `/list-your-clinic` | Starts fresh wizard |
| Footer "List your clinic" link | `/list-your-clinic` | Starts fresh wizard |
| Direct URL | `/list-your-clinic` | Starts fresh wizard |
| With clinic ID | `/list-your-clinic?clinicId=123` | Pre-fills clinic, skips to Step 2 |
| With submitter key | `/list-your-clinic?submitterKey=xyz` | Pre-fills submitter key field |

---

## Image Processing

All images uploaded through the wizard are:

1. **Validated**: 
   - File type: JPEG, PNG, WebP, GIF only
   - File size: Max 10MB original

2. **Compressed** (using browser-image-compression):
   - Max size: 2MB
   - Max dimension: 1920px (width or height)
   - Maintains aspect ratio
   - Uses web worker for performance

3. **Converted** to base64 data URLs for transmission

4. **Metadata captured**:
   - Original filename
   - MIME type
   - Compressed file size

---

## Implementation Notes

### Technologies Used:
- React with React Router
- React Hook Form for form validation
- react-dropzone for drag-and-drop uploads
- browser-image-compression for automatic image optimization
- localStorage for state persistence

### Key Features:
- Multi-step wizard with progress indicator
- Back/forward navigation with data persistence
- Inline field validation
- Drag-and-drop photo uploads
- Automatic image compression
- Mobile responsive design
- Skip optional steps functionality
- Edit from review page

---

## Testing Considerations

### Required Test Scenarios:

1. **New Clinic Flow**: Complete submission with all required fields
2. **Add to Existing Flow**: Search and select existing clinic
3. **Optional Fields**: Submit with minimum required fields only
4. **Photos**: Upload various image formats and sizes
5. **Validation**: Test all validation rules (invalid email, phone, etc.)
6. **State Persistence**: Refresh page mid-wizard and verify data persists
7. **URL Parameters**: Test `?clinicId=123` and `?submitterKey=xyz`
8. **Skip Steps**: Skip providers, procedures, and photos steps
9. **Edit from Review**: Jump back to edit specific sections
10. **Error Handling**: Test API errors and network failures

---

## Error Handling

The frontend handles the following error scenarios:

1. **API Connection Errors**: Shows "Failed to submit. Please check your connection."
2. **Validation Errors**: Displays field-level error messages
3. **Image Upload Errors**: Shows error for invalid file type or size
4. **Network Timeouts**: Graceful error message with retry option

---

## Future Enhancements (Not Currently Implemented)

These were considered but are out of scope for v1:
- Save draft functionality
- Email confirmation after submission
- Status tracking page for submissions
- Multiple clinic locations (franchise support)
- Account/login for clinic owners
- Image cropping tool
- Provider/procedure templates

---

## Questions or Issues?

If you have questions about the implementation or encounter any issues with the data format, please reach out to the frontend team.

**Last Updated**: December 2024

