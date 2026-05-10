const mealIdeas = {
  budget: ['market lunch', 'local ramen stop', 'casual street-food dinner'],
  moderate: ['popular cafe lunch', 'sushi dinner', 'regional tasting menu'],
  luxury: ['hotel breakfast', 'chef-led lunch', 'fine dining reservation']
};

const imageCollections = {
  tokyo: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80'
  ],
  paris: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=900&q=80'
  ],
  london: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=900&q=80'
  ],
  miami: [
    'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=900&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80'
  ]
};

const nearbyIdeas = {
  budget: ['public market', 'neighborhood viewpoint', 'local transit stop'],
  moderate: ['museum district', 'popular shopping street', 'riverside walk'],
  luxury: ['rooftop lounge', 'design district', 'chef-led dining area']
};

function getDestinationKey(destination = '') {
  const normalized = destination.toLowerCase();

  if (normalized.includes('tokyo') || normalized.includes('japan')) return 'tokyo';
  if (normalized.includes('paris') || normalized.includes('france')) return 'paris';
  if (normalized.includes('london') || normalized.includes('england')) return 'london';
  if (normalized.includes('miami') || normalized.includes('florida')) return 'miami';

  return 'default';
}

export function generateItinerary(
  pointsOfInterest,
  duration = pointsOfInterest.length,
  budgetLevel = 'moderate',
  destination = '',
  attractionPhotos = []
) {
  const cleanPoints = pointsOfInterest.map((point) => point.trim()).filter(Boolean);
  const days = Math.max(Number(duration) || cleanPoints.length || 1, 1);
  const meals = mealIdeas[budgetLevel] || mealIdeas.moderate;
  const nearby = nearbyIdeas[budgetLevel] || nearbyIdeas.moderate;
  const images = imageCollections[getDestinationKey(destination)];
  const usedImages = new Set();

  function getImageForDay(primary, index) {
    const matchingPlace = attractionPhotos.find((place) => place.query === primary || place.name === primary);
    const googlePhoto = matchingPlace?.photos?.find((photo) => !usedImages.has(photo));
    const fallbackImage = images.find((image) => !usedImages.has(image)) || images[index % images.length];
    const imageUrl = googlePhoto || fallbackImage;

    usedImages.add(imageUrl);
    return {
      imageUrl,
      imageSource: googlePhoto ? 'Google Places photo' : 'Curated fallback photo'
    };
  }

  return Array.from({ length: days }, (_, index) => {
    const primary = cleanPoints[index % cleanPoints.length] || 'Explore the city center';
    const secondary = cleanPoints[(index + 1) % cleanPoints.length] || 'Visit a nearby landmark';
    const nearbyPlace = nearby[index % nearby.length];
    const image = getImageForDay(primary, index);

    return {
      day: index + 1,
      title: `Day ${index + 1}`,
      primaryPlace: primary,
      nearbyPlace,
      imageUrl: image.imageUrl,
      imageSource: image.imageSource,
      imageAlt: `${primary} travel preview`,
      activities: [
        `Morning visit to ${primary}`,
        `Lunch: ${meals[index % meals.length]}`,
        `Afternoon walk near ${secondary}`,
        `Nearby option: ${nearbyPlace}`,
        index === 0 ? 'Hotel check-in and neighborhood orientation' : 'Dinner and evening free time'
      ]
    };
  });
}
