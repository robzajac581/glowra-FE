# Photo Proxy Endpoint - Implementation Guide

## Overview

The backend now provides a photo proxy endpoint that resolves the Google Places API rate limiting issue. This endpoint handles authentication, caching, and graceful error handling for clinic photos.

**Status:** ✅ **IMPLEMENTED & READY FOR USE**

---

## Quick Start

### Old Implementation (Causing 429 Errors)
```javascript
// ❌ Don't do this - causes rate limiting
<img src={clinic.photoURL} alt={clinic.clinicName} />
```

### New Implementation (Recommended)
```javascript
// ✅ Do this - uses backend proxy with caching
<img 
  src={`${API_BASE_URL}/api/photos/clinic/${clinic.clinicId}`} 
  alt={clinic.clinicName} 
/>
```

---

## Endpoint Specification

### Request

**Method:** `GET`  
**URL:** `/api/photos/clinic/:clinicId`  
**Parameters:**
- `clinicId` (path parameter) - Integer - The clinic's unique ID

**Example:**
```
GET https://your-api.com/api/photos/clinic/42
```

### Response

**Success (200 OK):**
- **Content-Type:** `image/jpeg` or `image/png`
- **Body:** Binary image data
- **Headers:**
  - `Cache-Control: public, max-age=604800` (7 days)
  - `X-Cache: HIT` (cached) or `MISS` (freshly fetched)
  - `ETag: "hash"` (for browser caching)
  - `Last-Modified: <date>` (for conditional requests)

**Error Responses:**

| Status Code | Meaning | Response Body |
|-------------|---------|---------------|
| 400 | Invalid clinic ID | `{ "error": "Invalid clinic ID" }` |
| 404 | Clinic not found or no photo available | `{ "error": "Clinic not found" }` or `{ "error": "No photo available for this clinic" }` |
| 503 | Rate limited (temporary) | `{ "error": "Service temporarily unavailable due to rate limiting", "retryAfter": 60 }` |
| 500 | Server error | `{ "error": "Internal server error" }` |

---

## Implementation Examples

### React Component

```tsx
import React from 'react';

interface Clinic {
  clinicId: number;
  clinicName: string;
  photoURL?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const ClinicCard: React.FC<{ clinic: Clinic }> = ({ clinic }) => {
  const photoUrl = `${API_BASE_URL}/api/photos/clinic/${clinic.clinicId}`;
  
  return (
    <div className="clinic-card">
      <img
        src={photoUrl}
        alt={clinic.clinicName}
        loading="lazy"
        onError={(e) => {
          // Fallback to placeholder on error
          e.currentTarget.src = '/images/clinic-placeholder.jpg';
        }}
      />
      <h3>{clinic.clinicName}</h3>
    </div>
  );
};
```

### With Loading State

```tsx
import React, { useState } from 'react';

export const ClinicPhoto: React.FC<{ clinicId: number; alt: string }> = ({ 
  clinicId, 
  alt 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const photoUrl = `${API_BASE_URL}/api/photos/clinic/${clinicId}`;
  
  return (
    <div className="clinic-photo-container">
      {loading && <div className="skeleton-loader" />}
      {error && <div className="placeholder-image" />}
      <img
        src={photoUrl}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
};
```

### Search Results Grid

```tsx
import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const ClinicSearchResults: React.FC<{ clinics: Clinic[] }> = ({ clinics }) => {
  return (
    <div className="clinic-grid">
      {clinics.map((clinic) => (
        <div key={clinic.clinicId} className="clinic-card">
          <img
            src={`${API_BASE_URL}/api/photos/clinic/${clinic.clinicId}`}
            alt={clinic.clinicName}
            loading="lazy"
            className="clinic-photo"
            onError={(e) => {
              e.currentTarget.src = '/images/clinic-placeholder.jpg';
            }}
          />
          <div className="clinic-info">
            <h3>{clinic.clinicName}</h3>
            <p>{clinic.city}, {clinic.state}</p>
            <div className="rating">
              ⭐ {clinic.rating} ({clinic.reviewCount} reviews)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## How It Works

### Backend Flow

1. **Request Received:** Frontend requests `/api/photos/clinic/42`
2. **Database Lookup:** Backend queries the database for the clinic's Google Places photo URL
3. **Cache Check:** 
   - Checks if image exists in local cache (`.photo-cache/` directory)
   - Verifies cache is less than 7 days old
4. **Cache Hit:** 
   - Serves cached image immediately
   - Returns `X-Cache: HIT` header
5. **Cache Miss:** 
   - Fetches from Google Places API with authentication
   - Caches the image locally
   - Returns `X-Cache: MISS` header
6. **Error Handling:**
   - 429 errors → Returns 503 with `Retry-After` header
   - Other errors → Returns appropriate error code

### Caching Strategy

- **Duration:** 7 days (604,800 seconds)
- **Storage:** Filesystem cache in `.photo-cache/` directory
- **Cache Key:** MD5 hash of Google Places photo URL
- **Metadata:** Stored alongside image for content type tracking

### Benefits

✅ **No More Rate Limiting:** Backend uses authenticated API requests  
✅ **Fast Performance:** Cached images served instantly  
✅ **Reduced API Costs:** Each photo fetched once per week max  
✅ **Graceful Degradation:** Clear error handling with fallbacks  
✅ **Browser Caching:** Proper cache headers reduce unnecessary requests  

---

## Migration Checklist

### Backend ✅ Complete
- [x] Photo proxy endpoint implemented
- [x] Filesystem caching with 7-day expiration
- [x] Error handling for rate limits and API failures
- [x] Cache directory added to `.gitignore`
- [x] Proper HTTP headers for caching

### Frontend (Action Required)

- [ ] Update image sources to use proxy endpoint
- [ ] Update search results page component
- [ ] Update clinic detail page component  
- [ ] Add placeholder/fallback images for errors
- [ ] Test with multiple clinics (9+ per page)
- [ ] Verify no 429 errors occur
- [ ] Implement loading states for better UX

---

## Testing

### Manual Testing

1. **Basic fetch:**
   ```bash
   curl http://localhost:3001/api/photos/clinic/1 --output test.jpg
   ```

2. **Check cache header:**
   ```bash
   curl -I http://localhost:3001/api/photos/clinic/1
   # First request: X-Cache: MISS
   # Second request: X-Cache: HIT
   ```

3. **Test error handling:**
   ```bash
   # Invalid clinic ID
   curl http://localhost:3001/api/photos/clinic/99999
   
   # Non-numeric ID
   curl http://localhost:3001/api/photos/clinic/invalid
   ```

### Frontend Testing Checklist

- [ ] Load search page with 9+ clinics
- [ ] Verify all photos load without 429 errors
- [ ] Check browser DevTools Network tab for proper caching
- [ ] Test with slow network (throttling)
- [ ] Verify fallback images display on errors
- [ ] Check that loading states work correctly

---

## Performance Considerations

### Initial Load (Cache Miss)
- **First photo fetch:** ~500-1000ms (Google API request)
- **Subsequent loads:** <50ms (served from cache)

### Cached Load (Cache Hit)
- **Response time:** <50ms (filesystem read)
- **No external API calls**

### Bandwidth Optimization
- Images are cached server-side, reducing external requests
- Browser caching reduces server requests
- Lazy loading recommended for images below fold

---

## Troubleshooting

### Issue: Photos not loading
**Check:**
1. Backend server is running
2. Database has photo URLs for clinics
3. Google Places API key is valid
4. `.photo-cache/` directory has write permissions

### Issue: Still seeing 429 errors
**Solution:**
- Verify you're using the proxy endpoint, not direct Google URLs
- Check that `clinic.clinicId` is being passed correctly
- Ensure API_BASE_URL is configured properly

### Issue: Photos are outdated
**Solution:**
- Cache expires automatically after 7 days
- To force refresh: Delete `.photo-cache/` directory
- Or: Implement a cache-busting query parameter if needed

### Issue: Slow initial load
**Expected behavior:**
- First load fetches from Google (slower)
- Subsequent loads served from cache (fast)
- This is intentional to balance freshness and performance

---

## API Response Headers Explained

| Header | Example Value | Purpose |
|--------|---------------|---------|
| `Content-Type` | `image/jpeg` | Indicates image format |
| `Cache-Control` | `public, max-age=604800` | Browser should cache for 7 days |
| `X-Cache` | `HIT` or `MISS` | Indicates if served from cache |
| `ETag` | `"abc123..."` | For conditional requests |
| `Last-Modified` | `Mon, 01 Jan 2024...` | When image was cached |
| `Retry-After` | `60` | Wait time before retry (on 503) |

---

## Best Practices

### 1. Always Include Alt Text
```tsx
<img 
  src={photoUrl} 
  alt={`${clinic.clinicName} - Medical facility exterior`} 
/>
```

### 2. Implement Error Fallbacks
```tsx
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = '/images/clinic-placeholder.jpg';
  e.currentTarget.onerror = null; // Prevent infinite loop
};
```

### 3. Use Lazy Loading
```tsx
<img 
  src={photoUrl} 
  loading="lazy" 
  alt={clinic.clinicName}
/>
```

### 4. Consider Responsive Images
```tsx
<img 
  src={photoUrl}
  srcSet={`${photoUrl} 1x, ${photoUrl} 2x`}
  alt={clinic.clinicName}
/>
```

### 5. Monitor Cache Performance
Check `X-Cache` header in DevTools to ensure caching is working:
- First load: `X-Cache: MISS` ✅ Expected
- Reload: `X-Cache: HIT` ✅ Good performance

---

## Compatibility

### Data Structure Changes

The `/api/clinics/search-index` endpoint **remains unchanged**. It still returns:

```json
{
  "clinics": [
    {
      "clinicId": 1,
      "clinicName": "Example Clinic",
      "photoURL": "https://maps.googleapis.com/maps/api/place/photo?...",
      // ... other fields
    }
  ]
}
```

You can **ignore the `photoURL` field** and use `clinicId` with the proxy endpoint instead.

### Backward Compatibility

If you need to maintain backward compatibility temporarily:

```tsx
const getPhotoUrl = (clinic: Clinic) => {
  // New proxy endpoint (recommended)
  if (USE_PHOTO_PROXY) {
    return `${API_BASE_URL}/api/photos/clinic/${clinic.clinicId}`;
  }
  
  // Old direct URL (will have rate limiting issues)
  return clinic.photoURL || '/images/placeholder.jpg';
};
```

---

## Questions?

If you encounter any issues or need clarification:

1. Check this documentation first
2. Review the troubleshooting section
3. Test with the curl examples provided
4. Check backend logs for detailed error messages

---

## Summary

### What Changed
- ✅ New endpoint: `GET /api/photos/clinic/:clinicId`
- ✅ Server-side caching (7 days)
- ✅ Authenticated Google Places API requests
- ✅ Proper error handling

### What You Need to Do
1. Update image `src` attributes to use proxy endpoint
2. Replace `clinic.photoURL` with `${API_BASE_URL}/api/photos/clinic/${clinic.clinicId}`
3. Add error fallbacks
4. Test with search results page

### Expected Results
- ✅ No more 429 rate limit errors
- ✅ Fast image loading (cached)
- ✅ Better user experience
- ✅ Reduced API costs

**Ready to implement!** 🚀

