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

  it('does not repeat user POIs when the trip is longer than the POI list', () => {
    const result = generateItinerary(['San Andres Beach', 'Johnny Cay', 'Rocky Cay'], 5, 'moderate', 'Colombia');

    expect(result).toHaveLength(5);
    expect(result.map((day) => day.primaryPlace)).toEqual([
      'San Andres Beach',
      'Johnny Cay',
      'Rocky Cay',
      'Museum district',
      'Popular shopping street'
    ]);
  });

  it('adds visual and nearby-place context to each day', () => {
    const result = generateItinerary(['Tokyo Tower'], 1, 'moderate', 'Tokyo, Japan', [
      { query: 'Tokyo Tower', name: 'Tokyo Tower', photos: ['/api/places/photo?name=tokyo-tower'] }
    ]);

    expect(result[0].primaryPlace).toBe('Tokyo Tower');
    expect(result[0].nearbyPlace).toBeTruthy();
    expect(result[0].imageUrl).toContain('/api/places/photo');
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

  it('suggests unique nearby places instead of repeating the same POI', () => {
    const result = generateItinerary(
      ['San Andres Beach'],
      3,
      'moderate',
      'Colombia',
      [
        { query: 'San Andres Beach', name: 'San Andres Beach', photos: ['/api/places/photo?name=beach'] },
        { query: 'Johnny Cay', name: 'Johnny Cay', source: 'nearby-suggestion', photos: ['/api/places/photo?name=cay'] },
        { query: 'Hoyo Soplador', name: 'Hoyo Soplador', source: 'nearby-suggestion', photos: ['/api/places/photo?name=hoyo'] }
      ]
    );

    expect(result.map((day) => day.primaryPlace)).toEqual(['San Andres Beach', 'Johnny Cay', 'Hoyo Soplador']);
    expect(new Set(result.map((day) => day.imageUrl)).size).toBe(3);
  });

  it('uses the selected hotel photo as a unique itinerary option when needed', () => {
    const result = generateItinerary(['San Andres Beach'], 2, 'moderate', 'Colombia', [
      { query: 'San Andres Beach', name: 'San Andres Beach', photos: ['/api/places/photo?name=beach'] }
    ], {
      name: 'Island Hotel',
      distance: 'San Andres Island',
      photos: ['/api/places/photo?name=hotel']
    });

    expect(result[1].primaryPlace).toBe('Island Hotel');
    expect(result[1].imageSource).toBe('Selected hotel photo');
  });
});
