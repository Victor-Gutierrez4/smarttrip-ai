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

export function calculateTripTotal(hotelCost, foodCost, transportCost, flightCost) {
  return hotelCost + foodCost + transportCost + flightCost;
}

export function calculateBudgetSummary({ budgetLevel, duration }) {
  const days = Math.max(Number(duration) || 1, 1);
  const profile = getBudgetProfile(budgetLevel);
  const hotelTotal = profile.hotelNightly * days;
  const foodTotal = profile.restaurantDaily * days;
  const transportationTotal = profile.transportDaily * days;
  const flightTotal = profile.flightEstimate;

  return {
    hotelTotal,
    foodTotal,
    transportationTotal,
    flightTotal,
    estimatedTotal: calculateTripTotal(hotelTotal, foodTotal, transportationTotal, flightTotal),
    dailyAverage: Math.round((hotelTotal + foodTotal + transportationTotal) / days)
  };
}

export const budgetOptions = Object.keys(budgetProfiles);
