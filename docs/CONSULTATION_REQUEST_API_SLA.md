# Consultation Request API - Backend Requirements

## Overview

This document specifies the backend API requirements for handling consultation requests from the frontend. The system should receive consultation requests, store them (at least temporarily), forward them via email to `csrequestforwarding@glowra.com`, and include retry logic with manual reprocessing capabilities to ensure requests don't get lost.

## API Endpoint Specification

### POST `/api/consultation-requests`

**Purpose**: Receive consultation request data from the frontend and process it.

#### Request Format

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",  // Optional, can be null
  "message": "I'm interested in Botox treatments",  // Optional, can be null
  "clinicId": "clinic-123",
  "clinicName": "Beautiful Skin Clinic",
  "selectedProcedures": [
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

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "requestId": "req-abc123xyz",
  "message": "Consultation request received successfully"
}
```

**Error Response (400 Bad Request):**
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

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Internal server error",
  "requestId": "req-abc123xyz"  // Include requestId if request was stored
}
```

## Email Forwarding Requirements

### Email Recipient
- **To**: `csrequestforwarding@glowra.com`
- **Subject**: `New Consultation Request - {clinicName} - {requestId}`

### Email Format
The email should include all relevant information from the request:

```
Subject: New Consultation Request - Beautiful Skin Clinic - req-abc123xyz

A new consultation request has been received:

CONTACT INFORMATION:
- Name: John Doe
- Email: john.doe@example.com
- Phone: +1234567890 (optional)

CLINIC INFORMATION:
- Clinic ID: clinic-123
- Clinic Name: Beautiful Skin Clinic

SELECTED PROCEDURES:
1. Botox Injection - $500.00
2. Dermal Fillers - $750.00

Total Estimate: $1,250.00

MESSAGE:
I'm interested in Botox treatments

---
Request ID: req-abc123xyz
Submitted: 2025-01-15 14:30:00 UTC
```

### Email Delivery
- The system should attempt to send the email immediately upon receiving the request
- If email delivery fails, the request should be stored for retry processing

## Request Storage Requirements

### Storage Strategy
1. **All requests must be stored** (at least temporarily) before processing
2. This serves as a safety net to ensure requests don't get lost
3. Requests should be stored even if initial email sending fails

### Required Fields in Storage
- `requestId` (unique identifier)
- `firstName`
- `lastName`
- `email`
- `phone` (nullable)
- `message` (nullable)
- `clinicId`
- `clinicName`
- `selectedProcedures` (JSON array)
- `status` (enum: 'pending', 'processing', 'sent', 'failed', 'retrying')
- `createdAt` (timestamp)
- `retryCount` (integer, default: 0)
- `lastRetryAt` (timestamp, nullable)
- `errorMessage` (text, nullable)

## Retry Logic Requirements

### Automatic Retry Mechanism
1. **Failed Email Delivery**: If email sending fails, automatically retry:
   - Initial retry: After 5 minutes
   - Second retry: After 30 minutes
   - Third retry: After 2 hours
   - Fourth retry: After 12 hours
   - Fifth retry: After 24 hours
   - Maximum retries: 5 attempts

2. **Retry Processing Cycle**:
   - Implement a background job/worker that runs on a cycle (e.g., every 5 minutes)
   - Process requests with status: `pending`, `retrying`, or `failed` (if retry count < max)
   - Update request status appropriately during processing

3. **Status Tracking**:
   - `pending`: Initial state, not yet processed
   - `processing`: Currently being processed
   - `sent`: Successfully sent
   - `failed`: Failed after all retries exhausted
   - `retrying`: Currently in retry queue

## Manual Reprocessing Endpoint

### POST `/api/consultation-requests/{requestId}/reprocess`

**Purpose**: Manually trigger reprocessing of a failed or pending request.

**Request:**
```
POST /api/consultation-requests/req-abc123xyz/reprocess
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Request queued for reprocessing",
  "requestId": "req-abc123xyz",
  "status": "retrying"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Request not found"
}
```

**Behavior:**
- Resets retry count to 0
- Sets status to `retrying`
- Queues request for immediate processing

## Error Handling Requirements

### Validation Errors (400)
- Validate required fields: `firstName`, `lastName`, `email`, `clinicId`
- Validate email format
- Return detailed error messages for each invalid field

### Server Errors (500)
- Log all errors with request context
- Store request even if initial processing fails
- Return requestId in error response so frontend can reference it

## Copy-Paste Ready Summary for Backend Team

```
API Endpoint: POST /api/consultation-requests
Request Body: { firstName, lastName, email, phone?, message?, clinicId, clinicName, selectedProcedures[] }
Response: { success: boolean, requestId: string, message?: string, error?: string }

Requirements:
1. Store all requests in database (safety net to ensure requests don't get lost)
2. Send email to csrequestforwarding@glowra.com immediately
3. If email fails, retry 5 times with exponential backoff (5min, 30min, 2hr, 12hr, 24hr)
4. Background worker processes retries every 5 minutes on a cycle
5. Manual reprocessing endpoint: POST /api/consultation-requests/{requestId}/reprocess
6. Request statuses: pending, processing, sent, failed, retrying
7. Include requestId in all responses (success and error)
8. Validate required fields: firstName, lastName, email, clinicId
9. Email format: Plain text with all request details including clinic info and selected procedures
```
