import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Prospect } from '@/types/prospects';
import { toast } from '@/hooks/use-toast';
import { geocodeAddress, createProspectFeature } from '../utils/mapUtils';
import { setupMapInteractions } from '../utils/mapInteractions';
import { removeExistingLayers, addMarkersToMap, fitMapToBounds } from '../utils/mapLayers';

export const useProspectMarkers = (
  map: mapboxgl.Map | null, 
  prospects: Prospect[], 
  mapboxToken: string | null
) => {
  const [isPlacingMarkers, setIsPlacingMarkers] = useState(false);
  
  // Add prospects to map when prospects or map changes
  useEffect(() => {
    if (!map || !mapboxToken) return;
    
    // We need to wait for the map to be fully loaded before adding markers
    const handleMapLoad = () => {
      const addProspectsToMap = async () => {
        console.log('Adding prospects to map:', prospects.length);
        setIsPlacingMarkers(true);
        
        // Remove existing sources and layers
        removeExistingLayers(map);
        
        // Filter out prospects without addresses
        const mappableProspects = prospects.filter(p => p.business_address);
        
        if (mappableProspects.length === 0) {
          toast({
            title: "No Mappable Prospects",
            description: "No prospects have addresses that can be mapped",
          });
          setIsPlacingMarkers(false);
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
          // Add clustered markers to map
          addMarkersToMap(map, features);
          
          // Set up interactions with markers
          setupMapInteractions(map);
          
          // Fit map to bounds and turn off loading when done
          fitMapToBounds(map, bounds, () => setIsPlacingMarkers(false));
        } else {
          setIsPlacingMarkers(false);
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
      setIsPlacingMarkers(false);
    };
  }, [map, prospects, mapboxToken]);
  
  return { isPlacingMarkers };
};
