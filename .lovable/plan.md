

## Unified Map Toolbar: One Row for Everything

### What Changes

Combine the search input, territory dropdown, Route Planner button, and new Google Maps / Apple Maps buttons into a single horizontal toolbar row above the map. The current `MapFilterControls` component (which uses absolute positioning inside the map) and the separate `RoutePlanner` block will be merged into one clean bar.

### Layout (desktop)

```text
+-----------------------------------------------------------------------------------+
| [Search prospects...] | [Territory v] | [Route Planner v] | [Google] | [Apple]   |
+-----------------------------------------------------------------------------------+
```

On mobile, items wrap into two rows naturally via `flex-wrap`.

### Files to Change

**1. `src/pages/map/components/MapFilterControls.tsx` -- Rewrite**
- Remove the `absolute` positioned wrapper and the white card styling
- Export just the inline search input and territory select as flex items (no wrapper div)
- Accept the same props but render as inline flex children

**2. `src/components/map/components/RoutePlanner.tsx` -- Adjust trigger**
- Remove the outer `mb-4` wrapper div
- The `CollapsibleTrigger` button stays the same (compact "Route Planner" button)
- The `CollapsibleContent` panel drops down below the toolbar row (absolute or normal flow) when expanded
- Keep all existing route planning logic unchanged

**3. `src/pages/ProspectMap.tsx` -- New unified toolbar**
- Replace the current grid layout + separate RoutePlanner with a single `flex` row:
  - Search input (with Search icon)
  - Territory select dropdown
  - RoutePlanner (just the collapsible trigger inline, content drops below)
  - Google Maps button -- opens Google Maps directions URL with all prospect coordinates as waypoints
  - Apple Maps button -- opens Apple Maps URL with prospect coordinates
- The collapsible content from RoutePlanner will appear below this toolbar row when opened

**4. Google Maps & Apple Maps buttons**
- **Google Maps**: Opens `https://www.google.com/maps/dir/?api=1&origin={start}&waypoints={coords}&destination={last}` in a new tab. Uses the filtered prospect coordinates. If a route has been planned, uses the optimized order.
- **Apple Maps**: Opens `https://maps.apple.com/?daddr={address}&dirflg=d` in a new tab. Apple Maps supports fewer waypoints natively, so it opens with the first prospect as destination (or multiple via chained `&daddr=` params).
- Both buttons are icon buttons with tooltips showing "Open in Google Maps" / "Open in Apple Maps"

### Technical Details

**MapFilterControls.tsx** -- becomes a simpler component returning fragments:
- Remove: `absolute left-4 top-4 z-10 w-72` wrapper and inner `bg-white p-3 rounded-lg shadow-lg` card
- Keep: the search `Input` with `Search` icon and the `Select` dropdown, each as standalone elements

**ProspectMap.tsx** -- new toolbar structure:
```
<div className="flex flex-wrap items-start gap-2 mb-4">
  {/* Search input */}
  <div className="relative">
    <Search icon + Input />
  </div>
  
  {/* Territory select */}
  <Select ... />
  
  {/* Route Planner (collapsible, content drops below) */}
  <RoutePlanner ... />
  
  {/* Google Maps button */}
  <Button onClick={openGoogleMaps} title="Open in Google Maps">
    <ExternalLink /> Google Maps
  </Button>
  
  {/* Apple Maps button */}
  <Button onClick={openAppleMaps} title="Open in Apple Maps">
    <ExternalLink /> Apple Maps
  </Button>
</div>
```

**RoutePlanner.tsx** adjustments:
- Remove the `mb-4` wrapper, return the `Collapsible` directly
- The `CollapsibleContent` uses `absolute` positioning or normal flow to drop below the toolbar without pushing the map down excessively
- All route logic, pick-on-map, geolocation remains unchanged

**Google/Apple Maps URL construction** (in ProspectMap.tsx):
- Builds URLs from `filteredProspects` coordinates (`latitude`, `longitude` fields)
- If a route has been planned (optimized stops available), uses that order for waypoints
- Opens in a new tab via `window.open(url, '_blank')`

