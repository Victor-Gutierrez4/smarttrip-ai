const placesEndpoint = 'https://places.googleapis.com/v1/places:searchText';
const fieldMask = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.googleMapsUri',
  'places.photos'
].join(',');
const maxPoiLookups = 6;

function cleanText(value = '') {
  return String(value).replace(/[^\w\s,.'-]/g, '').trim().slice(0, 120);
}

function photoUrl(photoName) {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}&w=900`;
}

export default async function handler(request, response) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const destination = cleanText(request.query.destination);
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
    const results = await Promise.all(
      points.map(async (point) => {
        const googleResponse = await fetch(placesEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask
          },
          body: JSON.stringify({
            textQuery: `${point}, ${destination}`,
            maxResultCount: 1,
            languageCode: 'en'
          })
        });

        if (!googleResponse.ok) {
          return null;
        }

        const data = await googleResponse.json();
        const place = data.places?.[0];
        const photos = (place?.photos || []).slice(0, 10).map((photo) => photoUrl(photo.name));

        return {
          query: point,
          name: place?.displayName?.text || point,
          address: place?.formattedAddress,
          placeUrl: place?.googleMapsUri,
          photos
        };
      })
    );

    return response.status(200).json({
      results: results.filter(Boolean),
      source: 'google-places'
    });
  } catch {
    return response.status(502).json({ error: 'Google attraction photo lookup failed.' });
  }
}
