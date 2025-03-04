
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
      zoom: 3,
      center: [-95.7129, 37.0902], // Center on US
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
