

## Add Driving Directions & Route Optimization to Prospect Map

### Overview
Add a route planning panel to the prospect map that lets you enter a starting point (or use your current GPS location), then calculates the optimal driving route through your displayed prospects using the Mapbox Optimization API.

### How It Works
1. A collapsible "Route Planner" panel appears above or beside the map
2. You either type a starting address or click "Use My Location" (browser GPS)
3. Click "Plan Route" -- the system sends all prospect coordinates plus your start point to the Mapbox Optimization API
4. The optimized route is drawn on the map as a colored line, with numbered stop markers
5. A sidebar/panel shows the ordered stop list with estimated drive times between each

### Mapbox API Details
- **Optimization API** (`/optimized-trips/v1/`) handles up to 12 waypoints per request and returns the fastest round-trip or one-way route
- If more than 12 prospects are shown, we batch or let the user select which ones to include in the route
- The API is included with the Mapbox token -- no extra cost beyond normal usage

### New Files

**`src/components/map/components/RoutePlanner.tsx`**
- UI panel with:
  - Address input for starting point
  - "Use My Location" button (calls `navigator.geolocation`)
  - "Plan Route" / "Clear Route" buttons
  - Ordered stop list with estimated times (shown after route is calculated)
- Passes start coordinates + prospect coordinates to the route hook

**`src/components/map/hooks/useRouteOptimization.ts`**
- Takes the Mapbox token, map instance, start coordinates, and prospect coordinates
- Calls Mapbox Optimization API: `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/{coordinates}?access_token={token}`
- Parses the response to get the ordered waypoints and route geometry
- Draws the route line on the map using `map.addSource` / `map.addLayer` (GeoJSON line)
- Adds numbered markers for each stop in order
- Returns: ordered stops with durations, total time, loading state, clear function

### Modified Files

**`src/components/map/MapView.tsx`**
- Import and render `RoutePlanner` component
- Pass `map`, `mapboxToken`, and `prospects` to it

**`src/pages/ProspectMap.tsx`**
- No changes needed -- MapView handles everything internally

### Limitations & Edge Cases
- Mapbox Optimization API supports up to 12 coordinates per request; if more than 12 prospects are visible, we show a message asking the user to filter down or we take the nearest 11 (plus start)
- GPS permission may be denied -- fall back to address entry with a toast message
- Route is cleared and recalculated when filters/territory change

### Technical Details

**Optimization API call format:**
```
GET https://api.mapbox.com/optimized-trips/v1/mapbox/driving/{lng1},{lat1};{lng2},{lat2};...?
  source=first&
  destination=last&
  roundtrip=false&
  geometries=geojson&
  access_token={token}
```

**Route drawing on map:**
- Source: `route-line` (GeoJSON LineString from API response)
- Layer: `route-line-layer` (line with blue color, width 4, opacity 0.75)
- Numbered stop markers: custom HTML markers with circled numbers

**Stop list panel shows:**
- Stop number, prospect name, estimated arrival/drive time from previous stop
- Total estimated drive time at the bottom
