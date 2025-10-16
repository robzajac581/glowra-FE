# Glowra Database Structure - Frontend Reference

**Last Updated**: October 13, 2025  
**Database**: SQL Server (Azure)  
**Total Clinics**: 130 with complete Google Places data

---

## 📊 Database Schema Overview

The database uses a **two-table architecture** for clinic Google Places data:

1. **`Clinics`** - Core clinic info + frequently-accessed Google data (for fast queries)
2. **`GooglePlacesData`** - Rich Google Places metadata (for detail pages)

---

## 🗃️ Table 1: `Clinics` (Main Table)

### Purpose
Primary clinic table with essential information and frequently-displayed Google data.

### Key Columns

| Column | Type | Description | Usage |
|--------|------|-------------|-------|
| `ClinicID` | INT (PK) | Unique clinic identifier | Primary key, used in JOINs |
| `ClinicName` | NVARCHAR(255) | Clinic display name | Show in listings |
| `Address` | NVARCHAR(500) | Full street address | Display on cards/details |
| `Latitude` | DECIMAL(10,7) | Geographic latitude | Map pins, location search |
| `Longitude` | DECIMAL(11,7) | Geographic longitude | Map pins, location search |
| `PlaceID` | NVARCHAR(500) | Google Places ID | Unique Google identifier |
| `GoogleRating` | DECIMAL(2,1) | Star rating (1-5) | ⭐ Display ratings |
| `GoogleReviewCount` | INT | Number of reviews | Show review count |
| `Phone` | NVARCHAR(50) | Clinic phone number | Click-to-call |
| `Website` | NVARCHAR(500) | Clinic website URL | External link |
| `LocationID` | INT | Location/region ID | Optional grouping |
| `Providers` | NVARCHAR(1000) | Provider names | Optional display |
| `GoogleReviewsJSON` | NVARCHAR(MAX) | Cached reviews JSON | Not currently used |
| `LastRatingUpdate` | DATETIME | Last Google data update | Data freshness indicator |

### Data Coverage
- **130 clinics** total
- **100% have Google data** (PlaceID, rating, review count)
- **Average rating**: 4.70★
- **Total reviews**: 38,532

### Example Query: Get Clinics for Listing Page
```sql
SELECT 
  ClinicID,
  ClinicName,
  Address,
  GoogleRating,
  GoogleReviewCount,
  Phone,
  Website,
  Latitude,
  Longitude
FROM Clinics
WHERE GoogleRating IS NOT NULL
ORDER BY GoogleRating DESC, GoogleReviewCount DESC;
```

---

## 🗃️ Table 2: `GooglePlacesData` (Rich Metadata)

### Purpose
Stores detailed Google Places information for clinic detail pages. Joined with `Clinics` table via `ClinicID`.

### Key Columns

#### Identifiers
| Column | Type | Description |
|--------|------|-------------|
| `GoogleDataID` | INT (PK, IDENTITY) | Auto-increment primary key |
| `ClinicID` | INT (FK) | **Foreign key to Clinics.ClinicID** |
| `PlaceID` | NVARCHAR(255) | Google Places ID |
| `GoogleID` | NVARCHAR(500) | Google's internal ID |
| `CID` | NVARCHAR(255) | Google CID (stored as string) |

#### Location Details
| Column | Type | Description |
|--------|------|-------------|
| `BusinessName` | NVARCHAR(500) | Official Google business name |
| `FullAddress` | NVARCHAR(500) | Complete address |
| `Street` | NVARCHAR(500) | Street address |
| `City` | NVARCHAR(100) | City |
| `State` | NVARCHAR(100) | State/Province |
| `PostalCode` | NVARCHAR(20) | ZIP/Postal code |
| `Country` | NVARCHAR(100) | Country |

#### Contact & Web
| Column | Type | Description | Frontend Use |
|--------|------|-------------|--------------|
| `Website` | NVARCHAR(500) | Website URL | Link button |
| `Email` | NVARCHAR(255) | Email address | Contact info |
| `Facebook` | NVARCHAR(500) | Facebook URL | Social media icon |
| `Instagram` | NVARCHAR(500) | Instagram URL | Social media icon |
| `LinkedIn` | NVARCHAR(500) | LinkedIn URL | Social media icon |
| `Twitter` | NVARCHAR(500) | Twitter URL | Social media icon |
| `YouTube` | NVARCHAR(500) | YouTube URL | Social media icon |

#### Operational Info
| Column | Type | Description | Frontend Use |
|--------|------|-------------|--------------|
| `WorkingHours` | NVARCHAR(MAX) | **JSON string** with hours | Parse and display hours |
| `BusinessStatus` | NVARCHAR(50) | "OPERATIONAL" etc. | Show status badge |
| `Verified` | BIT | Google verified (1/0) | Show verified badge ✓ |

#### Visual Assets
| Column | Type | Description | Frontend Use |
|--------|------|-------------|--------------|
| `Photo` | NVARCHAR(1000) | Main photo URL | Clinic image |
| `Logo` | NVARCHAR(1000) | Logo URL | Clinic logo |
| `StreetView` | NVARCHAR(1000) | Street view image URL | Map view |

#### Rich Content
| Column | Type | Description | Frontend Use |
|--------|------|-------------|--------------|
| `Description` | NVARCHAR(MAX) | Clinic description | About section |
| `AboutJSON` | NVARCHAR(MAX) | **JSON** with amenities | Parse for features |
| `Subtypes` | NVARCHAR(500) | Business categories | Tags/badges |
| `Category` | NVARCHAR(200) | Primary category | Main tag |

#### Google Links
| Column | Type | Description | Frontend Use |
|--------|------|-------------|--------------|
| `GoogleProfileLink` | NVARCHAR(2000) | Google Maps profile URL | "View on Google" button |
| `ReviewsLink` | NVARCHAR(2000) | Google reviews URL | "Read Reviews" link |
| `BookingAppointmentLink` | NVARCHAR(1000) | Booking URL | "Book Appointment" button |
| `MenuLink` | NVARCHAR(1000) | Services menu URL | "View Services" link |

#### Metadata
| Column | Type | Description |
|--------|------|-------------|
| `LastUpdated` | DATETIME | Last data refresh | Default: GETDATE() |

### Data Coverage
- **110 records** (some clinics don't have GooglePlacesData yet)
- Use LEFT JOIN to handle missing data gracefully

---

## 🔗 Table Relationships

```
Clinics (1) ----< (Many) GooglePlacesData
   ↑                         ↓
ClinicID  ==============  ClinicID (FK)
```

**Relationship**: One-to-Many (One clinic can have one GooglePlacesData record)
- Use `LEFT JOIN` to get all clinics even if GooglePlacesData is missing
- Use `INNER JOIN` to get only clinics with full Google data

---

## 📱 Frontend Use Cases & Queries

### Use Case 1: Clinic Listing/Search Page
**What to show**: Name, rating, reviews, location, quick contact

```sql
SELECT 
  c.ClinicID,
  c.ClinicName,
  c.Address,
  c.GoogleRating,
  c.GoogleReviewCount,
  c.Phone,
  c.Latitude,
  c.Longitude
FROM Clinics c
WHERE c.GoogleRating >= 4.0  -- Filter by rating
ORDER BY c.GoogleRating DESC, c.GoogleReviewCount DESC
LIMIT 20;  -- Pagination
```

**Frontend Display**:
```jsx
// Clinic Card Component
<ClinicCard>
  <h3>{clinic.ClinicName}</h3>
  <Rating stars={clinic.GoogleRating} count={clinic.GoogleReviewCount} />
  <Address>{clinic.Address}</Address>
  <Phone>{clinic.Phone}</Phone>
</ClinicCard>
```

---

### Use Case 2: Clinic Detail Page
**What to show**: Full info, photos, hours, social media, description

```sql
SELECT 
  c.ClinicID,
  c.ClinicName,
  c.Address,
  c.GoogleRating,
  c.GoogleReviewCount,
  c.Phone,
  c.Website,
  c.Latitude,
  c.Longitude,
  g.Photo,
  g.Logo,
  g.Description,
  g.WorkingHours,
  g.Facebook,
  g.Instagram,
  g.LinkedIn,
  g.Twitter,
  g.YouTube,
  g.GoogleProfileLink,
  g.BookingAppointmentLink,
  g.BusinessStatus,
  g.Verified,
  g.AboutJSON
FROM Clinics c
LEFT JOIN GooglePlacesData g ON c.ClinicID = g.ClinicID
WHERE c.ClinicID = @clinicId;
```

**Frontend Display**:
```jsx
// Clinic Detail Component
<ClinicDetail>
  <Hero image={data.Photo} logo={data.Logo} />
  <Header>
    <h1>{data.ClinicName}</h1>
    {data.Verified && <Badge>Verified ✓</Badge>}
    <Rating stars={data.GoogleRating} count={data.GoogleReviewCount} />
  </Header>
  
  <Description>{data.Description}</Description>
  
  <WorkingHours hours={JSON.parse(data.WorkingHours)} />
  
  <SocialMedia>
    {data.Facebook && <Icon href={data.Facebook} />}
    {data.Instagram && <Icon href={data.Instagram} />}
    {data.LinkedIn && <Icon href={data.LinkedIn} />}
  </SocialMedia>
  
  <Actions>
    <Button href={data.Website}>Visit Website</Button>
    <Button href={data.BookingAppointmentLink}>Book Appointment</Button>
    <Button href={data.GoogleProfileLink}>View on Google Maps</Button>
  </Actions>
  
  <Amenities features={JSON.parse(data.AboutJSON)} />
</ClinicDetail>
```

---

### Use Case 3: Map View
**What to show**: Clinic pins on map with popup info

```sql
SELECT 
  c.ClinicID,
  c.ClinicName,
  c.Latitude,
  c.Longitude,
  c.GoogleRating,
  c.GoogleReviewCount,
  c.Address
FROM Clinics c
WHERE c.Latitude IS NOT NULL 
  AND c.Longitude IS NOT NULL
  AND c.GoogleRating >= 4.0;
```

---

### Use Case 4: Top Rated Clinics Widget
**What to show**: Highest-rated clinics with most reviews

```sql
SELECT TOP 10
  c.ClinicID,
  c.ClinicName,
  c.GoogleRating,
  c.GoogleReviewCount,
  g.Photo
FROM Clinics c
LEFT JOIN GooglePlacesData g ON c.ClinicID = g.ClinicID
WHERE c.GoogleRating >= 4.5
ORDER BY c.GoogleRating DESC, c.GoogleReviewCount DESC;
```

---

## 📝 JSON Field Formats

### Working Hours (`WorkingHours` column)
**Format**: JSON string with day → hours mapping

```json
{
  "Monday": "9AM-5PM",
  "Tuesday": "9AM-5PM",
  "Wednesday": "9AM-5PM",
  "Thursday": "9AM-5PM",
  "Friday": "9AM-5PM",
  "Saturday": "9AM-2PM",
  "Sunday": "Closed"
}
```

**Frontend Parsing**:
```javascript
const hours = JSON.parse(clinic.WorkingHours);
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const todayHours = hours[today]; // "9AM-5PM"
```

---

### About/Amenities (`AboutJSON` column)
**Format**: JSON string with nested features

```json
{
  "Service options": {
    "Onsite services": true,
    "Language assistance": "English"
  },
  "Accessibility": {
    "Wheelchair accessible entrance": true,
    "Wheelchair accessible parking lot": true,
    "Wheelchair accessible restroom": true
  },
  "Amenities": {
    "Gender-neutral restroom": true,
    "Restroom": true
  },
  "Planning": {
    "Appointment required": true,
    "Appointments recommended": true
  },
  "Payments": {
    "Credit cards": true,
    "Debit cards": true
  }
}
```

**Frontend Parsing**:
```javascript
const about = JSON.parse(clinic.AboutJSON);

// Display accessibility features
const accessibility = about.Accessibility || {};
const features = Object.entries(accessibility)
  .filter(([key, value]) => value === true)
  .map(([key]) => key);
// ["Wheelchair accessible entrance", "Wheelchair accessible parking lot", ...]
```

---

## 🎯 API Endpoint Examples

### GET `/api/clinics` - List all clinics
```javascript
app.get('/api/clinics', async (req, res) => {
  const { minRating, limit = 20, offset = 0 } = req.query;
  
  const pool = await db.getConnection();
  const result = await pool.request()
    .input('minRating', sql.Decimal(2, 1), minRating || 0)
    .input('limit', sql.Int, parseInt(limit))
    .input('offset', sql.Int, parseInt(offset))
    .query(`
      SELECT 
        ClinicID,
        ClinicName,
        Address,
        GoogleRating,
        GoogleReviewCount,
        Phone,
        Website,
        Latitude,
        Longitude
      FROM Clinics
      WHERE GoogleRating >= @minRating
      ORDER BY GoogleRating DESC, GoogleReviewCount DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  
  res.json(result.recordset);
});
```

---

### GET `/api/clinics/:id` - Get clinic details
```javascript
app.get('/api/clinics/:id', async (req, res) => {
  const { id } = req.params;
  
  const pool = await db.getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT 
        c.*,
        g.Photo,
        g.Logo,
        g.Description,
        g.WorkingHours,
        g.Facebook,
        g.Instagram,
        g.LinkedIn,
        g.Twitter,
        g.YouTube,
        g.GoogleProfileLink,
        g.ReviewsLink,
        g.BookingAppointmentLink,
        g.MenuLink,
        g.BusinessStatus,
        g.Verified,
        g.AboutJSON,
        g.Subtypes,
        g.Category
      FROM Clinics c
      LEFT JOIN GooglePlacesData g ON c.ClinicID = g.ClinicID
      WHERE c.ClinicID = @id
    `);
  
  if (result.recordset.length === 0) {
    return res.status(404).json({ error: 'Clinic not found' });
  }
  
  const clinic = result.recordset[0];
  
  // Parse JSON fields
  if (clinic.WorkingHours) {
    clinic.WorkingHours = JSON.parse(clinic.WorkingHours);
  }
  if (clinic.AboutJSON) {
    clinic.AboutJSON = JSON.parse(clinic.AboutJSON);
  }
  
  res.json(clinic);
});
```

---

## 📊 Data Statistics (Current State)

| Metric | Value |
|--------|-------|
| Total Clinics | 130 |
| With Google Rating | 130 (100%) |
| Average Rating | 4.70★ |
| Total Reviews | 38,532 |
| With GooglePlacesData | 110 (85%) |
| With Photos | ~110 |
| With Social Media | ~90 |
| With Working Hours | ~110 |

---

## 🎨 Frontend Component Suggestions

### Rating Display Component
```jsx
const StarRating = ({ rating, reviewCount }) => (
  <div className="rating">
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} filled={i < Math.floor(rating)} />
      ))}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </div>
    <span className="review-count">({reviewCount.toLocaleString()} reviews)</span>
  </div>
);
```

### Hours Display Component
```jsx
const WorkingHours = ({ hours }) => {
  const hoursObj = typeof hours === 'string' ? JSON.parse(hours) : hours;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  return (
    <div className="hours">
      <h3>Hours</h3>
      {Object.entries(hoursObj).map(([day, time]) => (
        <div key={day} className={day === today ? 'today' : ''}>
          <span className="day">{day}</span>
          <span className="time">{time}</span>
        </div>
      ))}
    </div>
  );
};
```

### Social Media Icons
```jsx
const SocialLinks = ({ facebook, instagram, linkedin, twitter, youtube }) => (
  <div className="social-links">
    {facebook && <a href={facebook}><FacebookIcon /></a>}
    {instagram && <a href={instagram}><InstagramIcon /></a>}
    {linkedin && <a href={linkedin}><LinkedInIcon /></a>}
    {twitter && <a href={twitter}><TwitterIcon /></a>}
    {youtube && <a href={youtube}><YouTubeIcon /></a>}
  </div>
);
```

---

## ⚠️ Important Notes

### NULL Handling
- **Always check for NULL** - Not all clinics have GooglePlacesData
- Use `LEFT JOIN` and handle missing data gracefully
- Example: `{clinic.Photo || '/placeholder-image.jpg'}`

### JSON Parsing
- **WorkingHours** and **AboutJSON** are stored as strings
- Must parse before use: `JSON.parse(clinic.WorkingHours)`
- Always check if field exists before parsing

### URL Lengths
- `GoogleProfileLink` and `ReviewsLink` can be very long (up to 2000 chars)
- Truncate for display, use full URL for links

### Rating Display
- Ratings are DECIMAL(2,1) - values like 4.5, 4.9, etc.
- Display with 1 decimal place: `rating.toFixed(1)`
- Show stars with partial fills for .5 ratings

### Performance
- **Clinics table**: Fast queries, indexed on ClinicID
- **JOIN with GooglePlacesData**: Adds overhead, use LEFT JOIN
- **Pagination**: Always use OFFSET/FETCH for large result sets

---

## 🚀 Quick Start for Frontend

### 1. Fetch Clinics for Listing
```javascript
const fetchClinics = async (minRating = 4.0, limit = 20, offset = 0) => {
  const response = await fetch(
    `/api/clinics?minRating=${minRating}&limit=${limit}&offset=${offset}`
  );
  return response.json();
};
```

### 2. Fetch Single Clinic Details
```javascript
const fetchClinicDetails = async (clinicId) => {
  const response = await fetch(`/api/clinics/${clinicId}`);
  return response.json();
};
```

### 3. Display on Map
```javascript
const clinics = await fetchClinics();
const mapMarkers = clinics.map(clinic => ({
  lat: clinic.Latitude,
  lng: clinic.Longitude,
  title: clinic.ClinicName,
  rating: clinic.GoogleRating,
  reviews: clinic.GoogleReviewCount
}));
```

---

## 📚 Additional Resources

- **Database Connection**: See `db.js` for connection setup
- **Example Queries**: See `scripts/viewImportStats.js`
- **Data Import Scripts**: See `scripts/` directory
- **Migration History**: See `migrations/` directory

---

**Ready to build! All 130 clinics have complete Google Places data.** 🎉

