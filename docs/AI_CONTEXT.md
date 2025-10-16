# Glowra Database Context for Frontend AI

## Database Overview
- **Database**: SQL Server (Azure)
- **Total Clinics**: 130 with 100% Google Places data coverage
- **Average Rating**: 4.70★ | **Total Reviews**: 38,532

---

## Table Structure

### `Clinics` Table (Main - Fast Access)
Primary table with essential clinic info + frequently-accessed Google data.

**Key Columns for Frontend**:
```
ClinicID (INT, PK)           - Unique identifier
ClinicName (NVARCHAR)        - Display name
Address (NVARCHAR)           - Full address
Latitude/Longitude (DECIMAL) - Map coordinates
GoogleRating (DECIMAL)       - 1-5 star rating
GoogleReviewCount (INT)      - Number of reviews
Phone (NVARCHAR)             - Contact number
Website (NVARCHAR)           - Website URL
PlaceID (NVARCHAR)           - Google Places ID
LastRatingUpdate (DATETIME)  - Last data refresh
```

### `GooglePlacesData` Table (Rich Details)
Stores detailed Google Places metadata. **Join via ClinicID (FK)**.

**Key Columns for Frontend**:
```
ClinicID (INT, FK)                  - Links to Clinics table
Photo/Logo/StreetView (NVARCHAR)    - Image URLs
Description (NVARCHAR)              - Clinic description
WorkingHours (NVARCHAR)             - JSON: {"Monday": "9AM-5PM", ...}
AboutJSON (NVARCHAR)                - JSON: amenities, accessibility
Facebook/Instagram/LinkedIn/etc     - Social media URLs
GoogleProfileLink (NVARCHAR)        - Google Maps link
BookingAppointmentLink (NVARCHAR)   - Booking URL
BusinessStatus (NVARCHAR)           - "OPERATIONAL"
Verified (BIT)                      - Google verified (1/0)
```

---

## Common Queries

### Clinic Listing (with ratings)
```sql
SELECT ClinicID, ClinicName, Address, GoogleRating, GoogleReviewCount, Phone, Latitude, Longitude
FROM Clinics
WHERE GoogleRating >= 4.0
ORDER BY GoogleRating DESC, GoogleReviewCount DESC;
```

### Clinic Details (with rich data)
```sql
SELECT c.*, g.Photo, g.Description, g.WorkingHours, g.Facebook, g.Instagram, 
       g.GoogleProfileLink, g.BookingAppointmentLink, g.Verified, g.AboutJSON
FROM Clinics c
LEFT JOIN GooglePlacesData g ON c.ClinicID = g.ClinicID
WHERE c.ClinicID = @id;
```

---

## JSON Fields (Must Parse)

### WorkingHours
```json
{"Monday": "9AM-5PM", "Tuesday": "9AM-5PM", ..., "Sunday": "Closed"}
```
**Usage**: `const hours = JSON.parse(clinic.WorkingHours);`

### AboutJSON
```json
{
  "Accessibility": {"Wheelchair accessible entrance": true, ...},
  "Payments": {"Credit cards": true, ...},
  "Service options": {"Onsite services": true}
}
```
**Usage**: `const amenities = JSON.parse(clinic.AboutJSON);`

---

## Frontend Display Examples

### Clinic Card
```jsx
<ClinicCard>
  <h3>{clinic.ClinicName}</h3>
  <Rating stars={clinic.GoogleRating} count={clinic.GoogleReviewCount} />
  <p>{clinic.Address}</p>
  <a href={`tel:${clinic.Phone}`}>{clinic.Phone}</a>
</ClinicCard>
```

### Clinic Detail Page
```jsx
<ClinicDetail>
  <img src={data.Photo} />
  <h1>{data.ClinicName} {data.Verified && '✓'}</h1>
  <Rating stars={data.GoogleRating} count={data.GoogleReviewCount} />
  <p>{data.Description}</p>
  <WorkingHours hours={JSON.parse(data.WorkingHours)} />
  <SocialLinks 
    facebook={data.Facebook} 
    instagram={data.Instagram} 
  />
  <Button href={data.BookingAppointmentLink}>Book Appointment</Button>
  <Button href={data.GoogleProfileLink}>View on Google Maps</Button>
</ClinicDetail>
```

---

## API Endpoints (Suggested)

### GET `/api/clinics`
Returns clinic list with ratings. Supports: `?minRating=4.0&limit=20&offset=0`

### GET `/api/clinics/:id`
Returns full clinic details with GooglePlacesData joined.

### GET `/api/clinics/top-rated`
Returns top 10 highest-rated clinics.

---

## Important Notes

- **Always use LEFT JOIN** - Not all clinics have GooglePlacesData (110/130 do)
- **Parse JSON fields** - WorkingHours and AboutJSON are stored as strings
- **Handle NULLs** - Check existence before displaying (e.g., `clinic.Photo || '/placeholder.jpg'`)
- **100% have ratings** - All 130 clinics have GoogleRating and GoogleReviewCount
- **Use ClinicID** - Primary key for all operations

---

## Database Connection
```javascript
const { sql, db } = require('./db');
const pool = await db.getConnection();
// ... queries
await db.close();
```

---

**All data is ready for frontend integration. Build amazing clinic pages!** 🚀

