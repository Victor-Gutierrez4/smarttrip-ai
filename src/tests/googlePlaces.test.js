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

  it('changes fallback recommendation style by budget', async () => {
    const budgetHotels = await fetchHotels({ destination: 'Paris, France', budgetLevel: 'budget' });
    const luxuryHotels = await fetchHotels({ destination: 'Paris, France', budgetLevel: 'luxury' });
    const budgetRestaurants = await fetchRestaurants({ destination: 'Paris, France', budgetLevel: 'budget' });
    const luxuryRestaurants = await fetchRestaurants({ destination: 'Paris, France', budgetLevel: 'luxury' });

    expect(budgetHotels[0].name).not.toBe(luxuryHotels[0].name);
    expect(budgetRestaurants[0].name).not.toBe(luxuryRestaurants[0].name);
    expect(budgetRestaurants[0].priceCategory).toBe('$');
    expect(luxuryRestaurants[0].priceCategory).toBe('$$$$');
  });
});
