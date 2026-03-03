
declare global {
  interface Window {
    google: any;
  }
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3958.8;
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
    if (window.google?.maps?.places?.Place) {
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

    const { places } = await window.google.maps.places.Place.searchByText({
      textQuery: `${keyword} in ${location}`,
      fields: ['displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount', 'location', 'id'],
      locationBias: new window.google.maps.Circle({ center: geocodeResult, radius: radiusInMeters }),
      maxResultCount: 20,
    });

    console.log('Results fetched:', places?.length ?? 0);

    if (!places || places.length === 0) {
      return [];
    }

    const businesses = places.map((place: any) => {
      const placeLat = place.location?.lat();
      const placeLng = place.location?.lng();
      const distance = placeLat != null && placeLng != null
        ? haversineDistance(centerLat, centerLng, placeLat, placeLng)
        : 0;

      return {
        id: place.id || '',
        name: place.displayName || 'N/A',
        phone: place.nationalPhoneNumber || 'N/A',
        email: 'N/A',
        website: place.websiteURI || 'N/A',
        reviewCount: place.userRatingCount || 0,
        rating: place.rating || 0,
        address: place.formattedAddress || 'N/A',
        distance: Math.round(distance * 10) / 10,
      };
    });

    const filtered = businesses.filter((b: any) => (b.distance ?? 0) <= radiusMiles);
    console.log(`Filtered from ${businesses.length} to ${filtered.length} within ${radiusMiles} miles`);
    return filtered;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};
