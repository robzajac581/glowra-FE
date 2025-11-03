# Clinic Listing Request API Documentation

## Endpoint

**POST** `/api/clinic-listing-requests`

## Overview

This endpoint allows clinics to submit requests for either:
- **New clinic listings**: For clinics that want to be listed on Glowra
- **Listing adjustments**: For clinics that want to update or modify their existing listing

The endpoint stores the request in the database and sends an email notification to `list@glowra.com` with all submitted information.

## Request Body

All fields should be sent as JSON in the request body:

### Required Fields

- `clinicName` (string, max 255 characters): The name of the clinic
- `city` (string, max 255 characters): City where the clinic is located
- `state` (string, max 255 characters): State where the clinic is located
- `address` (string, max 500 characters): Full address of the clinic
- `email` (string, valid email format): Email address for contact
- `requestType` (string): Must be either `"new"` or `"adjustment"`

### Optional Fields

- `website` (string, max 500 characters, valid URL format): Clinic website URL
- `clinicCategory` (string, max 255 characters): Category/type of clinic
- `primaryContactName` (string, max 255 characters): Name of primary contact person
- `phone` (string, max 50 characters): Phone number
- `additionalDetails` (string, max 5000 characters): Additional details about the clinic listing
- `message` (string, max 5000 characters): Message to Glowra team

## Request Type Values

- `"new"`: Use this when submitting a request for a new clinic listing
- `"adjustment"`: Use this when submitting a request to update or modify an existing clinic listing

## Request Example

```json
{
  "clinicName": "Example Medical Clinic",
  "city": "Los Angeles",
  "state": "California",
  "address": "123 Main Street, Suite 100",
  "website": "https://www.exampleclinic.com",
  "clinicCategory": "Cosmetic Surgery",
  "primaryContactName": "John Doe",
  "email": "contact@exampleclinic.com",
  "phone": "(555) 123-4567",
  "additionalDetails": "Our clinic specializes in cosmetic procedures and has been operating for 10 years.",
  "message": "We would like to update our clinic hours and add new services.",
  "requestType": "adjustment"
}
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "sent",
  "message": "Clinic listing request received successfully"
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "clinicName": "Clinic name is required",
    "email": "Invalid email format"
  }
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Response Fields

- `success` (boolean): Indicates if the request was successful
- `requestId` (string, UUID): Unique identifier for the request
- `status` (string): Status of the request (`"sent"` if email was sent successfully, `"failed"` if email failed)
- `message` (string): Human-readable message about the request status
- `error` (string, on error): Error message
- `details` (object, on validation error): Object containing field-specific validation errors

## Usage Example

### JavaScript/Fetch

```javascript
const submitListingRequest = async (formData) => {
  try {
    const response = await fetch('/api/clinic-listing-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinicName: formData.clinicName,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        website: formData.website || null,
        clinicCategory: formData.clinicCategory || null,
        primaryContactName: formData.primaryContactName || null,
        email: formData.email,
        phone: formData.phone || null,
        additionalDetails: formData.additionalDetails || null,
        message: formData.message || null,
        requestType: formData.requestType // 'new' or 'adjustment'
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Request submitted successfully:', result.requestId);
      return result;
    } else {
      console.error('Validation errors:', result.details);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    throw error;
  }
};
```

### Axios

```javascript
import axios from 'axios';

const submitListingRequest = async (formData) => {
  try {
    const response = await axios.post('/api/clinic-listing-requests', {
      clinicName: formData.clinicName,
      city: formData.city,
      state: formData.state,
      address: formData.address,
      website: formData.website || null,
      clinicCategory: formData.clinicCategory || null,
      primaryContactName: formData.primaryContactName || null,
      email: formData.email,
      phone: formData.phone || null,
      additionalDetails: formData.additionalDetails || null,
      message: formData.message || null,
      requestType: formData.requestType // 'new' or 'adjustment'
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Handle validation errors
      console.error('Validation errors:', error.response.data.details);
    }
    throw error;
  }
};
```

## Notes

- All string fields are automatically trimmed of whitespace
- Email addresses are normalized (lowercased)
- If optional fields are not provided, send them as `null` or omit them entirely
- The endpoint stores requests in the database and sends an email synchronously
- If email sending fails, the request is still stored but marked with status `"failed"`
- The `requestId` can be used for tracking/reference purposes

## Email Notification

Upon successful submission, an email is automatically sent to `list@glowra.com` containing:
- Request type (New Listing or Adjustment)
- All clinic information (name, address, city, state, website, category)
- All contact information (email, primary contact name, phone)
- Additional details section (if provided)
- Message to Glowra (if provided)
- Request ID and submission timestamp

The email subject line format is:
`New Clinic Listing Request - [RequestType] - [ClinicName] - [RequestId]`

