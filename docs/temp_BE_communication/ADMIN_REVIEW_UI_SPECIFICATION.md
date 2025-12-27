# Admin Review UI Specification

## Overview

This document specifies the new **Admin Review UI** for reviewing and approving clinic listings. This includes:
- Admin authentication
- Dashboard with pending drafts
- Clinic preview and approval flow
- Data editing capabilities
- Google Places data integration

The admin UI will live within the same React app at a protected `/admin` route.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Admin Dashboard](#2-admin-dashboard)
3. [Review Flow - New Clinics](#3-review-flow---new-clinics)
4. [Review Flow - Adjustments](#4-review-flow---adjustments)
5. [API Endpoints](#5-api-endpoints)
6. [Data Models](#6-data-models)
7. [UI Components](#7-ui-components)
8. [Implementation Notes](#8-implementation-notes)

---

## 1. Authentication

### Login Page

**Route:** `/admin/login`

A simple admin login form with:
- Email input field
- Password input field
- "Login" button
- Error message display for invalid credentials

**Initial Admin Account:**
- Email: `superadmin@glowra.com`
- Password: Will be provided separately (not in this doc for security)

### Authentication Flow

```
POST /api/admin/login
{
  "email": "superadmin@glowra.com",
  "password": "..."
}

Response (200):
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "email": "superadmin@glowra.com",
    "role": "admin"
  }
}

Response (401):
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Token Storage

- Store JWT token in `localStorage` or `sessionStorage`
- Include token in all admin API requests via `Authorization: Bearer <token>` header
- Token expires after 24 hours
- On expiration, redirect to login

### Protected Routes

All `/admin/*` routes (except `/admin/login`) require valid authentication.
Redirect unauthenticated users to `/admin/login`.

---

## 2. Admin Dashboard

**Route:** `/admin` or `/admin/dashboard`

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Glowra Logo]    Admin Dashboard           [User ▼] [Logout]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📋 Pending Review (12)  │  ✓ Approved (45)  │ ✗ Rejected │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Filter: [All Types ▼]  [Date Range ▼]  [🔍 Search...]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🆕 Skin Solutions Miami           NEW CLINIC            │   │
│  │    Miami Beach, FL    Submitted: 2 hours ago            │   │
│  │    [Review →]                                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📝 Beverly Hills Aesthetics       ADJUSTMENT            │   │
│  │    Beverly Hills, CA    Submitted: 1 day ago            │   │
│  │    [Review →]                                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🆕 Manhattan Medspa               NEW CLINIC            │   │
│  │    New York, NY    Submitted: 3 days ago                │   │
│  │    [Review →]                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Previous]  Page 1 of 3  [Next →]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Features

1. **Status Tabs**: Filter by Pending, Approved, Rejected, All
2. **Type Filter**: New Clinic, Adjustment, All
3. **Search**: Search by clinic name, city, submitter
4. **Sort**: By date (newest first), or alphabetically
5. **Pagination**: 20 items per page

### Draft List Item

Each item shows:
- Clinic name
- City, State
- Submission type badge (NEW CLINIC / ADJUSTMENT)
- Time since submission
- "Review" button → navigates to review page

---

## 3. Review Flow - New Clinics

**Route:** `/admin/review/:draftId`

### Two-Mode Interface

The review page has two primary modes:
1. **Preview Mode** (default) - Quick review and approve
2. **Edit Mode** - Full data editing wizard

### Preview Mode Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]     Review: Skin Solutions Miami         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CLINIC PREVIEW                         │   │
│  │  ┌──────────────┐                                       │   │
│  │  │              │  Skin Solutions Miami                 │   │
│  │  │   [Photo]    │  ⭐ 4.7 (142 reviews)                 │   │
│  │  │              │  📍 123 Collins Ave, Miami Beach, FL  │   │
│  │  └──────────────┘  🏥 Med Spa / Aesthetics              │   │
│  │                     🌐 skinsolutionsmiami.com            │   │
│  │                     📞 (305) 555-1234                    │   │
│  │                                                         │   │
│  │  ──────────────────────────────────────────────────     │   │
│  │                                                         │   │
│  │  Providers:                                             │   │
│  │  • Dr. Sarah Johnson - Plastic Surgery                  │   │
│  │  • Maria Garcia, RN - Aesthetics                        │   │
│  │                                                         │   │
│  │  Procedures (8):                                        │   │
│  │  • Botox - $12-15/unit - Injectables                   │   │
│  │  • Lip Filler - $650-850 - Injectables                 │   │
│  │  • Chemical Peel - $150-300 - Skin Treatments          │   │
│  │  [Show all...]                                          │   │
│  │                                                         │   │
│  │  Photos (4):                                            │   │
│  │  [📷] [📷] [📷] [📷]                                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📊 DATA SOURCES                                        │   │
│  │  ───────────────────────────────────────────────────    │   │
│  │                                                         │   │
│  │  Google Place ID: ChIJN1t_tDeuEmsRUsoyG83frY4           │   │
│  │  [🔍 Lookup Different PlaceID]                          │   │
│  │                                                         │   │
│  │  Rating Source: ● Google (4.7) ○ Manual                 │   │
│  │                                                         │   │
│  │  Photos:                                                │   │
│  │  User provided: 4 photos                                │   │
│  │  Google available: 10 photos [Preview Google Photos]    │   │
│  │                                                         │   │
│  │  Using: ● User Photos Only (≥3 provided)                │   │
│  │         ○ Google Photos Only                            │   │
│  │         ○ Both (User Priority)                          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Edit Data ✏️]     [Reject ✗]     [✓ Approve]          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Preview Mode Features

1. **Clinic Preview Card**: Shows exactly how the clinic will appear on the site
2. **Data Sources Panel**:
   - Shows current Google PlaceID (auto-looked up or provided)
   - Option to lookup/change PlaceID
   - Rating source toggle (Google vs Manual entry)
   - Photo source selection with preview options
3. **Action Buttons**:
   - **Edit Data**: Switches to Edit Mode
   - **Reject**: Opens rejection dialog (optional reason)
   - **Approve**: Approves with current settings

### Photo Logic (Auto-Applied)

| User Photos | Auto Behavior | Admin Can Change To |
|-------------|---------------|---------------------|
| ≥ 3 photos | User Only (no Google fetch) | Google Only, Both |
| 1-2 photos | Both (User + Google) | User Only, Google Only |
| 0 photos | Google Only | Manual upload in Edit Mode |

**Note:** When ≥3 user photos exist, Google photo lookup is NOT performed automatically. Admin can manually trigger it via "Preview Google Photos" button if desired.

### Edit Mode (Wizard or Single Page)

When admin clicks "Edit Data", show a comprehensive editing interface.

**Option A: Wizard Steps**
```
Step 1: Basic Info (Name, Address, Category, Contact)
Step 2: Providers (Add/Edit/Remove)
Step 3: Procedures (Add/Edit/Remove)
Step 4: Photos (Select/Upload/Reorder)
Step 5: Google Data (PlaceID, Ratings)
Step 6: Review & Submit
```

**Option B: Single Scrollable Page (Recommended)**
```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Preview]          Edit: Skin Solutions Miami        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ▼ BASIC INFORMATION                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Clinic Name: [Skin Solutions Miami____________]         │   │
│  │ Address:     [123 Collins Ave, Suite 400______]         │   │
│  │ City:        [Miami Beach___] State: [Florida ▼]        │   │
│  │ Zip:         [33139___]                                 │   │
│  │ Category:    [Med Spa / Aesthetics ▼]                   │   │
│  │ Website:     [https://skinsolutionsmiami.com__]         │   │
│  │ Phone:       [(305) 555-1234___]                        │   │
│  │ Email:       [info@skinsolutionsmiami.com_____]         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ▼ LOCATION & GOOGLE DATA                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Latitude:  [25.7924513___]  Longitude: [-80.1306375__]  │   │
│  │ Place ID:  [ChIJN1t_tDeuEmsRUsoyG83frY4______]          │   │
│  │            [🔍 Lookup PlaceID]  [📍 Verify on Map]       │   │
│  │                                                         │   │
│  │ Google Rating: [4.7__]  Review Count: [142__]           │   │
│  │                [🔄 Refresh from Google]                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ▼ PROVIDERS (2)                                      [+ Add]   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Dr. Sarah Johnson____] [Plastic Surgery ▼]    [🗑️]     │   │
│  │ [Maria Garcia, RN_____] [Aesthetics ▼]         [🗑️]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ▼ PROCEDURES (8)                                     [+ Add]   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Botox          | Injectables | $12-15/unit    [✏️] [🗑️] │   │
│  │ Lip Filler     | Injectables | $650-850       [✏️] [🗑️] │   │
│  │ Chemical Peel  | Skin        | $150-300       [✏️] [🗑️] │   │
│  │ [Show all 8...]                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ▼ PHOTOS                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Source: (●) User Provided  ( ) Google  ( ) Both         │   │
│  │                                                         │   │
│  │ User Photos (4):           [+ Upload More]              │   │
│  │ [📷 ✓][📷 ✓][📷 ✓][📷 ✓]   (drag to reorder)           │   │
│  │                                                         │   │
│  │ Google Photos: [Fetch Google Photos]                    │   │
│  │ (Not fetched - user has ≥3 photos)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │      [Cancel]              [Save & Back to Preview]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Review Flow - Adjustments

**Route:** `/admin/review/:draftId` (same as new clinics, different display)

For adjustment requests (updates to existing clinics), show a **merged preview with change highlights**.

### Adjustment Review Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]     Review Adjustment: Beverly Hills Aes │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📋 ADJUSTMENT REQUEST                                   │   │
│  │  Updating existing clinic #47                           │   │
│  │  [View Current Listing →]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PROPOSED CHANGES                                       │   │
│  │  ───────────────────────────────────────────────────    │   │
│  │                                                         │   │
│  │  Phone: (310) 555-0000  →  (310) 555-1234  [CHANGED]   │   │
│  │  Website: beverlyhillsaesthetics.com  [UNCHANGED]       │   │
│  │                                                         │   │
│  │  New Providers to Add:                                  │   │
│  │  • Dr. James Wilson - Dermatology  [NEW]               │   │
│  │                                                         │   │
│  │  New Procedures to Add:                                 │   │
│  │  • Morpheus8 - $800-1200 - Skin Treatments  [NEW]      │   │
│  │  • RF Microneedling - $400-600 - Skin  [NEW]           │   │
│  │                                                         │   │
│  │  New Photos:                                            │   │
│  │  [📷][📷]  2 new photos to add                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MERGED PREVIEW (How it will look after approval)       │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  [Clinic preview card with all changes applied]  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Edit Changes ✏️]     [Reject ✗]     [✓ Approve]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Adjustment Features

1. **Current Listing Link**: Opens current live clinic in new tab
2. **Change Summary**: Shows what's being added/modified with visual indicators
3. **Merged Preview**: Shows final result after all changes applied
4. **Edit Mode**: Same as new clinics, but only shows changeable fields

---

## 5. API Endpoints

### Authentication

```
POST /api/admin/login
Body: { email: string, password: string }
Response: { success: boolean, token: string, user: { email, role } }

POST /api/admin/logout
Headers: Authorization: Bearer <token>
Response: { success: boolean }

GET /api/admin/me
Headers: Authorization: Bearer <token>
Response: { success: boolean, user: { email, role } }
```

### Drafts Management

```
GET /api/admin/drafts
Query params: status, type, search, page, limit
Headers: Authorization: Bearer <token>
Response: {
  success: boolean,
  drafts: Draft[],
  pagination: { page, limit, total, totalPages }
}

GET /api/admin/drafts/:draftId
Headers: Authorization: Bearer <token>
Response: {
  success: boolean,
  draft: DraftWithDetails,
  existingClinic: Clinic | null  // For adjustments
}

PUT /api/admin/drafts/:draftId
Headers: Authorization: Bearer <token>
Body: { ...updatedFields }
Response: { success: boolean, draft: DraftWithDetails }

POST /api/admin/drafts/:draftId/approve
Headers: Authorization: Bearer <token>
Body: {
  photoSource: 'user' | 'google' | 'both',
  ratingSource: 'google' | 'manual',
  manualRating?: number,
  manualReviewCount?: number
}
Response: {
  success: boolean,
  clinicId: number,
  message: string
}

POST /api/admin/drafts/:draftId/reject
Headers: Authorization: Bearer <token>
Body: { reason?: string }
Response: { success: boolean }
```

### Google Places Integration

```
POST /api/admin/drafts/:draftId/lookup-placeid
Headers: Authorization: Bearer <token>
Body: { clinicName?: string, address?: string }  // Optional overrides
Response: {
  success: boolean,
  placeId: string | null,
  confidence: number,  // 0-1 match confidence
  businessName: string,
  formattedAddress: string
}

POST /api/admin/drafts/:draftId/fetch-google-data
Headers: Authorization: Bearer <token>
Response: {
  success: boolean,
  googleData: {
    rating: number,
    reviewCount: number,
    photos: GooglePhoto[],
    openingHours: string[],
    businessStatus: string
  }
}

GET /api/admin/drafts/:draftId/google-photos
Headers: Authorization: Bearer <token>
Response: {
  success: boolean,
  photos: GooglePhoto[]
}
```

### Dashboard Statistics

```
GET /api/admin/stats
Headers: Authorization: Bearer <token>
Response: {
  success: boolean,
  stats: {
    pendingCount: number,
    approvedCount: number,
    rejectedCount: number,
    newClinicsCount: number,
    adjustmentsCount: number
  }
}
```

---

## 6. Data Models

### Draft Object (Full Details)

```typescript
interface Draft {
  draftId: number;
  submissionId: string;          // e.g., "GLW-2024-0042"
  
  // Basic Info
  clinicName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string | null;
  category: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  
  // Location
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  
  // Google Data (fetched or manual)
  googleRating: number | null;
  googleReviewCount: number | null;
  
  // Metadata
  status: 'pending_review' | 'approved' | 'rejected' | 'merged';
  source: 'wizard' | 'bulk_import' | 'manual';
  submissionFlow: 'new_clinic' | 'add_to_existing';
  existingClinicId: number | null;  // For adjustments
  
  submittedBy: string | null;
  submittedAt: string;  // ISO date
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string | null;
  
  // Related data
  providers: DraftProvider[];
  procedures: DraftProcedure[];
  photos: DraftPhoto[];
}

interface DraftProvider {
  draftProviderId: number;
  providerName: string;
  specialty: string | null;
}

interface DraftProcedure {
  draftProcedureId: number;
  procedureName: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  priceUnit: string | null;
  averagePrice: number | null;
  providerNames: string[] | null;  // Which providers offer this
}

interface DraftPhoto {
  draftPhotoId: number;
  photoType: 'clinic' | 'provider' | 'procedure' | 'gallery';
  photoUrl: string;
  fileName: string | null;
  isPrimary: boolean;
  displayOrder: number;
  source: 'user' | 'google';
}

interface GooglePhoto {
  reference: string;
  url: string;
  width: number;
  height: number;
  attributions: string[];
}
```

### Draft List Item (Dashboard)

```typescript
interface DraftListItem {
  draftId: number;
  submissionId: string;
  clinicName: string;
  city: string;
  state: string;
  status: string;
  submissionFlow: 'new_clinic' | 'add_to_existing';
  submittedAt: string;
  photoCount: number;
  providerCount: number;
  procedureCount: number;
}
```

---

## 7. UI Components

### Recommended Component Structure

```
/admin
├── AdminLayout.tsx           # Layout with header, nav
├── AdminLogin.tsx            # Login page
├── AdminDashboard.tsx        # Main dashboard
├── components/
│   ├── DraftList.tsx         # List of drafts with filters
│   ├── DraftListItem.tsx     # Individual draft row
│   ├── StatusBadge.tsx       # Status indicator badges
│   └── Pagination.tsx        # Pagination controls
├── review/
│   ├── ReviewPage.tsx        # Main review page (both modes)
│   ├── PreviewMode.tsx       # Quick preview & approve
│   ├── EditMode.tsx          # Full editing interface
│   ├── ClinicPreview.tsx     # Preview card component
│   ├── DataSourcesPanel.tsx  # Google data & photo selection
│   ├── ProviderEditor.tsx    # Add/edit/remove providers
│   ├── ProcedureEditor.tsx   # Add/edit/remove procedures
│   ├── PhotoManager.tsx      # Photo selection & ordering
│   └── ApprovalDialog.tsx    # Confirmation dialog
└── hooks/
    ├── useAuth.tsx           # Authentication hook
    ├── useDrafts.tsx         # Drafts fetching hook
    └── useGoogleLookup.tsx   # Google Places lookup hook
```

### Key UI Patterns

1. **Loading States**: Show skeletons while fetching data
2. **Error Handling**: Toast notifications for errors
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Confirmation Dialogs**: For approve/reject actions
5. **Responsive**: Should work on tablet (1024px+), not mobile-critical

---

## 8. Implementation Notes

### Authentication Token Handling

```typescript
// Store token on login
localStorage.setItem('adminToken', token);

// Include in all requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
  'Content-Type': 'application/json'
};

// Handle 401 responses globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

### Photo Source Logic

```typescript
function getDefaultPhotoSource(draft: Draft): 'user' | 'google' | 'both' {
  const userPhotoCount = draft.photos.filter(p => p.source === 'user').length;
  
  if (userPhotoCount >= 3) {
    return 'user';  // Don't fetch Google photos
  } else if (userPhotoCount > 0) {
    return 'both';  // Supplement with Google
  } else {
    return 'google'; // Use Google only
  }
}

function shouldAutoFetchGooglePhotos(draft: Draft): boolean {
  const userPhotoCount = draft.photos.filter(p => p.source === 'user').length;
  return userPhotoCount < 3;
}
```

### Google PlaceID Lookup Flow

1. When draft loads, check if `placeId` exists
2. If not, show "Lookup PlaceID" button
3. On click, call `/api/admin/drafts/:id/lookup-placeid`
4. If found with high confidence (>0.8), auto-populate
5. If low confidence, show confirmation dialog with matched business info
6. Admin can accept or manually enter different PlaceID

### Approval Flow

```typescript
async function approveDraft(draftId: number, options: ApprovalOptions) {
  // 1. If photoSource includes 'google' and photos not fetched, fetch them
  if (options.photoSource !== 'user' && !googlePhotosFetched) {
    await fetchGooglePhotos(draftId);
  }
  
  // 2. If using Google rating and not fetched, fetch it
  if (options.ratingSource === 'google' && !googleDataFetched) {
    await fetchGoogleData(draftId);
  }
  
  // 3. Submit approval
  const result = await api.post(`/admin/drafts/${draftId}/approve`, options);
  
  // 4. Navigate to dashboard with success message
  navigate('/admin', { state: { success: `Clinic approved: ${clinicName}` } });
}
```

---

## Next Steps for Frontend Team

1. **Set up routing** for `/admin/*` routes with auth guard
2. **Implement login page** and token management
3. **Build dashboard** with draft list and filters
4. **Create review page** with preview mode first
5. **Add edit mode** with form validation
6. **Integrate Google lookups** via new API endpoints
7. **Add approval/rejection flows** with confirmations

