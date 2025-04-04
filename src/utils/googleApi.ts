
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
  
  // Convert miles to meters for the API
  const radiusInMeters = radiusMiles * 1609.34;
  
  try {
    await loadGoogleMapsScript();
    
    // Create a Geocoder to convert location to coordinates
    const geocoder = new window.google.maps.Geocoder();
    
    // Get coordinates for the location
    const geocodeResult = await new Promise((resolve, reject) => {
      geocoder.geocode({ address: location }, (results: any, status: any) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });

    // Create Places Service
    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    // Search for businesses with pagination
    let allResults: any[] = [];
    const searchAndGetNextPage = (pageToken?: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        service.textSearch({
          query: keyword,
          location: geocodeResult,
          radius: radiusInMeters, // Use the radius in meters
          pageToken: pageToken
        }, (results: any, status: any, pagination: any) => {
          if (status === 'OK') {
            allResults = [...allResults, ...results];
            
            // If we have less than 40 results and there's a next page, get more results
            if (pagination.hasNextPage && allResults.length < 40) {
              // Wait a short delay before requesting the next page (required by Google Places API)
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

    // Get initial results and handle pagination
    const searchResults = await searchAndGetNextPage();
    console.log('Total results fetched:', searchResults.length);

    // Transform the results to match our interface
    const businesses = await Promise.all(
      searchResults.slice(0, 40).map(async (place) => {
        // Get additional details for each place
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

        return {
          id: place.place_id,
          name: details.name || place.name,
          phone: details.formatted_phone_number || 'N/A',
          email: 'N/A', // Email is not available through Places API
          website: details.website || 'N/A',
          reviewCount: details.user_ratings_total || 0,
          rating: details.rating || 0,
          address: details.formatted_address || place.formatted_address,
        };
      })
    );

    console.log('Fetched businesses:', businesses);
    return businesses;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};
