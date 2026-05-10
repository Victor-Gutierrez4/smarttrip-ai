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

function normalizeLocation(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9,\s]/g, '')
    .trim();
}

const stateAliases = {
  alabama: 'al',
  alaska: 'ak',
  arizona: 'az',
  arkansas: 'ar',
  california: 'ca',
  colorado: 'co',
  connecticut: 'ct',
  delaware: 'de',
  florida: 'fl',
  georgia: 'ga',
  hawaii: 'hi',
  idaho: 'id',
  illinois: 'il',
  indiana: 'in',
  iowa: 'ia',
  kansas: 'ks',
  kentucky: 'ky',
  louisiana: 'la',
  maine: 'me',
  maryland: 'md',
  massachusetts: 'ma',
  michigan: 'mi',
  minnesota: 'mn',
  mississippi: 'ms',
  missouri: 'mo',
  montana: 'mt',
  nebraska: 'ne',
  nevada: 'nv',
  'new hampshire': 'nh',
  'new jersey': 'nj',
  'new mexico': 'nm',
  'new york': 'ny',
  'north carolina': 'nc',
  'north dakota': 'nd',
  ohio: 'oh',
  oklahoma: 'ok',
  oregon: 'or',
  pennsylvania: 'pa',
  'rhode island': 'ri',
  'south carolina': 'sc',
  'south dakota': 'sd',
  tennessee: 'tn',
  texas: 'tx',
  utah: 'ut',
  vermont: 'vt',
  virginia: 'va',
  washington: 'wa',
  'west virginia': 'wv',
  wisconsin: 'wi',
  wyoming: 'wy'
};

const nearbyStatePairs = new Set([
  'nj:ny',
  'ny:nj',
  'nj:pa',
  'pa:nj',
  'ny:ct',
  'ct:ny',
  'ny:pa',
  'pa:ny',
  'dc:md',
  'md:dc',
  'dc:va',
  'va:dc',
  'md:va',
  'va:md'
]);

function locationParts(location) {
  const parts = normalizeLocation(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const city = parts[0] || '';
  const regionText = parts.at(-1) || '';
  const region = stateAliases[regionText] || regionText;

  return {
    normalized: parts.join(', '),
    city,
    region
  };
}

function estimateTravelCost(startLocation, destination, roundTrip = true, travelers = 1, fallbackEstimate = 400) {
  const originParts = locationParts(startLocation);
  const targetParts = locationParts(destination);
  const origin = normalizeLocation(startLocation);
  const target = normalizeLocation(destination);
  const sameCity =
    originParts.city &&
    targetParts.city &&
    (originParts.city === targetParts.city || origin.includes(targetParts.city) || target.includes(originParts.city));
  const sameRegion = originParts.region && targetParts.region && originParts.region === targetParts.region;
  const nearbyRegion = nearbyStatePairs.has(`${originParts.region}:${targetParts.region}`);

  let baseCost;
  if (!origin || !target) {
    return Math.round(fallbackEstimate * Math.max(Number(travelers) || 1, 1));
  } else if (origin === target) {
    baseCost = 30;
  } else if (sameCity) {
    baseCost = 45;
  } else if (sameRegion) {
    baseCost = 90;
  } else if (nearbyRegion) {
    baseCost = 110;
  } else if (originParts.region && targetParts.region && originParts.region !== targetParts.region) {
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

export function getTravelCostLabel(startLocation, destination) {
  const originParts = locationParts(startLocation);
  const targetParts = locationParts(destination);
  const sameRegion = originParts.region && targetParts.region && originParts.region === targetParts.region;
  const nearbyRegion = nearbyStatePairs.has(`${originParts.region}:${targetParts.region}`);

  if (!startLocation || !destination) {
    return 'Travel estimate';
  }

  if (sameRegion || nearbyRegion) {
    return 'Regional travel estimate';
  }

  return 'Flight estimate';
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
  const flightTotal = estimateTravelCost(startLocation, destination, roundTrip, people, profile.flightEstimate);
  const travelCostLabel = getTravelCostLabel(startLocation, destination);
  const groundTotal = hotelTotal + foodTotal + transportationTotal;
  const estimatedTotal = calculateTripTotal(hotelTotal, foodTotal, transportationTotal, flightTotal);

  return {
    budgetLevel: effectiveBudgetLevel,
    hotelNightly: nightlyHotelRate,
    hotelTotal,
    foodTotal,
    transportationTotal,
    flightTotal,
    travelCostLabel,
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
