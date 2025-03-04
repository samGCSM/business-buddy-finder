
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useMapbox = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isSatelliteView, setIsSatelliteView] = useState(false);

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

  // Toggle between satellite and street views
  useEffect(() => {
    if (!map || !map.loaded()) return;
    
    const styleUrl = isSatelliteView 
      ? 'mapbox://styles/mapbox/satellite-streets-v12' 
      : 'mapbox://styles/mapbox/streets-v12';
    
    map.setStyle(styleUrl);
  }, [isSatelliteView, map]);

  return { 
    map, 
    setMap, 
    loading, 
    mapboxToken, 
    isSatelliteView, 
    setIsSatelliteView 
  };
};
