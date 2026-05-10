const maxPhotoLookups = 10;

async function fetchPlacePhotos(placeName, destination) {
  if (!placeName || !destination) return [];
  
  try {
    const response = await fetch(`/api/places/attractions?destination=${encodeURIComponent(destination)}&points=${encodeURIComponent(placeName)}&duration=1&generatedAt=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!response.ok) return [];
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].photos || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchAttractionPhotos({ destination, pointsOfInterest = [], duration = 1 }) {
  if (typeof window === 'undefined') {
    return [];
  }

  const uniquePoints = [...new Set(pointsOfInterest.map((point) => point.trim()).filter(Boolean))].slice(0, maxPhotoLookups);
  if (!destination || uniquePoints.length === 0) {
    return [];
  }

  const searchParams = new URLSearchParams({
    destination,
    duration: String(duration * 2),
    points: uniquePoints.join('|'),
    generatedAt: String(Date.now())
  });

  try {
    const response = await fetch(`/api/places/attractions?${searchParams.toString()}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export { fetchPlacePhotos };
