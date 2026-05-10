import { getBudgetProfile } from './budgetCalculator';

const hotelStylesByBudget = {
  budget: ['Budget Inn', 'Market Stay', 'Transit Lodge', 'Guest House', 'Value Hotel'],
  moderate: ['Central Hotel', 'Garden Suites', 'Vista House', 'Market Stay', 'Heritage Inn'],
  luxury: ['Grand Hotel', 'Premier Suites', 'Landmark Resort', 'Signature House', 'Luxury Tower']
};
const restaurantStylesByBudget = {
  budget: ['Counter', 'Noodle Bar', 'Cafe', 'Market Kitchen', 'Grill'],
  moderate: ['Table', 'Kitchen', 'Bistro', 'Noodle Bar', 'Grill'],
  luxury: ['Supper Club', 'Tasting Room', 'Brasserie', 'Omakase', 'Fine Dining']
};

const destinationProfiles = [
  {
    keywords: ['tokyo', 'japan', 'kyoto', 'osaka'],
    neighborhoods: ['Shinjuku', 'Ginza', 'Asakusa', 'Shibuya'],
    cuisines: ['Ramen', 'Sushi', 'Izakaya', 'Katsu']
  },
  {
    keywords: ['paris', 'france'],
    neighborhoods: ['Le Marais', 'Montmartre', 'Saint-Germain', 'Latin Quarter'],
    cuisines: ['French cafe', 'Bistro', 'Patisserie', 'Brasserie']
  },
  {
    keywords: ['new york', 'nyc', 'manhattan', 'brooklyn'],
    neighborhoods: ['SoHo', 'Chelsea', 'Midtown', 'Williamsburg'],
    cuisines: ['Deli', 'Pizza', 'Steakhouse', 'Modern American']
  },
  {
    keywords: ['miami', 'florida'],
    neighborhoods: ['Brickell', 'Wynwood', 'South Beach', 'Coral Gables'],
    cuisines: ['Cuban', 'Seafood', 'Latin fusion', 'Caribbean']
  },
  {
    keywords: ['colombia', 'san andres', 'san andrés', 'cartagena', 'bogota', 'bogotá'],
    neighborhoods: ['San Andres Island', 'Spratt Bight', 'La Loma', 'North End'],
    cuisines: ['Caribbean seafood', 'Colombian grill', 'Arepa cafe', 'Island kitchen']
  },
  {
    keywords: ['london', 'england', 'uk'],
    neighborhoods: ['Soho', 'Shoreditch', 'Covent Garden', 'South Bank'],
    cuisines: ['Gastropub', 'Indian', 'Afternoon tea', 'Modern British']
  }
];

const fallbackProfile = {
  neighborhoods: ['Old Town', 'City Center', 'Riverside', 'Arts District'],
  cuisines: ['Modern local', 'Street food', 'Regional cafe', 'Market kitchen']
};
const liveResultLimit = 3;

function scoreFromText(text, index) {
  const seed = [...text].reduce((total, char) => total + char.charCodeAt(0), index * 17);
  return 4 + ((seed % 9) / 10);
}

function hashText(text = '') {
  return [...text.toLowerCase()].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function getDestinationProfile(destination = '') {
  const normalizedDestination = destination.toLowerCase();
  return (
    destinationProfiles.find((profile) =>
      profile.keywords.some((keyword) => normalizedDestination.includes(keyword))
    ) || fallbackProfile
  );
}

function pick(items, seed, offset = 0) {
  return items[(seed + offset) % items.length];
}

function cityName(destination = 'City') {
  return destination.split(',')[0].trim() || 'City';
}

function googleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getBudgetStyles(stylesByBudget, budgetLevel) {
  return stylesByBudget[budgetLevel] || stylesByBudget.moderate;
}

async function requestLiveRecommendations(path, params) {
  if (typeof window === 'undefined') {
    throw new Error('Live recommendations are only available in the browser.');
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const response = await fetch(`${path}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Live recommendation request failed.');
  }

  const data = await response.json();
  return (data.results || [])
    .slice(0, liveResultLimit)
    .map((result) => ({
      ...result,
      resultSource: data.source === 'cache' ? 'google-places' : data.source
    }));
}

function buildFallbackHotels({ destination, pointsOfInterest = [], budgetLevel = 'moderate', travelers = 1 }) {
  const profile = getBudgetProfile(budgetLevel);
  const destinationProfile = getDestinationProfile(destination);
  const seed = hashText(destination);
  const city = cityName(destination);
  const hotelStyles = getBudgetStyles(hotelStylesByBudget, budgetLevel);
  const travelerSurcharge = Math.max(travelers - 2, 0) * 20;

  return hotelStyles.slice(0, 3).map((style, index) => {
    const anchor = pointsOfInterest[index % pointsOfInterest.length] || city;
    const neighborhood = pick(destinationProfile.neighborhoods, seed, index);

    return {
      id: `hotel-${index}`,
      name: `${neighborhood} ${style}`,
      rating: Number(scoreFromText(destination + style + neighborhood, index).toFixed(1)),
      estimatedPrice: profile.hotelNightly + travelerSurcharge + ((seed + index * 23) % 55),
      distance: `${(0.3 + ((seed + index * 11) % 16) / 10).toFixed(1)} mi from ${anchor}`,
      placeUrl: googleMapsSearchUrl(`${neighborhood} ${style} ${city}`),
      resultSource: 'demo'
    };
  });
}

function buildFallbackRestaurants({ destination, budgetLevel = 'moderate', travelers = 1 }) {
  const destinationProfile = getDestinationProfile(destination);
  const seed = hashText(destination);
  const city = cityName(destination);
  const priceByBudget = {
    budget: '$',
    moderate: '$$',
    luxury: '$$$$'
  };
  const restaurantStyles = getBudgetStyles(restaurantStylesByBudget, budgetLevel);
  const groupText = travelers > 3 ? 'group-friendly' : 'cozy';

  return restaurantStyles.slice(0, 3).map((style, index) => {
    const cuisine = pick(destinationProfile.cuisines, seed, index);
    const neighborhood = pick(destinationProfile.neighborhoods, seed, index + 1);

    return {
      id: `restaurant-${index}`,
      name: `${city} ${cuisine} ${style}`,
      rating: Number(scoreFromText(destination + cuisine + style, index).toFixed(1)),
      priceCategory: priceByBudget[budgetLevel] || '$$',
      cuisine: `${groupText} ${cuisine} near ${neighborhood}`,
      address: `${neighborhood}, ${city}`,
      placeUrl: googleMapsSearchUrl(`${city} ${cuisine} ${style}`),
      resultSource: 'demo'
    };
  });
}

export async function fetchHotels({ destination, pointsOfInterest = [], budgetLevel = 'moderate', travelers = 1 }) {
  try {
    const hotels = await requestLiveRecommendations('/api/places/hotels', {
      destination,
      poi: pointsOfInterest[0],
      budgetLevel,
      travelers
    });

    return hotels.length ? hotels : buildFallbackHotels({ destination, pointsOfInterest, budgetLevel, travelers });
  } catch {
    return buildFallbackHotels({ destination, pointsOfInterest, budgetLevel, travelers });
  }
}

export async function fetchRestaurants({ destination, pointsOfInterest = [], budgetLevel = 'moderate', travelers = 1 }) {
  try {
    const restaurants = await requestLiveRecommendations('/api/places/restaurants', {
      destination,
      poi: pointsOfInterest[0],
      budgetLevel,
      travelers
    });

    return restaurants.length ? restaurants : buildFallbackRestaurants({ destination, budgetLevel, travelers });
  } catch {
    return buildFallbackRestaurants({ destination, budgetLevel, travelers });
  }
}

export function getRecommendationModeLabel() {
  return 'Google Places API with demo fallback';
}

export function getRecommendationSourceLabel(hotels = [], restaurants = []) {
  const results = [...hotels, ...restaurants];
  if (!results.length) {
    return 'Loading recommendations';
  }

  return results.every((result) => result.resultSource === 'google-places')
    ? 'Live Google Places results'
    : 'Demo fallback results';
}
