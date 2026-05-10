const maxPhotoLookups = 6;

export async function fetchAttractionPhotos({ destination, pointsOfInterest = [] }) {
  if (typeof window === 'undefined') {
    return [];
  }

  const uniquePoints = [...new Set(pointsOfInterest.map((point) => point.trim()).filter(Boolean))].slice(0, maxPhotoLookups);
  if (!destination || uniquePoints.length === 0) {
    return [];
  }

  const searchParams = new URLSearchParams({
    destination,
    points: uniquePoints.join('|')
  });

  try {
    const response = await fetch(`/api/places/attractions?${searchParams.toString()}`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}
