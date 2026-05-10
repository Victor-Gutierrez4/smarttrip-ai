import { describe, expect, it } from 'vitest';
import { calculateBudgetSummary, calculateTripTotal } from '../services/budgetCalculator';

describe('Budget Calculator', () => {
  it('calculates total correctly', () => {
    expect(calculateTripTotal(500, 200, 100, 400)).toBe(1200);
  });

  it('changes totals by budget level and duration', () => {
    const result = calculateBudgetSummary({ budgetLevel: 'moderate', duration: 5 });

    expect(result.hotelTotal).toBe(850);
    expect(result.foodTotal).toBe(425);
    expect(result.transportationTotal).toBe(175);
    expect(result.flightTotal).toBe(500);
    expect(result.estimatedTotal).toBe(1950);
  });
});
