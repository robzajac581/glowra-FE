# Clinic Management Flows

This document provides comprehensive Mermaid diagrams showing how clinic data flows through the Glowra system, including the draft/submission system, admin review process, and all entry points.

---

## System Overview

The clinic management system uses a **draft-based workflow** where all changes (new clinics or edits to existing ones) go through a review process before being published.

```mermaid
flowchart TB
    subgraph EntryPoints["Entry Points"]
        LYC[List Your Clinic Wizard]
        ClinicPage[Clinic Detail Page]
        AdminEdit[Admin: Edit Existing Clinic]
    end
    
    subgraph DraftSystem["Draft System - Central Hub"]
        Draft[(Draft / Submission)]
    end
    
    subgraph AdminReview["Admin Review"]
        ReviewPage[Review Page]
        Preview[Preview Mode]
        Edit[Edit Mode]
        Approve[Approve]
        Reject[Reject]
    end
    
    subgraph Production["Live Data"]
        Clinic[(Published Clinic)]
    end
    
    LYC -->|Creates| Draft
    ClinicPage -->|Creates| Draft
    AdminEdit -->|Creates| Draft
    
    Draft --> ReviewPage
    ReviewPage --> Preview
    ReviewPage --> Edit
    Edit -->|Save| Draft
    Preview --> Approve
    Preview --> Reject
    
    Approve -->|Apply Changes| Clinic
    Reject -->|Archive| Draft
```

---

## Detailed Flow: Public User Submits New Clinic

```mermaid
sequenceDiagram
    participant User
    participant Wizard as List Your Clinic Wizard
    participant API as Backend API
    participant Draft as Draft Table
    participant Admin as Admin Dashboard
    
    User->>Wizard: Navigate to /list-your-clinic
    Wizard->>User: Show Choose Action screen
    User->>Wizard: Select "Add New Clinic"
    
    loop Fill Forms
        Wizard->>User: Show Clinic Info form
        User->>Wizard: Enter clinic details
        Wizard->>User: Show Providers form
        User->>Wizard: Add providers (optional)
        Wizard->>User: Show Procedures form
        User->>Wizard: Add procedures (optional)
        Wizard->>User: Show Photos form
        User->>Wizard: Upload photos (optional)
    end
    
    Wizard->>User: Show Review screen
    User->>Wizard: Click Submit
    Wizard->>API: POST /api/clinic-management/submissions
    Note over API: flow: "new_clinic"
    API->>Draft: Create new draft record
    API->>Wizard: Return draftId
    Wizard->>User: Show Success screen
    
    Note over Draft,Admin: Draft appears in Pending Review
    Admin->>Draft: Review draft
    Admin->>API: POST /api/admin/drafts/:id/approve
    API->>Draft: Create new Clinic from draft
```

---

## Detailed Flow: Public User Adds to Existing Clinic

```mermaid
sequenceDiagram
    participant User
    participant Wizard as List Your Clinic Wizard
    participant API as Backend API
    participant Draft as Draft Table
    participant Clinic as Clinic Table
    
    User->>Wizard: Navigate to /list-your-clinic
    Wizard->>User: Show Choose Action screen
    User->>Wizard: Select "Add to Existing"
    
    Wizard->>User: Show Search screen
    User->>Wizard: Search for clinic
    Wizard->>API: GET /api/clinics/search?q=...
    API->>Wizard: Return matching clinics
    User->>Wizard: Select existing clinic
    
    Note over Wizard: Pre-fill clinic data from selection
    
    loop Add Information
        Wizard->>User: Show Providers form
        User->>Wizard: Add new providers
        Wizard->>User: Show Procedures form
        User->>Wizard: Add new procedures
        Wizard->>User: Show Photos form
        User->>Wizard: Upload photos
    end
    
    Wizard->>User: Show Review screen
    User->>Wizard: Click Submit
    Wizard->>API: POST /api/clinic-management/submissions
    Note over API: flow: "add_to_existing"<br/>existingClinicId: 123
    API->>Draft: Create draft linked to clinic
    
    Note over Draft: On approval, changes merge into existing clinic
```

---

## Detailed Flow: Admin Edits Existing Clinic (NEW)

```mermaid
sequenceDiagram
    participant Admin
    participant ExistingClinics as Existing Clinics Page
    participant API as Backend API
    participant Draft as Draft Table
    participant ReviewPage as Review Page
    participant Clinic as Clinic Table
    
    Admin->>ExistingClinics: Navigate to /admin/clinics
    ExistingClinics->>API: GET /api/admin/clinics?page=1
    API->>ExistingClinics: Return paginated clinics
    
    Admin->>ExistingClinics: Click "Edit" on a clinic
    
    Note over ExistingClinics: Check for existing pending draft
    ExistingClinics->>API: GET /api/admin/drafts?status=pending_review
    API->>ExistingClinics: Return pending drafts
    
    alt Draft already exists for this clinic
        ExistingClinics->>Admin: Navigate to /admin/review/:draftId
    else No existing draft
        ExistingClinics->>API: GET /api/clinics/:clinicId (+ providers + procedures in parallel)
        API->>ExistingClinics: Return clinic data, providers, procedures
        
        Note over ExistingClinics: Convert to submission payload
        ExistingClinics->>API: POST /api/clinic-management/submissions
        Note over API: flow: "add_to_existing"<br/>submitterKey: "admin-edit"
        API->>Draft: Create draft from clinic data
        API->>ExistingClinics: Return draftId
        ExistingClinics->>Admin: Navigate to /admin/review/:draftId
    end
    
    Admin->>ReviewPage: View/Edit draft
    ReviewPage->>Admin: Show Preview and Edit modes
    
    Admin->>ReviewPage: Make edits
    ReviewPage->>API: PUT /api/admin/drafts/:draftId
    
    Admin->>ReviewPage: Click Approve
    ReviewPage->>API: POST /api/admin/drafts/:draftId/approve
    API->>Clinic: Apply changes to clinic
    API->>ReviewPage: Success
    ReviewPage->>Admin: Navigate back to /admin/clinics
```

---

## Admin Dashboard Navigation Structure

```mermaid
flowchart TD
    subgraph AdminDashboard["/admin - Admin Dashboard"]
        Header[Header with Logo + User]
        SectionNav[Section Navigation]
        
        Header --> SectionNav
        
        subgraph Sections["Main Sections"]
            SubmissionsSection[Submissions Section]
            ClinicsSection[Existing Clinics Section]
        end
        
        SectionNav --> SubmissionsSection
        SectionNav --> ClinicsSection
        
        subgraph SubmissionsTabs["Submissions Tabs"]
            Pending[Pending Review]
            Approved[Approved]
            Rejected[Rejected]
            All[All]
        end
        
        SubmissionsSection --> SubmissionsTabs
        
        subgraph ClinicsFeatures["Existing Clinics Features"]
            Search[Search Clinics]
            List[Paginated List]
            EditBtn[Edit Button]
        end
        
        ClinicsSection --> ClinicsFeatures
    end
    
    subgraph ReviewFlow["/admin/review/:draftId"]
        ReviewPage[Review Page]
        PreviewMode[Preview Mode]
        EditMode[Edit Mode]
        Actions[Approve / Reject]
    end
    
    Pending -->|Click Review| ReviewPage
    EditBtn -->|Creates Draft| ReviewPage
    
    ReviewPage --> PreviewMode
    ReviewPage --> EditMode
    PreviewMode --> Actions
```

---

## Draft States Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending_review: Submission created
    
    pending_review --> pending_review: Admin edits draft
    pending_review --> approved: Admin approves
    pending_review --> rejected: Admin rejects
    
    approved --> [*]: Changes applied to clinic
    rejected --> [*]: Draft archived
    
    note right of pending_review
        Draft can be edited multiple times
        before final decision
    end note
    
    note right of approved
        For new_clinic: Creates new clinic record
        For add_to_existing: Merges into existing clinic
    end note
```

---

## Data Transformation Flow

```mermaid
flowchart LR
    subgraph PublicSubmission["Public Submission Flow"]
        WizardState[Wizard State<br/>camelCase]
        SubmissionPayload[Submission Payload<br/>camelCase]
    end
    
    subgraph Backend["Backend"]
        DraftTable[(Drafts Table<br/>PascalCase)]
        ClinicTable[(Clinics Table<br/>PascalCase)]
    end
    
    subgraph AdminUI["Admin UI"]
        NormalizedDraft[Normalized Draft<br/>camelCase]
        EditForms[Edit Forms]
        Preview[Clinic Preview]
    end
    
    WizardState -->|Review.jsx| SubmissionPayload
    SubmissionPayload -->|POST /submissions| DraftTable
    
    DraftTable -->|GET /drafts/:id| NormalizedDraft
    NormalizedDraft -->|normalizeDraft| EditForms
    NormalizedDraft -->|transformDraftToClinicFormat| Preview
    
    EditForms -->|PUT /drafts/:id| DraftTable
    
    DraftTable -->|Approve| ClinicTable
```

---

## Key Files Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Public Wizard | `src/pages/list-your-clinic/ListYourClinic.jsx` | Multi-step form for public submissions |
| Wizard State | `src/pages/list-your-clinic/hooks/useWizardState.js` | State management with localStorage |
| Admin Layout | `src/pages/admin/AdminLayout.jsx` | Protected layout with section nav |
| Submissions Dashboard | `src/pages/admin/AdminDashboard.jsx` | List pending/approved/rejected drafts |
| Existing Clinics | `src/pages/admin/ExistingClinicsPage.jsx` | Browse and edit existing clinics |
| Review Page | `src/pages/admin/ReviewPage.jsx` | Preview/edit individual drafts |
| Edit Tabs | `src/pages/admin/components/EditTabs.jsx` | Tabbed editor for draft data |
| Draft Preview | `src/pages/admin/components/DraftClinicPreview.jsx` | Preview clinic using real components |
| Draft Normalizer | `src/pages/admin/utils/draftToClinicFormat.js` | Transform draft data for UI |
| Clinic to Draft | `src/pages/admin/utils/clinicToDraftFormat.js` | Convert clinic to submission payload |

---

## API Endpoints Summary

### Public Endpoints (No Auth)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/clinic-management/submissions` | Create new submission/draft |
| GET | `/api/clinics/search?q=...` | Search existing clinics |
| GET | `/api/clinics/:id` | Get clinic details |
| GET | `/api/clinics/:id/providers` | Get clinic providers |
| GET | `/api/clinics/:id/procedures` | Get clinic procedures |

### Admin Endpoints (JWT Auth Required)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/clinics?page=&search=` | List all clinics (paginated) |
| GET | `/api/admin/drafts?status=` | List drafts by status |
| GET | `/api/admin/drafts/:id` | Get single draft details |
| PUT | `/api/admin/drafts/:id` | Update draft data |
| POST | `/api/admin/drafts/:id/approve` | Approve and publish |
| POST | `/api/admin/drafts/:id/reject` | Reject submission |
| GET | `/api/admin/stats` | Get submission counts |

