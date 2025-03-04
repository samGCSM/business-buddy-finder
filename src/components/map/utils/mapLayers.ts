
import mapboxgl from 'mapbox-gl';

/**
 * Removes existing map layers and sources if they exist
 */
export const removeExistingLayers = (map: mapboxgl.Map) => {
  if (map.getSource('prospects')) {
    // Remove related layers first
    if (map.getLayer('clusters')) map.removeLayer('clusters');
    if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
    if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
    
    // Then remove the source
    map.removeSource('prospects');
  }
};

/**
 * Adds clustered markers and individual prospect points to the map
 */
export const addMarkersToMap = (map: mapboxgl.Map, features: any[]) => {
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
};

/**
 * Fit the map view to include all markers
 */
export const fitMapToBounds = (map: mapboxgl.Map, bounds: mapboxgl.LngLatBounds, callback?: () => void) => {
  if (bounds.isEmpty()) {
    if (callback) callback();
    return;
  }
  
  // Use a timeout to ensure the map has time to process before fitting bounds
  setTimeout(() => {
    map.fitBounds(bounds, {
      padding: 80, // Increased padding for better visibility
      maxZoom: 12, // Limit max zoom level when fitting bounds
      duration: 1500 // Longer animation for smoother transition
    });
    
    // Callback after animation completes
    if (callback) {
      setTimeout(callback, 1500);
    }
  }, 300);
};
