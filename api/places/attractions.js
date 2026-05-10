const placesEndpoint = 'https://places.googleapis.com/v1/places:searchText';
const fieldMask = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.googleMapsUri',
  'places.photos'
].join(',');
const maxPoiLookups = 6;
const maxResults = 10;

function cleanText(value = '') {
  return String(value).replace(/[^\w\s,.'-]/g, '').trim().slice(0, 120);
}

function photoUrl(photoName) {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}&w=900`;
}

function mapPlace(place, query, source) {
  if (!place) {
    return null;
  }

  return {
    id: place.id,
    query,
    name: place.displayName?.text || query,
    address: place.formattedAddress,
    placeUrl: place.googleMapsUri,
    photos: (place.photos || []).slice(0, 10).map((photo) => photoUrl(photo.name)),
    source
  };
}

async function searchPlaces({ apiKey, textQuery, maxResultCount }) {
  const googleResponse = await fetch(placesEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount,
      languageCode: 'en'
    })
  });

  if (!googleResponse.ok) {
    return [];
  }

  const data = await googleResponse.json();
  return data.places || [];
}

export default async function handler(request, response) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const destination = cleanText(request.query.destination);
  const duration = Math.min(Math.max(Number(request.query.duration) || 1, 1), maxResults);
  const points = String(request.query.points || '')
    .split('|')
    .map(cleanText)
    .filter(Boolean)
    .slice(0, maxPoiLookups);

  if (!destination || points.length === 0) {
    return response.status(400).json({ error: 'Destination and points are required.' });
  }

  if (!apiKey) {
    return response.status(503).json({ error: 'Google Places API key is not configured.' });
  }

  try {
    const poiResults = await Promise.all(
      points.map(async (point) => {
        const places = await searchPlaces({
          apiKey,
          textQuery: `${point}, ${destination}`,
          maxResultCount: 1
        });

        return mapPlace(places[0], point, 'point-of-interest');
      })
    );
    const nearbyQuery = points[0]
      ? `top attractions beaches landmarks near ${points[0]}, ${destination}`
      : `top attractions beaches landmarks in ${destination}`;
    const nearbyPlaces = await searchPlaces({
      apiKey,
      textQuery: nearbyQuery,
      maxResultCount: maxResults
    });
    const merged = [...poiResults, ...nearbyPlaces.map((place) => mapPlace(place, place.displayName?.text, 'nearby-suggestion'))]
      .filter(Boolean)
      .filter((place) => place.photos.length > 0);
    const seen = new Set();
    const uniqueResults = merged.filter((place) => {
      const key = place.id || place.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });

    return response.status(200).json({
      results: uniqueResults.slice(0, duration),
      source: 'google-places'
    });
  } catch {
    return response.status(502).json({ error: 'Google attraction photo lookup failed.' });
  }
}
