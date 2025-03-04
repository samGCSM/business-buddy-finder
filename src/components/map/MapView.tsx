
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Prospect } from '@/types/prospects';
import { Loader2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  prospects: Prospect[];
  optimizeRoute?: boolean;
  onProspectSelection?: (prospectIds: number[]) => void;
}

const MapView = ({ prospects, optimizeRoute = false, onProspectSelection }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [selectedRouteProspects, setSelectedRouteProspects] = useState<number[]>([]);
  const [routeOptimized, setRouteOptimized] = useState(false);
  const routeSourceRef = useRef<string | null>(null);
  const routeLayerRef = useRef<string | null>(null);
  const markersRef = useRef<{ [id: number]: mapboxgl.Marker }>({});

  // Fetch the Mapbox token from Supabase Edge Function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          throw error;
        }
        
        if (data && data.token) {
          setMapboxToken(data.token);
        } else {
          toast({
            title: "Error",
            description: "Failed to load Mapbox token",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        toast({
          title: "Error",
          description: "Failed to load map configuration",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Reset selection state when optimize route mode changes
  useEffect(() => {
    if (!optimizeRoute) {
      setSelectedRouteProspects([]);
      setRouteOptimized(false);
      
      // Remove route from map if it exists
      if (map.current && routeSourceRef.current && routeLayerRef.current) {
        if (map.current.getLayer(routeLayerRef.current)) {
          map.current.removeLayer(routeLayerRef.current);
        }
        if (map.current.getSource(routeSourceRef.current)) {
          map.current.removeSource(routeSourceRef.current);
        }
        routeSourceRef.current = null;
        routeLayerRef.current = null;
      }
      
      // Clear marker styling
      Object.values(markersRef.current).forEach(marker => {
        const el = marker.getElement();
        el.classList.remove('selected-marker');
      });
    }
  }, [optimizeRoute]);

  // Update parent component with selected prospects
  useEffect(() => {
    if (onProspectSelection) {
      onProspectSelection(selectedRouteProspects);
    }
  }, [selectedRouteProspects, onProspectSelection]);

  // Initialize map once we have the token and prospects
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;
    
    // Set Mapbox token
    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 3,
      center: [-95.7129, 37.0902], // Center on US
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for map to load before adding data
    map.current.on('load', () => {
      addProspectsToMap();
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Reset the map when prospects change
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      // Clear existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Remove existing sources and layers
      if (map.current.getSource('prospects')) {
        // Remove related layers first
        if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
        if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
        if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
        
        // Then remove the source
        map.current.removeSource('prospects');
      }
      
      // Add the updated prospects
      addProspectsToMap();
    }
  }, [prospects]);

  // Handle prospect selection for route optimization
  const toggleProspectSelection = useCallback((prospectId: number) => {
    if (!optimizeRoute) return;
    
    setSelectedRouteProspects(prev => {
      const isSelected = prev.includes(prospectId);
      const newSelection = isSelected
        ? prev.filter(id => id !== prospectId)
        : [...prev, prospectId];
      
      // Update marker appearance
      const marker = markersRef.current[prospectId];
      if (marker) {
        const el = marker.getElement();
        if (isSelected) {
          el.classList.remove('selected-marker');
        } else {
          el.classList.add('selected-marker');
        }
        
        // Update marker number
        const markerNumberEl = el.querySelector('.marker-number');
        if (markerNumberEl) {
          if (!isSelected) {
            const newIndex = newSelection.indexOf(prospectId);
            markerNumberEl.textContent = (newIndex + 1).toString();
          } else {
            markerNumberEl.textContent = '';
          }
        }
      }
      
      // Reset route state when selection changes
      setRouteOptimized(false);
      
      return newSelection;
    });
  }, [optimizeRoute]);

  // Process prospects and add them to the map
  const addProspectsToMap = async () => {
    if (!map.current) return;
    
    // Filter out prospects without addresses
    const mappableProspects = prospects.filter(p => p.business_address);
    
    if (mappableProspects.length === 0) {
      toast({
        title: "No Mappable Prospects",
        description: "No prospects have addresses that can be mapped",
      });
      return;
    }

    // Create a feature collection for the map
    const features = [];
    const bounds = new mapboxgl.LngLatBounds();
    
    // Process each prospect
    for (const prospect of mappableProspects) {
      try {
        // Geocode the address to get coordinates
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(prospect.business_address || '')}.json?access_token=${mapboxToken}`
        );
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;
          
          // Add to bounds for auto-fitting the view
          bounds.extend([longitude, latitude]);
          
          // If in route optimization mode, create custom markers
          if (optimizeRoute) {
            // Create marker element
            const el = document.createElement('div');
            el.className = 'prospect-marker';
            const prospectId = Number(prospect.id);
            const selectedIndex = selectedRouteProspects.indexOf(prospectId);
            // Add the marker number only if it's selected
            el.innerHTML = `<div class="marker-number">${selectedIndex > -1 ? (selectedIndex + 1) : ''}</div>`;
            
            if (selectedRouteProspects.includes(prospectId)) {
              el.classList.add('selected-marker');
            }
            
            // Create and add marker to map
            const marker = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current);
            
            // Add click handler
            el.addEventListener('click', () => {
              toggleProspectSelection(prospectId);
            });
            
            // Add popup with prospect details
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-semibold">${prospect.business_name || 'Unnamed Business'}</h3>
                <p class="text-sm">${prospect.business_address}</p>
                <p class="text-xs mt-1">Click to ${selectedRouteProspects.includes(prospectId) ? 'remove from' : 'add to'} route</p>
              </div>`
            );
            
            marker.setPopup(popup);
            
            // Store reference to marker
            markersRef.current[prospectId] = marker;
          }
          
          // Create feature for this prospect
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {
              id: prospect.id,
              name: prospect.business_name,
              address: prospect.business_address,
              status: prospect.status,
              priority: prospect.priority,
              phone: prospect.phone_number,
              website: prospect.website,
              email: prospect.email,
              description: `${prospect.business_name} - ${prospect.status || 'No Status'}`
            }
          });
        }
      } catch (error) {
        console.error(`Error geocoding ${prospect.business_name}:`, error);
      }
    }
    
    // Skip adding regular markers in optimize route mode
    if (!optimizeRoute) {
      // Add markers to map once we have processed all prospects
      if (features.length > 0) {
        // Add source for markers
        map.current.addSource('prospects', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        
        // Add clusters layer
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'prospects',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              10,
              '#f1f075',
              30,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ]
          }
        });
        
        // Add cluster count labels
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'prospects',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });
        
        // Add individual prospect markers
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'prospects',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match',
              ['get', 'status'],
              'active', '#22c55e',
              'pending', '#f59e0b',
              'contacted', '#3b82f6',
              'inactive', '#6b7280',
              '#ef4444' // default color
            ],
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
        
        // Add click event for clusters
        map.current.on('click', 'clusters', (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (!features?.length) return;
          
          const clusterId = features[0].properties?.cluster_id;
          (map.current?.getSource('prospects') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || !map.current) return;
              
              map.current.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom
              });
            }
          );
        });
        
        // Add click event for individual points
        map.current.on('click', 'unclustered-point', (e) => {
          if (!e.features?.length || !map.current) return;
          
          const feature = e.features[0];
          const props = feature.properties;
          const coordinates = (feature.geometry as any).coordinates.slice();
          
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2';
          popupContent.innerHTML = `
            <h3 class="font-semibold text-lg">${props.name}</h3>
            <div class="mt-1 space-y-1">
              <p class="text-sm">${props.address}</p>
              ${props.phone ? `<p class="text-sm">📞 <a href="tel:${props.phone}" class="text-blue-600 hover:underline">${props.phone}</a></p>` : ''}
              ${props.email ? `<p class="text-sm">✉️ <a href="mailto:${props.email}" class="text-blue-600 hover:underline">${props.email}</a></p>` : ''}
              ${props.website ? `<p class="text-sm">🌐 <a href="${props.website.startsWith('http') ? props.website : 'https://' + props.website}" target="_blank" class="text-blue-600 hover:underline">Website</a></p>` : ''}
              <div class="flex items-center gap-2 mt-2">
                ${props.status ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  props.status === 'active' ? 'bg-green-100 text-green-800' :
                  props.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  props.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }">${props.status}</span>` : ''}
                ${props.priority ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  props.priority === 'high' ? 'bg-red-100 text-red-800' :
                  props.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }">${props.priority}</span>` : ''}
              </div>
            </div>
          `;
          
          // Create the popup
          new mapboxgl.Popup({ closeButton: true, maxWidth: '300px' })
            .setLngLat(coordinates)
            .setDOMContent(popupContent)
            .addTo(map.current);
        });
        
        // Change cursor when hovering over points
        map.current.on('mouseenter', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
        
        map.current.on('mouseenter', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      }
    }
    
    // Fit map to bounds of all prospects
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  // Calculate optimized route
  const calculateOptimizedRoute = async () => {
    if (!map.current || selectedRouteProspects.length < 2) {
      toast({
        title: "Route Error",
        description: "Please select at least 2 prospects to create a route",
        variant: "destructive",
      });
      return;
    }

    setRouteLoading(true);

    try {
      // Collect coordinates for selected prospects
      const selectedCoordinates: [number, number][] = [];
      const waypoints: string[] = [];

      // Get coordinates for selected prospects
      for (const id of selectedRouteProspects) {
        const marker = markersRef.current[id];
        if (marker) {
          const lngLat = marker.getLngLat();
          selectedCoordinates.push([lngLat.lng, lngLat.lat]);
          waypoints.push(`${lngLat.lng},${lngLat.lat}`);
        }
      }

      if (selectedCoordinates.length < 2) {
        throw new Error("Could not get coordinates for selected prospects");
      }

      // Build the Mapbox Directions API URL
      // Format is: /directions/v5/{profile}/{coordinates}
      const profile = 'mapbox/driving';
      const coordinatesString = waypoints.join(';');
      const url = `https://api.mapbox.com/directions/v5/${profile}/${coordinatesString}?geometries=geojson&access_token=${mapboxToken}&overview=full`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Display route on map
        // Remove existing route if present
        if (routeSourceRef.current && routeLayerRef.current) {
          if (map.current.getLayer(routeLayerRef.current)) {
            map.current.removeLayer(routeLayerRef.current);
          }
          if (map.current.getSource(routeSourceRef.current)) {
            map.current.removeSource(routeSourceRef.current);
          }
        }

        // Generate random IDs for source and layer
        const sourceId = `route-source-${Date.now()}`;
        const layerId = `route-layer-${Date.now()}`;
        routeSourceRef.current = sourceId;
        routeLayerRef.current = layerId;

        // Add route source
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        // Add route layer
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Update route state
        setRouteOptimized(true);

        // Toast with route details
        const distance = (route.distance / 1609.34).toFixed(1); // Convert to miles
        const duration = Math.round(route.duration / 60); // Convert to minutes
        
        toast({
          title: "Route Optimized",
          description: `Total route: ${distance} miles (about ${duration} minutes)`,
        });

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.geometry.coordinates.forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });

        map.current.fitBounds(bounds, {
          padding: 50
        });
      } else {
        throw new Error("No route found");
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        title: "Route Error",
        description: "Could not calculate an optimized route for the selected prospects",
        variant: "destructive",
      });
    } finally {
      setRouteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[600px] rounded-lg overflow-hidden relative">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Route optimization controls */}
      {optimizeRoute && (
        <div className="absolute right-4 bottom-4 z-10">
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <Button 
              onClick={calculateOptimizedRoute} 
              disabled={selectedRouteProspects.length < 2 || routeLoading || routeOptimized}
              className="w-full gap-2"
            >
              {routeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : routeOptimized ? (
                <>
                  <Check className="h-4 w-4" />
                  Route Optimized
                </>
              ) : (
                'Calculate Best Route'
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              {selectedRouteProspects.length === 0 
                ? 'Select prospects on the map' 
                : `${selectedRouteProspects.length} locations selected`}
            </p>
          </div>
        </div>
      )}
      
      {/* CSS for markers in route optimization mode */}
      <style>
        {`
        .prospect-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #ef4444;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        
        .prospect-marker.selected-marker {
          background-color: #3b82f6;
          transform: scale(1.1);
        }
        
        .marker-number {
          font-size: 12px;
        }
        `}
      </style>
    </div>
  );
};

export default MapView;
