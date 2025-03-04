
import { Dispatch, SetStateAction } from 'react';
import mapboxgl from 'mapbox-gl';

// Custom control class for the satellite toggle
export class SatelliteToggleControl {
  _map: mapboxgl.Map | null = null;
  _container: HTMLDivElement | null = null;
  _toggleButton: HTMLButtonElement | null = null;
  _setIsSatelliteView: Dispatch<SetStateAction<boolean>>;

  constructor(setIsSatelliteView: Dispatch<SetStateAction<boolean>>) {
    this._setIsSatelliteView = setIsSatelliteView;
  }

  onAdd(map: mapboxgl.Map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    
    this._toggleButton = document.createElement('button');
    this._toggleButton.className = 'mapboxgl-ctrl-icon satellite-toggle';
    this._toggleButton.type = 'button';
    this._toggleButton.setAttribute('aria-label', 'Toggle satellite view');
    this._toggleButton.style.display = 'flex';
    this._toggleButton.style.justifyContent = 'center';
    this._toggleButton.style.alignItems = 'center';
    
    // Add Layers icon (similar to other mapbox controls)
    this._toggleButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <line x1="3" x2="21" y1="9" y2="9"></line>
        <line x1="3" x2="21" y1="15" y2="15"></line>
        <line x1="9" x2="9" y1="3" y2="21"></line>
        <line x1="15" x2="15" y1="3" y2="21"></line>
      </svg>
    `;
    
    this._toggleButton.onclick = () => {
      this._setIsSatelliteView(prev => !prev);
    };
    
    this._container.appendChild(this._toggleButton);
    return this._container;
  }

  onRemove() {
    this._container?.parentNode?.removeChild(this._container);
    this._map = null;
  }
}
