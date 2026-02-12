

## Fix Route Planner: API Error, Position, and Pick-on-Map

### 1. Fix the "Could not calculate route" Error

**Root cause:** The Mapbox Optimization API does not support `roundtrip=false` with `destination=any`. The API response literally says `"code":"NotImplemented"`. 

**Fix:** Change the API call to use `roundtrip=true` (which is fully supported for optimization/trip-planning). This gives you the best route through all prospects and back. Alternatively, we can use the standard Mapbox Directions API (`/directions/v5/`) which supports one-way routes -- but for visiting multiple prospects, the roundtrip optimization is actually the better fit.

**File:** `src/components/map/hooks/useRouteOptimization.ts` (line 93)
- Change: `?source=first&roundtrip=false&destination=any` 
- To: `?roundtrip=true`
- Also update the error check to handle `NoRoute` responses more gracefully

### 2. Move Route Planner Below the Search/Filter Area

Currently the RoutePlanner is positioned `absolute top-3 left-3` inside the map container, overlapping the search bar. 

**Fix:** Move RoutePlanner out of MapView and into ProspectMap.tsx, placing it in the page layout between the filter controls and the map -- as a normal (non-absolute) element.

**Files:**
- `src/components/map/MapView.tsx` -- Remove `<RoutePlanner>` from here
- `src/components/map/components/RoutePlanner.tsx` -- Remove the `absolute top-3 left-3 z-30` positioning, make it a normal block element
- `src/pages/ProspectMap.tsx` -- Add `<RoutePlanner>` between MapFilterControls and the map container, passing `map`, `mapboxToken`, and `prospects`
- `src/components/map/MapView.tsx` -- Expose `map` and `mapboxToken` so ProspectMap can pass them to RoutePlanner (either lift state up or expose via a ref/callback)

### 3. Add "Pick Location on Map" Feature

Add a button in the RoutePlanner that puts the map into a "pick mode." When active, clicking anywhere on the map sets that point as the starting location.

**Changes:**
- `src/components/map/components/RoutePlanner.tsx` -- Add a "Pick on Map" button next to the location input. When clicked, it sets a `pickingOnMap` state to true and shows a visual hint ("Click the map to set start point")
- `src/components/map/hooks/useRouteOptimization.ts` -- Add a `map.on('click')` listener when pick mode is active. On click, capture the coordinates, reverse-geocode them to show an address label, and exit pick mode. Change the cursor to crosshair during pick mode.

### Technical Details

**API URL fix (useRouteOptimization.ts line 93):**
```
// Before:
?source=first&roundtrip=false&destination=any&geometries=geojson

// After:
?roundtrip=true&geometries=geojson
```

**RoutePlanner layout change:**
- Remove `absolute top-3 left-3 z-30 w-80 max-w-[calc(100vw-2rem)]` wrapper
- Replace with a normal `div` with `mb-4` margin

**ProspectMap.tsx restructure:**
- MapView will need to expose `map` and `mapboxToken` -- simplest approach is to lift the `useMapbox` hook up into ProspectMap and pass `map`/`mapboxToken` down to both MapView and RoutePlanner

**Pick-on-map flow:**
- New state `isPickingLocation` in RoutePlanner
- When active: set `map.getCanvas().style.cursor = 'crosshair'`, add a one-time `map.once('click', handler)`
- On click: get `e.lngLat`, reverse-geocode via `https://api.mapbox.com/geocoding/v5/mapbox.places/{lng},{lat}.json`, set address to result, exit pick mode
- Button shows a map-pin-plus icon with tooltip "Pick on map"

### Files Modified
- `src/components/map/hooks/useRouteOptimization.ts` -- Fix API URL
- `src/components/map/components/RoutePlanner.tsx` -- Remove absolute positioning, add pick-on-map button and logic
- `src/components/map/MapView.tsx` -- Remove RoutePlanner, expose map/token
- `src/pages/ProspectMap.tsx` -- Add RoutePlanner in page layout, lift useMapbox hook up
