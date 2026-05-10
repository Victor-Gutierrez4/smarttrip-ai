import { describe, expect, it } from 'vitest';
import { fetchHotels, fetchRestaurants } from '../services/googlePlaces';

describe('Google Places fallback recommendations', () => {
  it('generates different recommendations for different destinations', async () => {
    const tokyoHotels = await fetchHotels({ destination: 'Tokyo, Japan', budgetLevel: 'moderate' });
    const parisHotels = await fetchHotels({ destination: 'Paris, France', budgetLevel: 'moderate' });
    const tokyoRestaurants = await fetchRestaurants({ destination: 'Tokyo, Japan', budgetLevel: 'moderate' });
    const parisRestaurants = await fetchRestaurants({ destination: 'Paris, France', budgetLevel: 'moderate' });

    expect(tokyoHotels[0].name).not.toBe(parisHotels[0].name);
    expect(tokyoRestaurants[0].cuisine).not.toBe(parisRestaurants[0].cuisine);
  });
});
