const budgetProfiles = {
  budget: {
    hotelNightly: 95,
    restaurantDaily: 45,
    transportDaily: 18,
    flightEstimate: 250
  },
  moderate: {
    hotelNightly: 170,
    restaurantDaily: 85,
    transportDaily: 35,
    flightEstimate: 500
  },
  luxury: {
    hotelNightly: 340,
    restaurantDaily: 165,
    transportDaily: 80,
    flightEstimate: 1200
  }
};

export function getBudgetProfile(level = 'moderate') {
  return budgetProfiles[level] || budgetProfiles.moderate;
}

export function getBudgetLevelFromTripBudget(maxBudget, duration) {
  const days = Math.max(Number(duration) || 1, 1);
  const dailyBudget = (Number(maxBudget) || 1500) / days;

  if (dailyBudget < 180) {
    return 'budget';
  }

  if (dailyBudget > 650) {
    return 'luxury';
  }

  return 'moderate';
}

export function calculateTripTotal(hotelCost, foodCost, transportCost, flightCost) {
  return hotelCost + foodCost + transportCost + flightCost;
}

export function calculateBudgetSummary({ budgetLevel, duration, hotelNightly, maxBudget }) {
  const days = Math.max(Number(duration) || 1, 1);
  const budgetLimit = Number(maxBudget) || 1500;
  const effectiveBudgetLevel = budgetLevel || getBudgetLevelFromTripBudget(budgetLimit, days);
  const profile = getBudgetProfile(effectiveBudgetLevel);
  const nightlyHotelRate = Number(hotelNightly) || profile.hotelNightly;
  const hotelTotal = nightlyHotelRate * days;
  const foodTotal = profile.restaurantDaily * days;
  const transportationTotal = profile.transportDaily * days;
  const flightTotal = profile.flightEstimate;

  return {
    budgetLevel: effectiveBudgetLevel,
    hotelNightly: nightlyHotelRate,
    hotelTotal,
    foodTotal,
    transportationTotal,
    flightTotal,
    estimatedTotal: calculateTripTotal(hotelTotal, foodTotal, transportationTotal, flightTotal),
    dailyAverage: Math.round((hotelTotal + foodTotal + transportationTotal) / days),
    budgetLimit,
    budgetRemaining: budgetLimit - calculateTripTotal(hotelTotal, foodTotal, transportationTotal, flightTotal),
    dailyBudget: Math.round(budgetLimit / days)
  };
}
