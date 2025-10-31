# Consultation Request API - Integration Guide

## API Base URL
**Production URL:** [Your production URL here]
**Health Check:** `GET /health` - Returns `{"status":"ok","timestamp":"..."}`

## Overview
This API handles consultation requests from the frontend, stores them in SQL Server, and forwards them via SendGrid email to `csrequestforwarding@glowra.com`. It includes automatic retry logic with exponential backoff (5min, 30min, 2hr, 12hr, 24hr) and manual reprocessing capabilities.

## Main Endpoint: POST `/api/consultation-requests`

### Request Format
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",              // Required
  "lastName": "Doe",                 // Required
  "email": "john.doe@example.com",  // Required, must be valid email
  "phone": "+1234567890",            // Optional, can be null
  "message": "I'm interested in Botox treatments",  // Optional, can be null
  "clinicId": "clinic-123",          // Required
  "clinicName": "Beautiful Skin Clinic",  // Required
  "selectedProcedures": [            // Optional array
    {
      "id": "proc-1",
      "name": "Botox Injection",
      "price": 500.00
    },
    {
      "id": "proc-2",
      "name": "Dermal Fillers",
      "price": 750.00
    }
  ]
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "requestId": "52056483-d93d-41cf-be8b-0739a536e00c",
  "message": "Consultation request received successfully"
}
```

### Error Responses

**400 Bad Request - Validation Failed:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "firstName": "First name is required",
    "email": "Invalid email format"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "requestId": "52056483-d93d-41cf-be8b-0739a536e00c"  // Included if request was stored
}
```

## Manual Reprocessing Endpoint: POST `/api/consultation-requests/{requestId}/reprocess`

Use this if you need to manually retry a failed request.

**Request:**
```
POST /api/consultation-requests/52056483-d93d-41cf-be8b-0739a536e00c/reprocess
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Request queued for reprocessing",
  "requestId": "52056483-d93d-41cf-be8b-0739a536e00c",
  "status": "retrying"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Request not found"
}
```

## Important Behavior

### Request Storage
- **All requests are stored in the database** before processing (safety net)
- Requests are stored even if initial email sending fails
- Each request gets a unique `requestId` (UUID) that's returned in the response

### Email Forwarding
- Emails are sent immediately upon request creation
- Recipient: `csrequestforwarding@glowra.com`
- Email format includes all request details, clinic info, selected procedures, and total estimate
- Subject format: `New Consultation Request - {clinicName} - {requestId}`

### Automatic Retry Logic
If email sending fails, the system automatically retries:
- Retry 1: 5 minutes after creation
- Retry 2: 30 minutes after creation
- Retry 3: 2 hours after creation
- Retry 4: 12 hours after creation
- Retry 5: 24 hours after creation
- After 5 failed attempts, status becomes `failed` and no further automatic retries occur

### Request Statuses
- `pending`: Initial state, not yet processed
- `processing`: Currently being processed
- `sent`: Successfully sent via email
- `retrying`: Currently in retry queue
- `failed`: Failed after all retries exhausted

## Integration Example

```javascript
async function submitConsultationRequest(requestData) {
  try {
    const response = await fetch('https://your-api-url.com/api/consultation-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        email: requestData.email,
        phone: requestData.phone || null,
        message: requestData.message || null,
        clinicId: requestData.clinicId,
        clinicName: requestData.clinicName,
        selectedProcedures: requestData.selectedProcedures || []
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Save requestId for potential manual reprocessing
      console.log('Request ID:', result.requestId);
      return result;
    } else {
      // Handle validation errors
      if (result.details) {
        // Show field-specific errors to user
        console.error('Validation errors:', result.details);
      }
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to submit consultation request:', error);
    throw error;
  }
}
```

## Required Fields
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required, must be valid email format)
- `clinicId` (string, required)
- `clinicName` (string, required)

## Optional Fields
- `phone` (string, nullable)
- `message` (string, nullable, max 5000 characters)
- `selectedProcedures` (array of objects with `id`, `name`, `price`)

## Notes for Frontend Integration
1. **Always capture the `requestId`** from the response - useful for tracking and manual reprocessing
2. **Handle validation errors** - the API returns detailed field-level errors in `details` object
3. **Request is async** - email sending happens in the background, so don't wait for email delivery confirmation
4. **Retry logic is automatic** - if email fails, the system handles retries automatically
5. **Use manual reprocessing** endpoint only if you need to manually retry a specific request (e.g., admin dashboard)

## Tech Stack
- Node.js/Express.js API
- SQL Server database
- SendGrid for email delivery
- Background worker (runs every 5 minutes) for automatic retries

