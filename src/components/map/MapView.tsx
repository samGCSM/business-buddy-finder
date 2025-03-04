
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Prospect } from '@/types/prospects';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MapViewProps {
  prospects: Prospect[];
}

const MapView = ({ prospects }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

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
      
      // Fit map to bounds of all prospects
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    } else {
      toast({
        title: "Geocoding Failed",
        description: "Unable to map any prospect addresses. Please check that they are valid.",
        variant: "destructive",
      });
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
    </div>
  );
};

export default MapView;
