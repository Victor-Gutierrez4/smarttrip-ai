import { getBudgetProfile } from './budgetCalculator';

const hotelStyles = ['Central Hotel', 'Garden Suites', 'Vista House', 'Market Stay', 'Heritage Inn'];
const restaurantStyles = ['Table', 'Kitchen', 'Bistro', 'Noodle Bar', 'Grill'];

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
    keywords: ['london', 'england', 'uk'],
    neighborhoods: ['Soho', 'Shoreditch', 'Covent Garden', 'South Bank'],
    cuisines: ['Gastropub', 'Indian', 'Afternoon tea', 'Modern British']
  }
];

const fallbackProfile = {
  neighborhoods: ['Old Town', 'City Center', 'Riverside', 'Arts District'],
  cuisines: ['Modern local', 'Street food', 'Regional cafe', 'Market kitchen']
};

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

export async function fetchHotels({ destination, pointsOfInterest = [], budgetLevel = 'moderate' }) {
  const profile = getBudgetProfile(budgetLevel);
  const destinationProfile = getDestinationProfile(destination);
  const seed = hashText(destination);
  const city = cityName(destination);

  return hotelStyles.slice(0, 3).map((style, index) => {
    const anchor = pointsOfInterest[index % pointsOfInterest.length] || city;
    const neighborhood = pick(destinationProfile.neighborhoods, seed, index);

    return {
      id: `hotel-${index}`,
      name: `${neighborhood} ${style}`,
      rating: Number(scoreFromText(destination + style + neighborhood, index).toFixed(1)),
      estimatedPrice: profile.hotelNightly + ((seed + index * 23) % 55),
      distance: `${(0.3 + ((seed + index * 11) % 16) / 10).toFixed(1)} mi from ${anchor}`
    };
  });
}

export async function fetchRestaurants({ destination, budgetLevel = 'moderate' }) {
  const destinationProfile = getDestinationProfile(destination);
  const seed = hashText(destination);
  const city = cityName(destination);
  const priceByBudget = {
    budget: '$',
    moderate: '$$',
    luxury: '$$$$'
  };

  return restaurantStyles.slice(0, 3).map((style, index) => {
    const cuisine = pick(destinationProfile.cuisines, seed, index);
    const neighborhood = pick(destinationProfile.neighborhoods, seed, index + 1);

    return {
      id: `restaurant-${index}`,
      name: `${city} ${cuisine} ${style}`,
      rating: Number(scoreFromText(destination + cuisine + style, index).toFixed(1)),
      priceCategory: priceByBudget[budgetLevel] || '$$',
      cuisine: `${cuisine} near ${neighborhood}`
    };
  });
}

export function hasGooglePlacesKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_API_KEY && import.meta.env.VITE_GOOGLE_API_KEY !== 'YOUR_API_KEY');
}
