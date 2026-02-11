
import axios from 'axios';

declare global {
  interface Window {
    google: any;
  }
}

interface PlaceDetails {
  name: string;
  formatted_phone_number: string;
  website: string;
  rating: number;
  user_ratings_total: number;
  formatted_address: string;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const loadGoogleMapsScript = () => {
  const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  return new Promise<void>((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
};

export const searchBusinesses = async (location: string, keyword: string, radiusMiles: number = 10) => {
  console.log('Fetching businesses for:', { location, keyword, radiusMiles });
  
  const radiusInMeters = radiusMiles * 1609.34;
  
  try {
    await loadGoogleMapsScript();
    
    const geocoder = new window.google.maps.Geocoder();
    
    const geocodeResult = await new Promise<any>((resolve, reject) => {
      geocoder.geocode({ address: location }, (results: any, status: any) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });

    const centerLat = geocodeResult.lat();
    const centerLng = geocodeResult.lng();

    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    let allResults: any[] = [];
    const searchAndGetNextPage = (pageToken?: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        service.textSearch({
          query: keyword,
          location: geocodeResult,
          radius: radiusInMeters,
          pageToken: pageToken
        }, (results: any, status: any, pagination: any) => {
          if (status === 'OK') {
            allResults = [...allResults, ...results];
            
            if (pagination.hasNextPage && allResults.length < 40) {
              setTimeout(() => {
                pagination.nextPage();
              }, 2000);
            } else {
              resolve(allResults);
            }
          } else {
            reject(new Error('Places search failed'));
          }
        });
      });
    };

    const searchResults = await searchAndGetNextPage();
    console.log('Total results fetched:', searchResults.length);

    const businesses = await Promise.all(
      searchResults.slice(0, 40).map(async (place) => {
        const details = await new Promise<PlaceDetails>((resolve, reject) => {
          service.getDetails({
            placeId: place.place_id,
            fields: ['name', 'formatted_phone_number', 'website', 'rating', 'user_ratings_total', 'formatted_address'],
          }, (result: PlaceDetails, status: any) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(new Error('Failed to get place details'));
            }
          });
        });

        const placeLat = place.geometry.location.lat();
        const placeLng = place.geometry.location.lng();
        const distance = haversineDistance(centerLat, centerLng, placeLat, placeLng);

        return {
          id: place.place_id,
          name: details.name || place.name,
          phone: details.formatted_phone_number || 'N/A',
          email: 'N/A',
          website: details.website || 'N/A',
          reviewCount: details.user_ratings_total || 0,
          rating: details.rating || 0,
          address: details.formatted_address || place.formatted_address,
          distance: Math.round(distance * 10) / 10,
        };
      })
    );

    // Filter by radius
    const filtered = businesses.filter(b => (b.distance ?? 0) <= radiusMiles);
    console.log(`Filtered from ${businesses.length} to ${filtered.length} within ${radiusMiles} miles`);
    return filtered;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};
