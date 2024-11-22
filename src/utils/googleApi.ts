import axios from 'axios';

const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const searchBusinesses = async (location: string, keyword: string) => {
  console.log('Fetching businesses for:', { location, keyword });
  
  try {
    // First, get location coordinates
    const geocodeResponse = await axios.get(
      `${PLACES_API_BASE_URL}/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`
    );
    
    if (!geocodeResponse.data.results[0]) {
      throw new Error('Location not found');
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    
    // Then, search for businesses
    const searchResponse = await axios.get(
      `${PLACES_API_BASE_URL}/textsearch/json?query=${encodeURIComponent(keyword)}&location=${lat},${lng}&radius=50000&key=${API_KEY}`
    );

    // Transform the data to match our interface
    const businesses = await Promise.all(
      searchResponse.data.results.map(async (place: any) => {
        // Get additional details for each place
        const detailsResponse = await axios.get(
          `${PLACES_API_BASE_URL}/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address,website,rating,user_ratings_total&key=${API_KEY}`
        );

        const details = detailsResponse.data.result;
        
        return {
          id: place.place_id,
          name: details.name,
          phone: details.formatted_phone_number || 'N/A',
          email: 'N/A', // Note: Email is not available through Places API
          website: details.website || 'N/A',
          reviewCount: details.user_ratings_total || 0,
          rating: details.rating || 0,
          address: details.formatted_address
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