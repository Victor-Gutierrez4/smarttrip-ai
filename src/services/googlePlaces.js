import { getBudgetProfile } from './budgetCalculator';

const hotelNames = ['Harbor View Hotel', 'Cityline Stay', 'Garden District Suites'];
const restaurantNames = ['Noodle & Co.', 'Saffron Table', 'The Local Grill'];
const cuisines = ['Japanese', 'Mediterranean', 'Modern local'];

function scoreFromText(text, index) {
  const seed = [...text].reduce((total, char) => total + char.charCodeAt(0), index * 17);
  return 4 + ((seed % 9) / 10);
}

export async function fetchHotels({ destination, pointsOfInterest = [], budgetLevel = 'moderate' }) {
  const profile = getBudgetProfile(budgetLevel);
  const anchor = pointsOfInterest[0] || destination || 'city center';

  return hotelNames.map((name, index) => ({
    id: `hotel-${index}`,
    name,
    rating: Number(scoreFromText(destination + name, index).toFixed(1)),
    estimatedPrice: profile.hotelNightly + index * 28,
    distance: `${(0.4 + index * 0.7).toFixed(1)} mi from ${anchor}`
  }));
}

export async function fetchRestaurants({ destination, budgetLevel = 'moderate' }) {
  const priceByBudget = {
    budget: '$',
    moderate: '$$',
    luxury: '$$$$'
  };

  return restaurantNames.map((name, index) => ({
    id: `restaurant-${index}`,
    name,
    rating: Number(scoreFromText(destination + name, index).toFixed(1)),
    priceCategory: priceByBudget[budgetLevel] || '$$',
    cuisine: cuisines[index % cuisines.length]
  }));
}

export function hasGooglePlacesKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_API_KEY && import.meta.env.VITE_GOOGLE_API_KEY !== 'YOUR_API_KEY');
}
