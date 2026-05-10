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
});
