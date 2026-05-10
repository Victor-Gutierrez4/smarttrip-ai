import { describe, expect, it } from 'vitest';
import { calculateBudgetSummary, calculateTripTotal, getBudgetLevelFromTripBudget } from '../services/budgetCalculator';

describe('Budget Calculator', () => {
  it('calculates total correctly', () => {
    expect(calculateTripTotal(500, 200, 100, 400)).toBe(1200);
  });

  it('changes totals by budget level and duration', () => {
    const result = calculateBudgetSummary({ budgetLevel: 'moderate', duration: 5 });

    expect(result.hotelNightly).toBe(170);
    expect(result.hotelTotal).toBe(850);
    expect(result.foodTotal).toBe(425);
    expect(result.transportationTotal).toBe(175);
    expect(result.flightTotal).toBe(500);
    expect(result.estimatedTotal).toBe(1950);
  });

  it('uses a selected hotel nightly rate when provided', () => {
    const result = calculateBudgetSummary({ budgetLevel: 'moderate', duration: 5, hotelNightly: 220 });

    expect(result.hotelNightly).toBe(220);
    expect(result.hotelTotal).toBe(1100);
    expect(result.estimatedTotal).toBe(2200);
  });

  it('compares estimated total against the selected trip budget', () => {
    const result = calculateBudgetSummary({
      budgetLevel: 'budget',
      duration: 2,
      hotelNightly: 100,
      maxBudget: 600
    });

    expect(result.budgetLimit).toBe(600);
    expect(result.dailyBudget).toBe(300);
    expect(result.budgetRemaining).toBe(24);
  });

  it('uses the starting location and round trip setting for travel cost', () => {
    const roundTrip = calculateBudgetSummary({
      budgetLevel: 'moderate',
      duration: 4,
      startLocation: 'Los Angeles, CA',
      destination: 'Tokyo, Japan',
      travelers: 2,
      roundTrip: true
    });
    const oneWay = calculateBudgetSummary({
      budgetLevel: 'moderate',
      duration: 4,
      startLocation: 'Los Angeles, CA',
      destination: 'Tokyo, Japan',
      travelers: 2,
      roundTrip: false
    });

    expect(roundTrip.flightTotal).toBe(oneWay.flightTotal * 2);
    expect(roundTrip.startLocation).toBe('Los Angeles, CA');
    expect(roundTrip.roundTrip).toBe(true);
  });

  it('derives travel style from budget per day', () => {
    expect(getBudgetLevelFromTripBudget(500, 5)).toBe('budget');
    expect(getBudgetLevelFromTripBudget(1850, 5)).toBe('moderate');
    expect(getBudgetLevelFromTripBudget(4000, 5)).toBe('luxury');
  });
});
