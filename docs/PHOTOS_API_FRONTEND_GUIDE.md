# Frontend Guide: Clinic Photos API

**For**: Frontend Developers  
**Date**: October 17, 2025  
**Status**: Ready to Implement  

---

## 🎯 What Changed?

### ❌ Old Way (Deprecated)

Previously, you received a single photo URL from the clinic details endpoint:

```javascript
// OLD - Don't use this anymore
const clinic = await fetch(`/api/clinics/${clinicId}`);
const photoUrl = clinic.Photo;        // Single photo from GooglePlacesData table
const streetView = clinic.StreetView; // Street view image
```

**Problems with the old approach:**
- ❌ Only 1-2 photos per clinic
- ❌ Single size (not optimized for different uses)
- ❌ No gallery support
- ❌ Limited metadata

### ✅ New Way (Use This!)

Now, you have a dedicated photos endpoint that provides:

```javascript
// NEW - Use this instead
const response = await fetch(`/api/clinics/${clinicId}/photos`);
const { photos } = await response.json();
// Returns array of 10-20 photos with multiple sizes!
```

**Benefits of the new approach:**
- ✅ 10-20 high-quality photos per clinic
- ✅ Multiple sizes (thumbnail, medium, large)
- ✅ Optimized for different use cases (cards, galleries, hero images)
- ✅ Rich metadata (dimensions, attributions, etc.)
- ✅ Better performance (Google's CDN)
- ✅ SEO-friendly

---

## 🚀 Migration Guide

### Step 1: Replace Single Photo Usage

**Before:**
```jsx
function ClinicCard({ clinic }) {
  return (
    <div className="card">
      <img src={clinic.Photo} alt={clinic.ClinicName} />
      <h3>{clinic.ClinicName}</h3>
    </div>
  );
}
```

**After:**
```jsx
function ClinicCard({ clinic }) {
  const [primaryPhoto, setPrimaryPhoto] = useState(null);
  
  useEffect(() => {
    // Fetch just the primary/featured photo
    fetch(`/api/clinics/${clinic.ClinicID}/photos?primary=true`)
      .then(res => res.json())
      .then(data => {
        if (data.photos.length > 0) {
          setPrimaryPhoto(data.photos[0]);
        }
      });
  }, [clinic.ClinicID]);
  
  return (
    <div className="card">
      {primaryPhoto ? (
        <img 
          src={primaryPhoto.urls.thumbnail}  // Use thumbnail for cards
          alt={clinic.ClinicName}
          width={400}  // Prevents layout shift
          height={300}
          loading="lazy"  // Better performance
        />
      ) : (
        <img src="/placeholder.jpg" alt={clinic.ClinicName} />
      )}
      <h3>{clinic.ClinicName}</h3>
    </div>
  );
}
```

### Step 2: Add Photo Galleries

Now you can create beautiful photo galleries:

```jsx
function ClinicGallery({ clinicId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos?limit=20`)
      .then(res => res.json())
      .then(data => {
        setPhotos(data.photos);
        setLoading(false);
      });
  }, [clinicId]);
  
  if (loading) return <div>Loading photos...</div>;
  if (photos.length === 0) return <div>No photos available</div>;
  
  return (
    <div className="photo-gallery">
      <h2>Clinic Photos ({photos.length})</h2>
      <div className="gallery-grid">
        {photos.map(photo => (
          <div key={photo.photoId} className="gallery-item">
            <img 
              src={photo.urls.medium}  // Use medium size for gallery
              alt="Clinic"
              loading="lazy"
              width={photo.width}
              height={photo.height}
              onClick={() => openLightbox(photo.urls.large)}
            />
            {photo.attribution && (
              <span className="attribution">
                Photo by {photo.attribution}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 3: Optimize Hero Images

Replace the old single photo with an optimized hero image:

**Before:**
```jsx
<div className="hero" style={{ backgroundImage: `url(${clinic.Photo})` }}>
  <h1>{clinic.ClinicName}</h1>
</div>
```

**After:**
```jsx
function ClinicHero({ clinicId, clinicName }) {
  const [heroPhoto, setHeroPhoto] = useState(null);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos?primary=true`)
      .then(res => res.json())
      .then(data => {
        if (data.photos.length > 0) {
          setHeroPhoto(data.photos[0]);
        }
      });
  }, [clinicId]);
  
  return (
    <div className="hero">
      {heroPhoto && (
        <img 
          src={heroPhoto.urls.large}  // Use large for hero images
          alt={clinicName}
          className="hero-image"
          loading="eager"  // Load immediately (above fold)
          width={heroPhoto.width}
          height={heroPhoto.height}
        />
      )}
      <div className="hero-content">
        <h1>{clinicName}</h1>
      </div>
    </div>
  );
}
```

---

## 📡 API Reference

### Endpoint: `GET /api/clinics/:clinicId/photos`

Get photos for a specific clinic.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clinicId` | number | Yes | Clinic ID (in URL path) |
| `primary` | boolean | No | If `true`, returns only the featured photo |
| `limit` | number | No | Maximum number of photos to return |

#### Examples

```bash
# Get all photos for clinic ID 1
GET /api/clinics/1/photos

# Get only the primary/featured photo
GET /api/clinics/1/photos?primary=true

# Get first 5 photos
GET /api/clinics/1/photos?limit=5
```

#### Response Format

```json
{
  "clinicId": 1,
  "count": 18,
  "photos": [
    {
      "photoId": 1,
      "url": "https://maps.googleapis.com/.../photo?...&maxwidth=1600",
      "urls": {
        "thumbnail": "https://...&maxwidth=400",
        "medium": "https://...&maxwidth=800",
        "large": "https://...&maxwidth=1600"
      },
      "width": 4032,
      "height": 3024,
      "attribution": "John Doe",
      "isPrimary": true,
      "displayOrder": 0,
      "lastUpdated": "2025-10-17T10:30:00.000Z"
    },
    // ... more photos
  ]
}
```

#### Photo Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `photoId` | number | Unique photo identifier |
| `url` | string | Full size photo URL (1600px max) |
| `urls.thumbnail` | string | Thumbnail size (400px) - use for cards/lists |
| `urls.medium` | string | Medium size (800px) - use for gallery previews |
| `urls.large` | string | Large size (1600px) - use for full screen |
| `width` | number | Original photo width in pixels |
| `height` | number | Original photo height in pixels |
| `attribution` | string | Photographer/source (required by Google TOS) |
| `isPrimary` | boolean | `true` for the featured photo |
| `displayOrder` | number | Order for displaying (0 = first) |
| `lastUpdated` | string | ISO timestamp of last refresh |

---

## 🎨 Use Cases & Examples

### Use Case 1: Clinic Cards/List View

**Best practice**: Use thumbnail size for fast loading

```jsx
function ClinicCard({ clinic }) {
  const [photo, setPhoto] = useState(null);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinic.ClinicID}/photos?primary=true`)
      .then(res => res.json())
      .then(data => setPhoto(data.photos[0] || null))
      .catch(() => setPhoto(null));
  }, [clinic.ClinicID]);
  
  return (
    <div className="clinic-card">
      <div className="card-image">
        {photo ? (
          <img 
            src={photo.urls.thumbnail}  // 400px - fast loading
            alt={clinic.ClinicName}
            width={400}
            height={300}
            loading="lazy"
          />
        ) : (
          <div className="placeholder-image" />
        )}
      </div>
      <div className="card-content">
        <h3>{clinic.ClinicName}</h3>
        <p>⭐ {clinic.GoogleRating} ({clinic.GoogleReviewCount} reviews)</p>
      </div>
    </div>
  );
}
```

### Use Case 2: Clinic Detail Page Hero

**Best practice**: Use large size with responsive images

```jsx
function ClinicDetailHero({ clinicId, clinicName }) {
  const [photo, setPhoto] = useState(null);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos?primary=true`)
      .then(res => res.json())
      .then(data => setPhoto(data.photos[0] || null));
  }, [clinicId]);
  
  if (!photo) return null;
  
  return (
    <div className="hero-section">
      <img 
        // Responsive images - browser picks best size
        srcSet={`
          ${photo.urls.thumbnail} 400w,
          ${photo.urls.medium} 800w,
          ${photo.urls.large} 1600w
        `}
        sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px"
        src={photo.urls.large}
        alt={clinicName}
        className="hero-image"
        width={photo.width}
        height={photo.height}
        loading="eager"  // Load immediately
      />
      <div className="hero-overlay">
        <h1>{clinicName}</h1>
      </div>
    </div>
  );
}
```

### Use Case 3: Photo Gallery with Lightbox

**Best practice**: Use medium for grid, large for lightbox

```jsx
import { useState } from 'react';

function PhotoGallery({ clinicId }) {
  const [photos, setPhotos] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos`)
      .then(res => res.json())
      .then(data => setPhotos(data.photos));
  }, [clinicId]);
  
  return (
    <>
      <div className="photo-gallery">
        {photos.map(photo => (
          <div 
            key={photo.photoId}
            className="gallery-item"
            onClick={() => setLightboxPhoto(photo)}
          >
            <img 
              src={photo.urls.medium}  // 800px for grid
              alt="Clinic"
              loading="lazy"
              width={800}
              height={600}
            />
          </div>
        ))}
      </div>
      
      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="lightbox" onClick={() => setLightboxPhoto(null)}>
          <img 
            src={lightboxPhoto.urls.large}  // 1600px for full view
            alt="Clinic"
            className="lightbox-image"
          />
          {lightboxPhoto.attribution && (
            <div className="attribution">
              Photo by {lightboxPhoto.attribution}
            </div>
          )}
        </div>
      )}
    </>
  );
}
```

### Use Case 4: Mobile-Optimized Carousel

**Best practice**: Use medium size, lazy load off-screen images

```jsx
import { useState, useRef } from 'react';

function MobilePhotoCarousel({ clinicId }) {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos?limit=10`)
      .then(res => res.json())
      .then(data => setPhotos(data.photos));
  }, [clinicId]);
  
  const scrollToPhoto = (index) => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.scrollTo({
        left: index * carousel.offsetWidth,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };
  
  return (
    <div className="mobile-carousel">
      <div 
        ref={carouselRef}
        className="carousel-container"
        style={{ overflowX: 'scroll', display: 'flex' }}
      >
        {photos.map((photo, index) => (
          <img 
            key={photo.photoId}
            src={photo.urls.medium}  // 800px - good for mobile
            alt="Clinic"
            loading={index < 2 ? 'eager' : 'lazy'}  // Eager load first 2
            style={{ minWidth: '100%', height: 'auto' }}
          />
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="carousel-dots">
        {photos.map((_, index) => (
          <button
            key={index}
            className={currentIndex === index ? 'active' : ''}
            onClick={() => scrollToPhoto(index)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Use Case 5: SEO-Optimized Image (with Schema Markup)

**Best practice**: Add structured data for search engines

```jsx
function SEOClinicImage({ clinicId, clinicName }) {
  const [photo, setPhoto] = useState(null);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos?primary=true`)
      .then(res => res.json())
      .then(data => setPhoto(data.photos[0] || null));
  }, [clinicId]);
  
  if (!photo) return null;
  
  // Schema.org markup for SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": clinicName,
    "image": photo.urls.large,
    "photo": photo.urls.large
  };
  
  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <img 
        src={photo.urls.large}
        alt={`${clinicName} - Medical Clinic`}
        width={photo.width}
        height={photo.height}
        itemProp="image"
      />
    </>
  );
}
```

---

## 🎯 Best Practices

### 1. Choose the Right Image Size

| Use Case | Size to Use | Why |
|----------|-------------|-----|
| Clinic cards/list | `thumbnail` (400px) | Fast loading, small file size (~20-40 KB) |
| Gallery grid | `medium` (800px) | Good quality, reasonable size (~80-150 KB) |
| Hero images | `large` (1600px) | Best quality for large displays (~200-400 KB) |
| Lightbox/modal | `large` (1600px) | Full screen viewing |
| Mobile carousel | `medium` (800px) | Balance between quality and performance |

### 2. Always Include Width and Height

**Why**: Prevents Cumulative Layout Shift (CLS) - important for Core Web Vitals

```jsx
// ✅ Good - prevents layout shift
<img 
  src={photo.urls.medium}
  width={photo.width}
  height={photo.height}
  alt="Clinic"
/>

// ❌ Bad - causes layout shift as image loads
<img 
  src={photo.urls.medium}
  alt="Clinic"
/>
```

### 3. Use Lazy Loading (Except Above-the-Fold)

```jsx
// ✅ Above the fold (hero) - load immediately
<img src={photo.urls.large} loading="eager" />

// ✅ Below the fold (gallery) - lazy load
<img src={photo.urls.medium} loading="lazy" />
```

### 4. Always Display Photo Attribution

**Required by Google Terms of Service:**

```jsx
{photo.attribution && (
  <span className="photo-attribution">
    Photo by {photo.attribution}
  </span>
)}
```

### 5. Use Responsive Images for Better Performance

```jsx
<img 
  srcSet={`
    ${photo.urls.thumbnail} 400w,
    ${photo.urls.medium} 800w,
    ${photo.urls.large} 1600w
  `}
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px"
  src={photo.urls.large}
  alt="Clinic"
/>
```

### 6. Handle Loading and Error States

```jsx
function ClinicPhoto({ clinicId }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    fetch(`/api/clinics/${clinicId}/photos?primary=true`)
      .then(res => res.json())
      .then(data => {
        setPhoto(data.photos[0] || null);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [clinicId]);
  
  if (loading) return <div className="skeleton-loader" />;
  if (error || !photo) return <img src="/placeholder.jpg" alt="Clinic" />;
  
  return (
    <img 
      src={photo.urls.medium}
      alt="Clinic"
      width={photo.width}
      height={photo.height}
    />
  );
}
```

### 7. Implement Skeleton Loaders for Better UX

```jsx
function PhotoSkeleton() {
  return (
    <div className="photo-skeleton">
      <div className="skeleton-shimmer" />
    </div>
  );
}

// CSS
.photo-skeleton {
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 🔄 Caching Strategy

### Frontend Caching

**Option 1: React Query (Recommended)**

```jsx
import { useQuery } from '@tanstack/react-query';

function useClinicPhotos(clinicId, options = {}) {
  return useQuery({
    queryKey: ['clinic-photos', clinicId],
    queryFn: async () => {
      const res = await fetch(`/api/clinics/${clinicId}/photos`);
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    ...options
  });
}

// Usage
function ClinicGallery({ clinicId }) {
  const { data, isLoading, error } = useClinicPhotos(clinicId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading photos</div>;
  
  return (
    <div className="gallery">
      {data.photos.map(photo => (
        <img key={photo.photoId} src={photo.urls.medium} alt="Clinic" />
      ))}
    </div>
  );
}
```

**Option 2: SWR**

```jsx
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

function ClinicGallery({ clinicId }) {
  const { data, error } = useSWR(
    `/api/clinics/${clinicId}/photos`,
    fetcher,
    { revalidateOnFocus: false }
  );
  
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  
  return (
    <div className="gallery">
      {data.photos.map(photo => (
        <img key={photo.photoId} src={photo.urls.medium} alt="Clinic" />
      ))}
    </div>
  );
}
```

---

## ⚡ Performance Tips

### 1. Prefetch Photos on Hover

```jsx
function ClinicCard({ clinic }) {
  const handleMouseEnter = () => {
    // Prefetch photos when user hovers over card
    fetch(`/api/clinics/${clinic.ClinicID}/photos?primary=true`);
  };
  
  return (
    <div className="card" onMouseEnter={handleMouseEnter}>
      <Link to={`/clinics/${clinic.ClinicID}`}>
        {clinic.ClinicName}
      </Link>
    </div>
  );
}
```

### 2. Use Intersection Observer for Lazy Loading

```jsx
import { useEffect, useRef, useState } from 'react';

function LazyPhoto({ photo }) {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef}>
      {isVisible ? (
        <img src={photo.urls.medium} alt="Clinic" />
      ) : (
        <div className="placeholder" style={{ height: 300 }} />
      )}
    </div>
  );
}
```

### 3. Optimize for Mobile

```jsx
function ResponsiveClinicImage({ photo }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <img 
      src={isMobile ? photo.urls.thumbnail : photo.urls.medium}
      alt="Clinic"
      loading="lazy"
    />
  );
}
```

---

## 🐛 Troubleshooting

### Issue: Photos not loading

**Check:**
1. Is the API endpoint correct? `/api/clinics/${clinicId}/photos`
2. Does the clinic have photos? Check response: `data.count`
3. Check browser console for errors
4. Verify API is returning data: `curl http://localhost:3001/api/clinics/1/photos`

### Issue: Images load slowly

**Solutions:**
1. Use smaller sizes (thumbnail/medium instead of large)
2. Implement lazy loading
3. Add skeleton loaders for better perceived performance
4. Use responsive images with `srcSet`

### Issue: Layout shifts when images load

**Solution:** Always specify width and height:

```jsx
<img 
  src={photo.urls.medium}
  width={photo.width}
  height={photo.height}  // Prevents layout shift
  alt="Clinic"
/>
```

---

## 📊 Migration Checklist

- [ ] Replace `clinic.Photo` with photos API in clinic cards
- [ ] Replace `clinic.StreetView` with photos API (use primary photo)
- [ ] Update hero/banner images to use new API
- [ ] Add photo galleries to clinic detail pages
- [ ] Implement lazy loading for below-fold images
- [ ] Add skeleton loaders for better UX
- [ ] Include photo attributions (Google TOS requirement)
- [ ] Add width/height to all images (prevent CLS)
- [ ] Use appropriate image sizes (thumbnail/medium/large)
- [ ] Test on mobile devices
- [ ] Verify Core Web Vitals scores (LCP, CLS, FID)

---

## 📞 Quick Reference

### API Endpoints

```bash
# Get all photos
GET /api/clinics/:id/photos

# Get featured photo only
GET /api/clinics/:id/photos?primary=true

# Get limited photos
GET /api/clinics/:id/photos?limit=5
```

### Image Sizes

| Size | Dimension | Use For | File Size |
|------|-----------|---------|-----------|
| `thumbnail` | 400px | Cards, lists, mobile | ~20-40 KB |
| `medium` | 800px | Galleries, previews | ~80-150 KB |
| `large` | 1600px | Hero, full screen | ~200-400 KB |

### Quick Copy-Paste: Fetch Primary Photo

```jsx
const [photo, setPhoto] = useState(null);

useEffect(() => {
  fetch(`/api/clinics/${clinicId}/photos?primary=true`)
    .then(res => res.json())
    .then(data => setPhoto(data.photos[0] || null));
}, [clinicId]);
```

---

## 🎉 Benefits for Frontend

✅ **Better UX**: Photo galleries instead of single images  
✅ **Faster Loading**: Optimized sizes for different uses  
✅ **Better SEO**: Google-indexed images, proper metadata  
✅ **Web Vitals**: Excellent LCP, CLS, FID scores  
✅ **Mobile-Friendly**: Responsive images automatically  
✅ **Easier Maintenance**: Centralized photo management  

---

**Questions?** Contact the backend team or check the [full documentation](./CLINIC_PHOTOS_GUIDE.md).

**Need Help?** See examples in this guide or the [Architecture Document](./PHOTO_ARCHITECTURE.md).

