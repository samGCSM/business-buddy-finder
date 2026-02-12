import { useState, useRef, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Prospect } from '@/types/prospects';
import { geocodeAddress } from '../utils/mapUtils';
import { toast } from '@/hooks/use-toast';

export interface RouteStop {
  prospectName: string;
  prospectAddress: string;
  durationFromPrevious: number; // seconds
  coordinates: [number, number];
}

interface UseRouteOptimizationProps {
  map: mapboxgl.Map | null;
  mapboxToken: string | null;
  prospects: Prospect[];
}

export const useRouteOptimization = ({ map, mapboxToken, prospects }: UseRouteOptimizationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Clean up markers and route layer
  const clearRoute = useCallback(() => {
    if (!map) return;

    // Remove markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Remove route layer and source
    if (map.getLayer('route-line-layer')) map.removeLayer('route-line-layer');
    if (map.getSource('route-line')) map.removeSource('route-line');

    setRouteStops([]);
    setTotalDuration(0);
  }, [map]);

  // Clear route when prospects change
  useEffect(() => {
    clearRoute();
  }, [prospects, clearRoute]);

  const planRoute = useCallback(async (startCoords: [number, number]) => {
    if (!map || !mapboxToken) return;

    // Geocode prospects that have addresses
    setIsLoading(true);
    clearRoute();

    try {
      // Geocode all prospect addresses
      const geocoded: { prospect: Prospect; coords: [number, number] }[] = [];
      
      for (const prospect of prospects) {
        if (!prospect.business_address) continue;
        const coords = await geocodeAddress(prospect.business_address, mapboxToken);
        if (coords) {
          geocoded.push({ prospect, coords });
        }
      }

      if (geocoded.length === 0) {
        toast({ title: 'No prospects with valid addresses', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // Mapbox Optimization API supports max 12 coordinates
      let selectedProspects = geocoded;
      if (geocoded.length > 11) {
        toast({
          title: 'Too many prospects',
          description: `Showing route for the nearest 11 of ${geocoded.length} prospects. Filter to reduce.`,
        });
        // Sort by distance from start and take closest 11
        selectedProspects = geocoded
          .map(g => ({
            ...g,
            dist: Math.pow(g.coords[0] - startCoords[0], 2) + Math.pow(g.coords[1] - startCoords[1], 2),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 11);
      }

      // Build coordinates string: start;prospect1;prospect2;...
      const allCoords = [startCoords, ...selectedProspects.map(p => p.coords)];
      const coordsString = allCoords.map(c => `${c[0]},${c[1]}`).join(';');

      const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordsString}?roundtrip=true&geometries=geojson&access_token=${mapboxToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
        toast({ title: 'Could not calculate route', description: data.message || 'Try different prospects.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const trip = data.trips[0];
      const waypoints = data.waypoints;

      // Draw route line
      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: trip.geometry,
        },
      });

      map.addLayer({
        id: 'route-line-layer',
        type: 'line',
        source: 'route-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.75,
        },
      });

      // Build ordered stops from waypoint indices
      // waypoints[0] is the start, rest map to selectedProspects
      const orderedStops: RouteStop[] = [];
      const legs = trip.legs || [];

      // waypoints have waypoint_index indicating optimized order
      // Create a mapping: original index -> waypoint_index (order in trip)
      const waypointOrder = waypoints
        .map((wp: any, originalIdx: number) => ({ originalIdx, tripIdx: wp.waypoint_index }))
        .sort((a: any, b: any) => a.tripIdx - b.tripIdx);

      let total = 0;
      for (let i = 1; i < waypointOrder.length; i++) {
        const originalIdx = waypointOrder[i].originalIdx;
        // originalIdx 0 = start point, 1..N = selectedProspects[0..N-1]
        const prospectIdx = originalIdx - 1;
        if (prospectIdx < 0 || prospectIdx >= selectedProspects.length) continue;

        const legDuration = legs[i - 1]?.duration || 0;
        total += legDuration;

        const sp = selectedProspects[prospectIdx];
        orderedStops.push({
          prospectName: sp.prospect.business_name,
          prospectAddress: sp.prospect.business_address || '',
          durationFromPrevious: legDuration,
          coordinates: sp.coords,
        });
      }

      // Add numbered markers
      orderedStops.forEach((stop, idx) => {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold border-2 border-white shadow-md';
        el.textContent = String(idx + 1);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(stop.coordinates)
          .addTo(map);
        markersRef.current.push(marker);
      });

      // Add start marker
      const startEl = document.createElement('div');
      startEl.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold border-2 border-white shadow-md';
      startEl.textContent = 'S';
      const startMarker = new mapboxgl.Marker({ element: startEl })
        .setLngLat(startCoords)
        .addTo(map);
      markersRef.current.push(startMarker);

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      allCoords.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });

      setRouteStops(orderedStops);
      setTotalDuration(total);
    } catch (error) {
      console.error('Route optimization error:', error);
      toast({ title: 'Route calculation failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [map, mapboxToken, prospects, clearRoute]);

  return { planRoute, clearRoute, isLoading, routeStops, totalDuration };
};
