
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { SatelliteToggleControl } from './SatelliteToggleControl';

interface MapInitializerProps {
  mapboxToken: string;
  setMap: (map: mapboxgl.Map) => void;
  setIsSatelliteView: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapInitializer = ({ mapboxToken, setMap, setIsSatelliteView }: MapInitializerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  // Initialize map once we have the token
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;
    
    // Set Mapbox token
    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 5, // Increased from 3 to 5 for better initial zoom
      center: [-85.7129, 32.0902], // Center on Southeastern US (roughly Alabama/Georgia area)
    });

    // Set map in parent component
    setMap(mapInstance);

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add satellite toggle control
    mapInstance.addControl(new SatelliteToggleControl(setIsSatelliteView), 'top-right');

    // Cleanup
    return () => {
      mapInstance.remove();
    };
  }, [mapboxToken, setMap, setIsSatelliteView]);

  return <div ref={mapContainer} className="absolute inset-0" />;
};

export default MapInitializer;
