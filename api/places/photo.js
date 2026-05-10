export default async function handler(request, response) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const photoName = String(request.query.name || '');
  const width = Math.min(Math.max(Number(request.query.w) || 900, 200), 1200);

  if (!apiKey) {
    return response.status(503).json({ error: 'Google Places API key is not configured.' });
  }

  if (!photoName.startsWith('places/') || !photoName.includes('/photos/')) {
    return response.status(400).json({ error: 'Invalid photo name.' });
  }

  try {
    const googleResponse = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${width}&skipHttpRedirect=true&key=${apiKey}`
    );

    if (!googleResponse.ok) {
      return response.status(googleResponse.status).json({ error: 'Google photo request failed.' });
    }

    const data = await googleResponse.json();
    if (!data.photoUri) {
      return response.status(404).json({ error: 'Photo not found.' });
    }

    return response.redirect(302, data.photoUri);
  } catch {
    return response.status(502).json({ error: 'Google photo request failed.' });
  }
}
