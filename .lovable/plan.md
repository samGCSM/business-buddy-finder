

## Bulk Search Improvements

### 1. Strict Radius Filtering

Google Places API treats radius as a preference, not a hard limit, so results outside your specified radius can appear. We will add client-side distance filtering.

**How it works:**
- After geocoding the search location, store the center coordinates (lat/lng)
- After fetching all results, calculate the distance from each business to the center using the Haversine formula
- Drop any business whose distance exceeds the user's selected radius
- This means you may get fewer than 20 results, but every result will genuinely be within your radius

### 2. Email Enrichment via Hunter.io

Google Places does not provide emails. We will use your existing Hunter.io integration to look up emails using the business website domain.

**How it works:**
- After the Places search returns results, for each business that has a website (not "N/A"), extract the domain
- Call the existing `enrich-prospect-email` edge function with each domain
- Populate the email field with the first result found (or keep "N/A" if nothing is found)
- Show a loading indicator while enrichment is in progress so the user isn't waiting with no feedback

---

### Technical Details

**File: `src/utils/googleApi.ts`**
- Add a `haversineDistance(lat1, lon1, lat2, lon2)` helper function that returns distance in miles
- After geocoding the search location, capture the center lat/lng
- After fetching place details, use `place.geometry.location.lat()` and `.lng()` for each result
- Filter out any result where `haversineDistance(center, result) > radiusMiles`
- Return the `distance` as part of each Business object so it can optionally be displayed

**File: `src/types/business.ts`**
- Add optional `distance?: number` field to the Business interface

**File: `src/components/business/BusinessSearch.tsx`**
- After `searchBusinesses()` returns, run email enrichment for businesses with websites
- Call the `enrich-prospect-email` edge function for each domain (batched with reasonable concurrency)
- Update results as emails are found (progressive update so users see results immediately, emails fill in as they load)
- Add a small "Enriching emails..." indicator

**File: `src/components/business/BusinessTableRow.tsx`**
- Display the email column value (it already exists in the table but always shows "N/A" -- now it will show real emails when found)

**File: `src/components/business/BusinessResultsTable.tsx`**
- Optionally show the distance column so users can see how far each result is

