const mealIdeas = {
  budget: ['market lunch', 'local ramen stop', 'casual street-food dinner'],
  moderate: ['popular cafe lunch', 'sushi dinner', 'regional tasting menu'],
  luxury: ['hotel breakfast', 'chef-led lunch', 'fine dining reservation']
};

export function generateItinerary(pointsOfInterest, duration = pointsOfInterest.length, budgetLevel = 'moderate') {
  const cleanPoints = pointsOfInterest.map((point) => point.trim()).filter(Boolean);
  const days = Math.max(Number(duration) || cleanPoints.length || 1, 1);
  const meals = mealIdeas[budgetLevel] || mealIdeas.moderate;

  return Array.from({ length: days }, (_, index) => {
    const primary = cleanPoints[index % cleanPoints.length] || 'Explore the city center';
    const secondary = cleanPoints[(index + 1) % cleanPoints.length] || 'Visit a nearby landmark';

    return {
      day: index + 1,
      title: `Day ${index + 1}`,
      activities: [
        `Morning visit to ${primary}`,
        `Lunch: ${meals[index % meals.length]}`,
        `Afternoon walk near ${secondary}`,
        index === 0 ? 'Hotel check-in and neighborhood orientation' : 'Dinner and evening free time'
      ]
    };
  });
}
