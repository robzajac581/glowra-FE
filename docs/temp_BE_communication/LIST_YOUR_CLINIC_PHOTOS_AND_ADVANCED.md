# List Your Clinic - Photos & Advanced Information

**Version**: 1.0  
**Date**: December 2024  
**Status**: Planning  
**Companion Doc**: See `LIST_YOUR_CLINIC_FRONTEND_REQUIREMENTS.md` for the main wizard flow

---

## Overview

This document extends the "List Your Clinic" wizard with two new features:

1. **Photo Uploads** - Allow users to upload clinic photos, provider headshots, and a clinic icon/logo
2. **Advanced Information** - Optional fields for power users/scrapers to add detailed data like coordinates, social media links, etc.

---

## Photo Upload Section

### Location in Wizard

Add a new **Step 4: Photos (Optional)** between the current Procedures step and Review step:

```
Step 0: Choose Action
Step 1: Clinic Info (or Search)
Step 2: Providers
Step 3: Procedures
Step 4: Photos (NEW) ← Add this step
Step 5: Review & Submit
Step 6: Success
```

Alternatively, photos can be **collapsible sections within existing steps**:
- Clinic photos at the end of Step 1 (Clinic Info)
- Provider photos inline with each provider in Step 2

### Photo Step Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back                                                    Step 4 of 6  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                      Add Photos (Optional)                              │
│                                                                         │
│  Photos help patients recognize your clinic and build trust.           │
│  You can skip this step if you don't have photos ready.                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CLINIC PHOTOS                                                    │   │
│  │                                                                  │   │
│  │  Add photos of your clinic (exterior, interior, treatment rooms) │   │
│  │                                                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │  ★       │ │          │ │          │ │   + Add  │           │   │
│  │  │  [img]   │ │  [img]   │ │  [img]   │ │   Photo  │           │   │
│  │  │          │ │          │ │          │ │          │           │   │
│  │  │ Primary  │ │  ✕       │ │  ✕       │ │          │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│  │                                                                  │   │
│  │  ★ = Primary photo (shown on search cards)                       │   │
│  │  Click a photo to set as primary or remove                       │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CLINIC ICON/LOGO                                                 │   │
│  │                                                                  │   │
│  │  ┌──────────┐                                                   │   │
│  │  │          │  Upload your clinic's logo or icon                │   │
│  │  │  [icon]  │  Recommended: Square image, at least 200x200px    │   │
│  │  │          │                                                   │   │
│  │  └──────────┘                                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ PROVIDER PHOTOS                                                  │   │
│  │                                                                  │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐               │   │
│  │  │ Dr. Sarah Johnson   │  │ Maria Garcia, RN    │               │   │
│  │  │ ┌──────┐            │  │ ┌──────┐            │               │   │
│  │  │ │      │ + Add      │  │ │      │ + Add      │               │   │
│  │  │ │ foto │   Photo    │  │ │ foto │   Photo    │               │   │
│  │  │ │      │            │  │ │      │            │               │   │
│  │  │ └──────┘            │  │ └──────┘            │               │   │
│  │  └─────────────────────┘  └─────────────────────┘               │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [ Skip this step ]                                 [ Continue → ]      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Photo Upload Behavior

**Supported formats**: JPEG, PNG, WebP, GIF
**Max file size**: 10MB per image
**Recommended dimensions**:
- Clinic photos: At least 800x600px (landscape preferred)
- Icon/Logo: 200x200px minimum (square)
- Provider photos: 400x400px minimum (headshot style)

**Upload Flow**:
1. User clicks "+ Add Photo" or drops image
2. Show upload progress indicator
3. Convert to base64 and store in state (or upload to temp storage)
4. Display thumbnail preview
5. Allow reordering via drag-and-drop (optional)
6. Click photo to set as primary or remove

### Photo State Structure

```typescript
interface ClinicPhoto {
  id: string;              // Temporary client-side ID
  photoType: 'clinic' | 'icon';
  photoData?: string;      // Base64 data URL (for upload)
  photoURL?: string;       // External URL (alternative)
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  isPrimary: boolean;      // Only one clinic photo can be primary
  displayOrder: number;
  caption?: string;
}

interface ProviderPhoto {
  providerIndex: number;   // Which provider this photo belongs to
  photoData?: string;
  photoURL?: string;
}
```

---

## Advanced Information Section

### Location in Wizard

Add as a **collapsible "Advanced" section at the bottom of Step 1 (Clinic Info)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back                                                    Step 1 of 6  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                      Clinic Information                                 │
│                                                                         │
│  [... existing clinic fields: name, address, city, state, etc. ...]    │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  ▸ Advanced Information (optional)                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

When expanded:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ▾ Advanced Information (optional)                                      │
│                                                                         │
│  These fields are optional. Most users can skip this section.          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ LOCATION DATA                                                    │   │
│  │                                                                  │   │
│  │  Latitude                         Longitude                      │   │
│  │  ┌─────────────────────┐         ┌─────────────────────┐        │   │
│  │  │ 25.7617             │         │ -80.1918            │        │   │
│  │  └─────────────────────┘         └─────────────────────┘        │   │
│  │  Geographic coordinates (decimal degrees)                        │   │
│  │                                                                  │   │
│  │  Google Place ID                                                 │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ ChIJrTLr-GyuEmsRBfy61i59si0                                │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │  Found in Google Maps URL or Places API                         │   │
│  │                                                                  │   │
│  │  Google Maps Link                                                │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ https://maps.google.com/?cid=...                          │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ADDITIONAL DETAILS                                               │   │
│  │                                                                  │   │
│  │  Description                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ Skin Solutions Miami is a premier med spa offering a wide │  │   │
│  │  │ range of aesthetic treatments including Botox, fillers,   │  │   │
│  │  │ laser treatments, and more...                             │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │  Brief description of the clinic (up to 2000 characters)        │   │
│  │                                                                  │   │
│  │  Booking URL                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ https://skinsolutionsmiami.com/book                       │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │  Direct link to book an appointment                              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ SOCIAL MEDIA                                                     │   │
│  │                                                                  │   │
│  │  Facebook                          Instagram                     │   │
│  │  ┌─────────────────────┐          ┌─────────────────────┐       │   │
│  │  │ https://facebook... │          │ https://instagram.. │       │   │
│  │  └─────────────────────┘          └─────────────────────┘       │   │
│  │                                                                  │   │
│  │  LinkedIn                          Twitter/X                     │   │
│  │  ┌─────────────────────┐          ┌─────────────────────┐       │   │
│  │  │ https://linkedin... │          │ https://twitter...  │       │   │
│  │  └─────────────────────┘          └─────────────────────┘       │   │
│  │                                                                  │   │
│  │  YouTube                                                         │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ https://youtube.com/@skinsolutionsmiami                   │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ WORKING HOURS                                                    │   │
│  │                                                                  │   │
│  │  Monday      ┌─────────┐  -  ┌─────────┐   ☐ Closed             │   │
│  │              │ 9:00 AM │     │ 5:00 PM │                        │   │
│  │  Tuesday     ┌─────────┐  -  ┌─────────┐   ☐ Closed             │   │
│  │              │ 9:00 AM │     │ 5:00 PM │                        │   │
│  │  ...                                                             │   │
│  │  Sunday      ┌─────────┐  -  ┌─────────┐   ☑ Closed             │   │
│  │              │         │     │         │                        │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Updated API Payload

The submission payload now includes `photos` and `advanced` objects:

```json
{
  "submitterKey": "optional-key",
  "flow": "new_clinic",
  "existingClinicId": null,
  
  "clinic": {
    "clinicName": "Skin Solutions Miami",
    "address": "123 Collins Ave, Suite 400",
    "city": "Miami Beach",
    "state": "Florida",
    "zipCode": "33139",
    "category": "Med Spa / Aesthetics",
    "website": "https://skinsolutionsmiami.com",
    "phone": "(305) 555-1234",
    "email": "info@skinsolutionsmiami.com"
  },
  
  "advanced": {
    "latitude": 25.7617,
    "longitude": -80.1918,
    "placeID": "ChIJrTLr-GyuEmsRBfy61i59si0",
    "description": "Skin Solutions Miami is a premier med spa...",
    "bookingURL": "https://skinsolutionsmiami.com/book",
    "googleProfileLink": "https://maps.google.com/?cid=...",
    "facebook": "https://facebook.com/skinsolutionsmiami",
    "instagram": "https://instagram.com/skinsolutionsmiami",
    "linkedin": "https://linkedin.com/company/skinsolutionsmiami",
    "twitter": "https://twitter.com/skinsolutions",
    "youtube": "https://youtube.com/@skinsolutionsmiami",
    "workingHours": {
      "Monday": "9AM-5PM",
      "Tuesday": "9AM-5PM",
      "Wednesday": "9AM-5PM",
      "Thursday": "9AM-5PM",
      "Friday": "9AM-5PM",
      "Saturday": "9AM-2PM",
      "Sunday": "Closed"
    }
  },
  
  "photos": [
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ...",
      "fileName": "clinic-exterior.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245000,
      "isPrimary": true,
      "displayOrder": 0,
      "caption": "Our clinic exterior"
    },
    {
      "photoType": "clinic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ...",
      "fileName": "treatment-room.jpg",
      "mimeType": "image/jpeg",
      "isPrimary": false,
      "displayOrder": 1
    },
    {
      "photoType": "icon",
      "photoData": "data:image/png;base64,iVBORw0KGgo...",
      "fileName": "logo.png",
      "mimeType": "image/png",
      "isPrimary": false,
      "displayOrder": 0
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
      "photoURL": "https://example.com/maria-garcia.jpg"
    }
  ],
  
  "procedures": [
    {
      "procedureName": "Botox",
      "category": "Injectables",
      "priceMin": 12,
      "priceMax": 15,
      "unit": "/unit",
      "providerNames": ["Dr. Sarah Johnson", "Maria Garcia, RN"]
    }
  ]
}
```

---

## State Management Updates

Update the WizardState interface to include photos and advanced:

```typescript
interface WizardState {
  currentStep: 0 | 1 | 2 | 3 | 4 | 5;  // Updated to include photos step
  flow: 'new_clinic' | 'add_to_existing';
  submitterKey?: string;
  existingClinicId?: number;
  
  clinic: {
    clinicName: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    category: string;
    website?: string;
    phone?: string;
    email?: string;
  };
  
  advanced: {
    latitude?: number;
    longitude?: number;
    placeID?: string;
    description?: string;
    bookingURL?: string;
    googleProfileLink?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    workingHours?: {
      Monday?: string;
      Tuesday?: string;
      Wednesday?: string;
      Thursday?: string;
      Friday?: string;
      Saturday?: string;
      Sunday?: string;
    };
  };
  
  photos: Array<{
    id: string;
    photoType: 'clinic' | 'icon';
    photoData?: string;
    photoURL?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    isPrimary: boolean;
    displayOrder: number;
    caption?: string;
  }>;
  
  providers: Array<{
    providerName: string;
    specialty?: string;
    photoData?: string;
    photoURL?: string;
  }>;
  
  procedures: Array<{
    procedureName: string;
    category: string;
    priceMin?: number;
    priceMax?: number;
    unit?: string;
    averagePrice?: number;
    providerNames: string[];
  }>;
}
```

---

## Validation Rules

### Photo Validation

| Rule | Description |
|------|-------------|
| Format | JPEG, PNG, WebP, GIF only |
| Size | Max 10MB per image |
| Primary | Only one clinic photo can be primary |
| Required | Photos are entirely optional |

### Advanced Field Validation

| Field | Rule |
|-------|------|
| latitude | Number between -90 and 90 |
| longitude | Number between -180 and 180 |
| placeID | String, max 500 chars |
| description | String, max 2000 chars |
| bookingURL | Valid URL starting with http:// or https:// |
| googleProfileLink | Valid URL |
| facebook | URL containing facebook.com |
| instagram | URL containing instagram.com |
| linkedin | URL containing linkedin.com |
| twitter | URL (any twitter.com or x.com URL) |
| youtube | URL containing youtube.com |
| workingHours | Object with day keys and time string values |

---

## Review Page Updates

Update the Review page to show photos and advanced info:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ PHOTOS (3 clinic, 1 icon, 2 provider)                 [ Edit ]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  Clinic Photos:                                                  │   │
│  │  ┌────┐ ┌────┐ ┌────┐                                           │   │
│  │  │ ★  │ │    │ │    │  3 photos (1 primary)                     │   │
│  │  └────┘ └────┘ └────┘                                           │   │
│  │                                                                  │   │
│  │  Icon/Logo: ✓ Uploaded                                          │   │
│  │                                                                  │   │
│  │  Provider Photos:                                                │   │
│  │  • Dr. Sarah Johnson - ✓ Photo                                  │   │
│  │  • Maria Garcia, RN - ✓ Photo                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ADVANCED INFO                                         [ Edit ]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ Location:    25.7617, -80.1918                                  │   │
│  │ Place ID:    ChIJrTLr-GyuEmsRBfy61i59si0                        │   │
│  │ Social:      Facebook, Instagram, LinkedIn                       │   │
│  │ Hours:       Mon-Fri 9AM-5PM, Sat 9AM-2PM                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### Photo Upload Component

Consider using a library like:
- `react-dropzone` for drag-and-drop uploads
- `react-image-crop` if you want to allow cropping
- `browser-image-compression` to compress large images before upload

### Base64 Conversion

```javascript
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
```

### Image Compression (Recommended)

```javascript
import imageCompression from 'browser-image-compression';

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 2,           // Compress to max 2MB
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true
  };
  return await imageCompression(file, options);
};
```

---

## Questions for Frontend Team

1. Should photos be a separate step or collapsible sections within existing steps?
2. Do you want drag-and-drop reordering for clinic photos?
3. Should we add image cropping functionality?
4. Do you want a "copy coordinates from Google Maps" helper feature?
5. Should the working hours editor be a custom component or just text inputs?

