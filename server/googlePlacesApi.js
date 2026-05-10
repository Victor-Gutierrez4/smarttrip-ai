const placesEndpoint = 'https://places.googleapis.com/v1/places:searchText';
const fieldMask = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.priceLevel',
  'places.types'
].join(',');
const maxResults = 3;
const cacheTtlMs = 15 * 60 * 1000;
const hourlyLimit = 40;

const cache = new Map();
const rateBuckets = new Map();

function cleanText(value = '') {
  return String(value).replace(/[^\w\s,.'-]/g, '').trim().slice(0, 120);
}

function getClientId(request) {
  return (
    request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    request.socket?.remoteAddress ||
    'anonymous'
  );
}

function checkRateLimit(request) {
  const clientId = getClientId(request);
  const now = Date.now();
  const bucket = rateBuckets.get(clientId) || { count: 0, resetAt: now + 60 * 60 * 1000 };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 60 * 60 * 1000;
  }

  bucket.count += 1;
  rateBuckets.set(clientId, bucket);

  return {
    allowed: bucket.count <= hourlyLimit,
    resetAt: bucket.resetAt
  };
}

function getCached(cacheKey) {
  const cached = cache.get(cacheKey);
  if (!cached || Date.now() > cached.expiresAt) {
    cache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function setCached(cacheKey, data) {
  cache.set(cacheKey, {
    data,
    expiresAt: Date.now() + cacheTtlMs
  });
}

function mapPriceLevel(priceLevel) {
  const priceMap = {
    PRICE_LEVEL_INEXPENSIVE: '$',
    PRICE_LEVEL_MODERATE: '$$',
    PRICE_LEVEL_EXPENSIVE: '$$$',
    PRICE_LEVEL_VERY_EXPENSIVE: '$$$$'
  };

  return priceMap[priceLevel] || '$$';
}

function mapPlace(place, category, index, budgetLevel) {
  const displayName = place.displayName?.text || (category === 'hotels' ? 'Recommended hotel' : 'Recommended restaurant');
  const rating = Number(place.rating || 4.2);

  if (category === 'hotels') {
    return {
      id: place.id || `google-hotel-${index}`,
      name: displayName,
      rating,
      estimatedPrice: estimateHotelPrice(place.priceLevel, budgetLevel, index),
      distance: place.formattedAddress || 'Google Places result'
    };
  }

  return {
    id: place.id || `google-restaurant-${index}`,
    name: displayName,
    rating,
    priceCategory: mapPriceLevel(place.priceLevel),
    cuisine: formatCuisine(place.types)
  };
}

function estimateHotelPrice(priceLevel, budgetLevel, index) {
  const fallback = {
    budget: 95,
    moderate: 170,
    luxury: 340
  };
  const priceByGoogleLevel = {
    PRICE_LEVEL_INEXPENSIVE: 105,
    PRICE_LEVEL_MODERATE: 175,
    PRICE_LEVEL_EXPENSIVE: 285,
    PRICE_LEVEL_VERY_EXPENSIVE: 420
  };

  return priceByGoogleLevel[priceLevel] || fallback[budgetLevel] + index * 25 || 170;
}

function formatCuisine(types = []) {
  const readableType = types.find((type) => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(type));
  return readableType ? readableType.replaceAll('_', ' ') : 'Restaurant';
}

function buildTextQuery({ category, destination, pointOfInterest }) {
  const placeType = category === 'hotels' ? 'hotels' : 'restaurants';
  const location = pointOfInterest ? `${destination} near ${pointOfInterest}` : destination;
  return `${placeType} in ${location}`;
}

export async function handlePlacesRequest(request, response, category) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const destination = cleanText(request.query.destination);
  const pointOfInterest = cleanText(request.query.poi);
  const budgetLevel = cleanText(request.query.budgetLevel || 'moderate');

  if (!destination) {
    return response.status(400).json({ error: 'Destination is required.' });
  }

  if (!apiKey) {
    return response.status(503).json({ error: 'Google Places API key is not configured.' });
  }

  const limit = checkRateLimit(request);
  if (!limit.allowed) {
    return response.status(429).json({
      error: 'Search limit reached. Try again later.',
      resetAt: new Date(limit.resetAt).toISOString()
    });
  }

  const textQuery = buildTextQuery({ category, destination, pointOfInterest });
  const cacheKey = `${category}:${budgetLevel}:${textQuery.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return response.status(200).json({ results: cached, source: 'cache' });
  }

  try {
    const googleResponse = await fetch(placesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: maxResults,
        languageCode: 'en'
      })
    });

    if (!googleResponse.ok) {
      return response.status(googleResponse.status).json({
        error: 'Google Places request failed.'
      });
    }

    const data = await googleResponse.json();
    const results = (data.places || [])
      .slice(0, maxResults)
      .map((place, index) => mapPlace(place, category, index, budgetLevel));

    setCached(cacheKey, results);

    return response.status(200).json({
      results,
      source: 'google-places'
    });
  } catch {
    return response.status(502).json({
      error: 'Google Places is temporarily unavailable.'
    });
  }
}
