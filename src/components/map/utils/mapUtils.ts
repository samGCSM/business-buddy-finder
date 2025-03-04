
import mapboxgl from 'mapbox-gl';
import { Prospect } from '@/types/prospects';

// Geocode an address using Mapbox API
export const geocodeAddress = async (address: string, token: string): Promise<[number, number] | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding address:`, error);
    return null;
  }
};

// Create a GeoJSON feature for a prospect
export const createProspectFeature = (prospect: Prospect, coordinates: [number, number]) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
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
  };
};

// Create HTML content for popup
export const createPopupContent = (props: any): HTMLElement => {
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
  return popupContent;
};
