const mealIdeas = {
  budget: ['market lunch', 'local ramen stop', 'casual street-food dinner'],
  moderate: ['popular cafe lunch', 'sushi dinner', 'regional tasting menu'],
  luxury: ['hotel breakfast', 'chef-led lunch', 'fine dining reservation']
};

const nearbyIdeas = {
  budget: ['public market', 'neighborhood viewpoint', 'local transit stop'],
  moderate: ['museum district', 'popular shopping street', 'riverside walk'],
  luxury: ['rooftop lounge', 'design district', 'chef-led dining area']
};

const extraDayIdeas = {
  budget: ['Local public market', 'Neighborhood viewpoint', 'Historic walking area', 'Public beach walk', 'Local arts district'],
  moderate: ['Museum district', 'Popular shopping street', 'Scenic waterfront walk', 'Cultural center', 'Old town food area'],
  luxury: ['Design district', 'Private beach club area', 'Rooftop dining district', 'Marina promenade', 'Fine arts district']
};

function googleMapsSearchUrl(query, destination) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} ${destination}`.trim())}`;
}

export function generateItinerary(
  pointsOfInterest,
  duration = pointsOfInterest.length,
  budgetLevel = 'moderate',
  destination = '',
  itineraryPlaces = [],
  selectedHotel = null
) {
  const cleanPoints = pointsOfInterest.map((point) => point.trim()).filter(Boolean);
  const days = Math.max(Number(duration) || cleanPoints.length || 1, 1);
  const meals = mealIdeas[budgetLevel] || mealIdeas.moderate;
  const nearby = nearbyIdeas[budgetLevel] || nearbyIdeas.moderate;
  const extraPlaces = extraDayIdeas[budgetLevel] || extraDayIdeas.moderate;
  const usedImages = new Set();
  const usedPlaces = new Set();
  const hotelPlace =
    selectedHotel?.photos?.length > 0
      ? {
          query: selectedHotel.name,
          name: selectedHotel.name,
          address: selectedHotel.distance,
          photos: selectedHotel.photos,
          source: 'selected-hotel'
        }
      : null;
  const placeCandidates = [...itineraryPlaces, hotelPlace].filter(Boolean);
  
  const placePhotosMap = new Map();
  placeCandidates.forEach((place) => {
    const key = (place.name || place.query || '').toLowerCase().trim();
    if (key && place.photos?.length > 0) {
      placePhotosMap.set(key, place.photos);
    }
  });

  const plannedPlaceNames = [...cleanPoints, ...placeCandidates.map((place) => place.name || place.query), ...extraPlaces]
    .map((place) => place?.trim())
    .filter(Boolean);

  const allGooglePhotos = placeCandidates
    .flatMap((place) =>
      (place.photos || []).map((photo) => ({
        url: typeof photo === 'string' ? photo : photo?.url,
        placeName: place.name || place.query,
        source: place.source
      }))
    )
    .filter((p) => p.url);

  function placeKey(place) {
    return place.id || place.name || place.query;
  }

  function getFallbackPlace(index) {
    const fallbackName =
      plannedPlaceNames.find((place) => !usedPlaces.has(place)) ||
      `${destination || 'Destination'} exploration area`;

    usedPlaces.add(fallbackName);

    return {
      name: fallbackName,
      address: destination,
      imageUrl: '',
      imageSource: 'Open in Google Maps',
      placeUrl: googleMapsSearchUrl(fallbackName, destination)
    };
  }

  function getPlaceForDay(primary, index) {
    const exactMatch = placeCandidates.find(
      (place) => !usedPlaces.has(placeKey(place)) && (place.query === primary || place.name === primary)
    );
    const suggestedMatch = placeCandidates.find((place) => !usedPlaces.has(placeKey(place)));
    const place = exactMatch || suggestedMatch;

    if (!place) {
      return getFallbackPlace(index);
    }

    const imageUrl =
      (place.photos || []).find((photo) => {
        const url = typeof photo === 'string' ? photo : photo?.url;
        return url && !usedImages.has(url);
      }) || '';
    if (imageUrl) {
      usedImages.add(imageUrl);
    }

    const displayName = place.name || place.query;
    usedPlaces.add(placeKey(place));

    return {
      name: displayName,
      address: place.address,
      imageUrl,
      placeUrl: place.placeUrl || googleMapsSearchUrl(displayName, destination),
      imageSource:
        place.source === 'selected-hotel'
          ? 'Selected hotel photo'
          : place.source === 'nearby-suggestion'
            ? 'Nearby Google suggestion'
            : 'Point of interest photo'
    };
  }

  return Array.from({ length: days }, (_, index) => {
    const primary = plannedPlaceNames[index] || cleanPoints[0] || 'Explore the city center';
    const secondary = plannedPlaceNames[index + 1] || 'Visit a nearby landmark';
    const nearbyPlace = nearby[index % nearby.length];
    
    let imageUrl = '';
    let imageSource = 'Suggested travel destination';
    
    const place = getPlaceForDay(primary, index);
    
    if (place.imageUrl) {
      imageUrl = place.imageUrl;
      imageSource = place.imageSource;
    } else {
      const primaryLower = primary.toLowerCase().trim();
      const matchedPhotos = placePhotosMap.get(primaryLower);
      
      if (matchedPhotos && matchedPhotos.length > 0) {
        const photoIndex = index % matchedPhotos.length;
        imageUrl = matchedPhotos[photoIndex];
        imageSource = 'Google Places photo';
      } else if (allGooglePhotos.length > 0) {
        const photoIndex = index % allGooglePhotos.length;
        const googlePhoto = allGooglePhotos[photoIndex];
        imageUrl = googlePhoto.url;
        imageSource = googlePhoto.source === 'selected-hotel' 
          ? 'Hotel photo'
          : 'Google Places photo';
      }
    }

    return {
      day: index + 1,
      title: `Day ${index + 1}`,
      primaryPlace: place.name,
      nearbyPlace,
      imageUrl,
      placeUrl: place.placeUrl,
      imageSource,
      imageAlt: `${place.name} travel preview`,
      activities: [
        `Morning visit to ${place.name}`,
        `Lunch: ${meals[index % meals.length]}`,
        `Afternoon walk near ${secondary}`,
        `Nearby option: ${nearbyPlace}`,
        index === 0 ? 'Hotel check-in and neighborhood orientation' : 'Dinner and evening free time'
      ]
    };
  });
}
