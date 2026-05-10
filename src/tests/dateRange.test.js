import { describe, expect, it } from 'vitest';
import { calculateTripDuration, formatTripDates, getMinEndDate } from '../services/dateRange';

describe('Date range utilities', () => {
  it('calculates inclusive trip duration from start and end dates', () => {
    expect(calculateTripDuration('2026-06-08', '2026-06-12')).toBe(5);
  });

  it('uses one day when the end date is before the start date', () => {
    expect(calculateTripDuration('2026-06-12', '2026-06-08')).toBe(1);
  });

  it('formats selected trip dates for display', () => {
    expect(formatTripDates('2026-06-08', '2026-06-12')).toBe('Jun 8, 2026 - Jun 12, 2026');
  });

  it('sets the earliest selectable end date from the start date', () => {
    expect(getMinEndDate('2026-06-08')).toBe('2026-06-08');
  });
});
