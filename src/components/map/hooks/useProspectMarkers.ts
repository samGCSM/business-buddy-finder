import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Prospect } from '@/types/prospects';
import { toast } from '@/hooks/use-toast';
import { geocodeAddress, createProspectFeature, createPopupContent } from '../utils/mapUtils';

export const useProspectMarkers = (
  map: mapboxgl.Map | null, 
  prospects: Prospect[], 
  mapboxToken: string | null
) => {
  // Add prospects to map when prospects or map changes
  useEffect(() => {
    if (!map || !mapboxToken) return;
    
    // We need to wait for the map to be fully loaded before adding markers
    const handleMapLoad = () => {
      const addProspectsToMap = async () => {
        console.log('Adding prospects to map:', prospects.length);
        
        // Remove existing sources and layers
        if (map.getSource('prospects')) {
          // Remove related layers first
          if (map.getLayer('clusters')) map.removeLayer('clusters');
          if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
          if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
          
          // Then remove the source
          map.removeSource('prospects');
        }
        
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
        const features: any[] = [];
        const bounds = new mapboxgl.LngLatBounds();
        let geocodedCount = 0;
        
        // Process each prospect
        for (const prospect of mappableProspects) {
          if (!prospect.business_address) continue;
          
          const coordinates = await geocodeAddress(prospect.business_address, mapboxToken);
          if (coordinates) {
            // Add to bounds for auto-fitting the view
            bounds.extend(coordinates);
            geocodedCount++;
            
            // Create feature for this prospect
            features.push(createProspectFeature(prospect, coordinates));
          }
        }
        
        console.log(`Successfully geocoded ${geocodedCount}/${mappableProspects.length} prospects`);
        
        // Add markers to map once we have processed all prospects
        if (features.length > 0) {
          // Add source for markers
          map.addSource('prospects', {
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
          map.addLayer({
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
          map.addLayer({
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
          map.addLayer({
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
          
          // Add click handlers for markers and clusters
          setupMapInteractions(map);
          
          // Fit map to bounds of all prospects with better padding and max zoom
          if (!bounds.isEmpty()) {
            console.log('Fitting map to bounds:', bounds);
            
            // Use a timeout to ensure the map has time to process before fitting bounds
            setTimeout(() => {
              map.fitBounds(bounds, {
                padding: 80, // Increased padding for better visibility
                maxZoom: 12, // Limit max zoom level when fitting bounds
                duration: 1500 // Longer animation for smoother transition
              });
            }, 300);
          }
        }
      };
      
      addProspectsToMap();
    };
    
    // If map is already loaded, add prospects immediately
    if (map.loaded()) {
      handleMapLoad();
    } else {
      // Otherwise wait for the load event
      map.once('load', handleMapLoad);
    }
    
    // Cleanup function
    return () => {
      map.off('load', handleMapLoad);
    };
  }, [map, prospects, mapboxToken]);
};

function setupMapInteractions(map: mapboxgl.Map) {
  // Add click event for clusters
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    if (!features?.length) return;
    
    const clusterId = features[0].properties?.cluster_id;
    (map.getSource('prospects') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;
        
        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      }
    );
  });
  
  // Add click event for individual points
  map.on('click', 'unclustered-point', (e) => {
    if (!e.features?.length) return;
    
    const feature = e.features[0];
    const props = feature.properties;
    const coordinates = (feature.geometry as any).coordinates.slice();
    
    // Create the popup
    new mapboxgl.Popup({ closeButton: true, maxWidth: '300px' })
      .setLngLat(coordinates)
      .setDOMContent(createPopupContent(props))
      .addTo(map);
  });
  
  // Change cursor when hovering over points
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  });
  
  map.on('mouseenter', 'unclustered-point', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  
  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = '';
  });
}
