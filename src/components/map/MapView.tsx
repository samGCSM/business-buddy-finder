
import { useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Prospect } from '@/types/prospects';
import { useMapbox } from './hooks/useMapbox';
import { useProspectMarkers } from './hooks/useProspectMarkers';
import MapInitializer from './components/MapInitializer';
import MapLoader from './components/MapLoader';

interface MapViewProps {
  prospects: Prospect[];
}

const MapView = ({ prospects }: MapViewProps) => {
  const { loading, mapboxToken, setMap, map, isSatelliteView, setIsSatelliteView } = useMapbox();
  
  // Use the prospect markers hook
  useProspectMarkers(map, prospects, mapboxToken);

  if (loading) {
    return <MapLoader />;
  }

  return (
    <div className="h-full min-h-[600px] rounded-lg overflow-hidden relative">
      {mapboxToken && (
        <MapInitializer 
          mapboxToken={mapboxToken} 
          setMap={setMap} 
          setIsSatelliteView={setIsSatelliteView} 
        />
      )}
    </div>
  );
};

export default MapView;
