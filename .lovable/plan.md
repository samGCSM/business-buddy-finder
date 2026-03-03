

## Fix: Bulk Search "Failed to fetch results" Error

### Root Cause

The console logs show the exact problem:

> "As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers."

The legacy `PlacesService` (`textSearch`) is being rejected by Google's API. The code uses `google.maps.places.PlacesService` which Google deprecated for new usage as of March 1, 2025. The API is returning a non-OK status, hitting the `reject(new Error('Places search failed'))` path.

### Fix

Migrate from the legacy `PlacesService.textSearch()` to the new `google.maps.places.Place.searchByText()` API (Places API New).

**File: `src/utils/googleApi.ts`**

1. **Update the Google Maps script loading** to include `&libraries=places` (already present) but also ensure we're loading the newer API version
2. **Replace `PlacesService.textSearch()`** with the new `Place.searchByText()` API:
   - Remove the `new Map()` + `PlacesService` pattern
   - Use `google.maps.places.Place.searchByText({ textQuery, locationBias, fields, maxResultCount })` instead
   - The new API returns Place objects directly with fields like `displayName`, `formattedAddress`, `nationalPhoneNumber`, `websiteURI`, `rating`, `userRatingCount`
3. **Update field mapping** to match new API response format:
   - `place.displayName` instead of `place.name`
   - `place.nationalPhoneNumber` instead of `formatted_phone_number`
   - `place.websiteURI` instead of `website`
   - `place.userRatingCount` instead of `user_ratings_total`
   - `place.formattedAddress` instead of `formatted_address`
4. **Remove the `getDetails` call** -- the new `searchByText` returns all requested fields in a single call, eliminating the need for per-result detail fetches (this also makes it faster and cheaper)
5. **Handle pagination** -- the new API uses `maxResultCount` (up to 20 per call). To get more results, we can make multiple searches or accept 20 results max per query. The new API does not support pagination tokens like the old one, so we'll set `maxResultCount: 20` and accept that limit (Google's new Places API caps at 20 results per search).

### Technical Details

The new API call looks like:
```javascript
const { places } = await google.maps.places.Place.searchByText({
  textQuery: `${keyword} in ${location}`,
  fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount', 'location', 'id'],
  locationBias: new google.maps.Circle({ center: geocodeResult, radius: radiusInMeters }),
  maxResultCount: 20,
});
```

Each place object has `.location.lat()` and `.location.lng()` for distance calculation.

### Impact
- Fixes the search completely -- it will work again
- Simpler code -- no more separate `getDetails` calls per result
- Faster -- single API call returns all data
- Max 20 results per search (new API limitation) instead of previous 40

### File Modified
- `src/utils/googleApi.ts`

