const budgetProfiles = {
  budget: {
    hotelNightly: 95,
    restaurantDaily: 45,
    transportDaily: 18,
    flightEstimate: 150
  },
  moderate: {
    hotelNightly: 170,
    restaurantDaily: 85,
    transportDaily: 35,
    flightEstimate: 400
  },
  luxury: {
    hotelNightly: 340,
    restaurantDaily: 165,
    transportDaily: 80,
    flightEstimate: 900
  }
};

function normalizeLocation(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9,\s]/g, '')
    .trim();
}

function estimateTravelCost(startLocation, destination, roundTrip = true, travelers = 1) {
  const origin = normalizeLocation(startLocation);
  const target = normalizeLocation(destination);
  const sameCity = origin && target && (origin.includes(target.split(',')[0]) || target.includes(origin.split(',')[0]));

  let baseCost;
  if (!origin || !target || origin === target) {
    baseCost = 40;
  } else if (sameCity) {
    baseCost = 60;
  } else if (origin.split(',').slice(-1)[0] && target.split(',').slice(-1)[0] && origin.split(',').slice(-1)[0] === target.split(',').slice(-1)[0]) {
    baseCost = 140;
  } else if (origin.split(',').length > 1 && target.split(',').length > 1 && origin.split(',').slice(-1)[0] !== target.split(',').slice(-1)[0]) {
    baseCost = 520;
  } else {
    baseCost = 280;
  }

  const roundTripFactor = roundTrip ? 2 : 1;
  const travelerFactor = Math.max(Number(travelers) || 1, 1);
  return Math.round(baseCost * roundTripFactor * travelerFactor);
}

export function getBudgetProfile(level = 'moderate') {
  return budgetProfiles[level] || budgetProfiles.moderate;
}

export function getBudgetLevelFromTripBudget(maxBudget, duration, travelers = 1) {
  const days = Math.max(Number(duration) || 1, 1);
  const people = Math.max(Number(travelers) || 1, 1);
  const dailyBudget = (Number(maxBudget) || 1500) / days;
  const perPerson = dailyBudget / people;

  if (perPerson < 150) {
    return 'budget';
  }

  if (perPerson > 650) {
    return 'luxury';
  }

  return 'moderate';
}

export function calculateTripTotal(hotelCost, foodCost, transportCost, flightCost) {
  return hotelCost + foodCost + transportCost + flightCost;
}

export function calculateBudgetSummary({ budgetLevel, duration, hotelNightly, maxBudget, travelers, roundTrip, startLocation, destination }) {
  const days = Math.max(Number(duration) || 1, 1);
  const people = Math.max(Number(travelers) || 1, 1);
  const budgetLimit = Number(maxBudget) || 1500;
  const effectiveBudgetLevel = budgetLevel || getBudgetLevelFromTripBudget(budgetLimit, days, people);
  const profile = getBudgetProfile(effectiveBudgetLevel);
  const extraHotelSurcharge = Math.max(people - 2, 0) * 25;
  const nightlyHotelRate = Number(hotelNightly) || profile.hotelNightly + extraHotelSurcharge;
  const hotelTotal = nightlyHotelRate * days;
  const foodTotal = profile.restaurantDaily * days * people;
  const transportationTotal = profile.transportDaily * days * people;
  const flightTotal = estimateTravelCost(startLocation, destination, roundTrip, people);
  const groundTotal = hotelTotal + foodTotal + transportationTotal;
  const estimatedTotal = calculateTripTotal(hotelTotal, foodTotal, transportationTotal, flightTotal);

  return {
    budgetLevel: effectiveBudgetLevel,
    hotelNightly: nightlyHotelRate,
    hotelTotal,
    foodTotal,
    transportationTotal,
    flightTotal,
    estimatedTotal,
    dailyAverage: Math.round(groundTotal / days),
    budgetLimit,
    budgetRemaining: budgetLimit - estimatedTotal,
    dailyBudget: Math.round(budgetLimit / days),
    dailyBudgetPerPerson: Math.round(budgetLimit / days / people),
    travelers: people,
    roundTrip: Boolean(roundTrip),
    startLocation: String(startLocation || ''),
    destination: String(destination || '')
  };
}
