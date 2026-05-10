import { describe, expect, it } from 'vitest';
import { generateItinerary } from '../services/itineraryGenerator';

describe('Itinerary Generator', () => {
  it('creates itinerary days', () => {
    const result = generateItinerary(['Tokyo Tower', 'Shibuya']);

    expect(result.length).toBe(2);
  });

  it('uses requested duration even when there are fewer attractions', () => {
    const result = generateItinerary(['Akihabara'], 3, 'budget');

    expect(result).toHaveLength(3);
    expect(result[0].activities[0]).toContain('Akihabara');
  });

  it('adds visual and nearby-place context to each day', () => {
    const result = generateItinerary(['Tokyo Tower'], 1, 'moderate', 'Tokyo, Japan');

    expect(result[0].primaryPlace).toBe('Tokyo Tower');
    expect(result[0].nearbyPlace).toBeTruthy();
    expect(result[0].imageUrl).toContain('images.unsplash.com');
    expect(result[0].imageAlt).toContain('Tokyo Tower');
  });

  it('uses non-repeating provided attraction photos first', () => {
    const result = generateItinerary(
      ['San Andres Beach', 'Johnny Cay'],
      2,
      'moderate',
      'Colombia',
      [
        { query: 'San Andres Beach', photos: ['/api/places/photo?name=photo-one'] },
        { query: 'Johnny Cay', photos: ['/api/places/photo?name=photo-two'] }
      ]
    );

    expect(result[0].imageUrl).toBe('/api/places/photo?name=photo-one');
    expect(result[1].imageUrl).toBe('/api/places/photo?name=photo-two');
    expect(result[0].imageUrl).not.toBe(result[1].imageUrl);
  });
});
