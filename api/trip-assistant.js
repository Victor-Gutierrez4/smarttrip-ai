import OpenAI from 'openai';

const primaryModel = 'gpt-5.4-mini';
const fallbackModel = 'gpt-5.4-mini';
const maxMessageLength = 600;
const maxHistoryItems = 6;
const maxRequestsPerHour = 20;
const rateBuckets = new Map();

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
    allowed: bucket.count <= maxRequestsPerHour,
    resetAt: bucket.resetAt
  };
}

function cleanText(value = '', limit = maxMessageLength) {
  return String(value).replace(/\s+/g, ' ').trim().slice(0, limit);
}

function summarizeTrip(trip = {}) {
  const hotels = (trip.hotels || [])
    .slice(0, 3)
    .map((hotel) => `${hotel.name} (${hotel.estimatedPrice || 'unknown'}/night, ${hotel.rating || 'n/a'} rating)`)
    .join('; ');
  const restaurants = (trip.restaurants || [])
    .slice(0, 3)
    .map((restaurant) => `${restaurant.name} (${restaurant.priceCategory || 'n/a'}, ${restaurant.rating || 'n/a'} rating)`)
    .join('; ');
  const itinerary = (trip.itinerary || [])
    .slice(0, 5)
    .map((day) => `Day ${day.day}: ${day.primaryPlace}`)
    .join('; ');

  return [
    `Destination: ${cleanText(trip.destination, 120) || 'not selected'}`,
    `Starting location: ${cleanText(trip.startLocation, 120) || 'not selected'}`,
    `Dates: ${cleanText(trip.dateRange, 120) || 'not selected'}`,
    `Duration: ${Number(trip.duration) || 0} days`,
    `Travelers: ${Number(trip.travelers) || 1}`,
    `Nightly budget: $${Number(trip.nightlyBudget) || 0}`,
    `Estimated total: $${Number(trip.estimatedTotal) || 0}`,
    `Selected hotel: ${cleanText(trip.selectedHotelName, 140) || 'none'}`,
    `Hotels: ${hotels || 'none loaded'}`,
    `Restaurants: ${restaurants || 'none loaded'}`,
    `Itinerary: ${itinerary || 'none loaded'}`
  ].join('\n');
}

function extractResponseText(aiResponse) {
  if (aiResponse.output_text) {
    return aiResponse.output_text;
  }

  const output = Array.isArray(aiResponse.output) ? aiResponse.output : [];
  const text = output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((content) => content.text || content.value || '')
    .filter(Boolean)
    .join('\n')
    .trim();

  return text;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const limit = checkRateLimit(request);
  if (!limit.allowed) {
    return response.status(429).json({
      error: 'Trip Assistant limit reached. Try again later.',
      resetAt: new Date(limit.resetAt).toISOString()
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: 'Trip Assistant API key is not configured.' });
  }

  const message = cleanText(request.body?.message);
  const history = Array.isArray(request.body?.history) ? request.body.history.slice(-maxHistoryItems) : [];

  if (!message) {
    return response.status(400).json({ error: 'A message is required.' });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const tripSummary = summarizeTrip(request.body?.trip);
  const conversation = history
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${cleanText(item.content, 400)}`)
    .join('\n');

  const requestBody = {
    max_output_tokens: 220,
    input: [
      {
        role: 'system',
        content:
          'You are Trip Assistant inside SmartTrip AI. Give concise, practical travel planning help using the provided trip context. Format answers for a small chatbox: no markdown headings, no bold text, no tables, no long intro phrases, and no more than 5 short bullets unless the user asks for detail. If exact booking prices or availability are unknown, say they are estimates. Do not invent reservations, policies, or live availability.'
      },
      {
        role: 'user',
        content: `Trip context:\n${tripSummary}\n\nRecent chat:\n${conversation || 'No previous messages.'}\n\nUser question: ${message}`
      }
    ]
  };

  try {
    let aiResponse;

    try {
      aiResponse = await client.responses.create({
        model: primaryModel,
        ...requestBody
      });
    } catch (error) {
      const status = error?.status || error?.code;
      const shouldFallback = status === 400 || status === 403 || status === 404;

      if (!shouldFallback) {
        throw error;
      }

      aiResponse = await client.responses.create({
        model: fallbackModel,
        ...requestBody
      });
    }

    const answer = extractResponseText(aiResponse);

    return response.status(200).json({
      answer: answer || 'I could not generate an answer right now.'
    });
  } catch (error) {
    return response.status(error.status || 502).json({
      error: 'Trip Assistant is temporarily unavailable.',
      details: error.message || 'No OpenAI error message returned.'
    });
  }
}
