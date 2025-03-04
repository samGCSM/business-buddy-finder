
import mapboxgl from 'mapbox-gl';
import { createPopupContent } from './mapUtils';

/**
 * Sets up click and hover interactions for map markers and clusters
 */
export const setupMapInteractions = (map: mapboxgl.Map) => {
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
};
