export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('CDN-Cache-Control', 'no-store');
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store');

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
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${width}&key=${apiKey}`
    );

    if (!googleResponse.ok) {
      const details = await googleResponse.text().catch(() => '');
      return response.status(googleResponse.status).json({
        error: 'Google photo request failed.',
        details: details.slice(0, 300)
      });
    }

    const contentType = googleResponse.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = Buffer.from(await googleResponse.arrayBuffer());

    response.setHeader('Content-Type', contentType);
    response.setHeader('Content-Length', imageBuffer.length);
    return response.status(200).send(imageBuffer);
  } catch {
    return response.status(502).json({ error: 'Google photo request failed.' });
  }
}
