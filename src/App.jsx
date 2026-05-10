import { useEffect, useMemo, useState } from 'react';
import SearchForm from './components/SearchForm';
import HotelCard from './components/HotelCard';
import RestaurantCard from './components/RestaurantCard';
import TripSummary from './components/TripSummary';
import Itinerary from './components/Itinerary';
import { fetchAttractionPhotos } from './services/attractionPhotos';
import { calculateBudgetSummary, getBudgetLevelFromTripBudget } from './services/budgetCalculator';
import { calculateTripDuration, formatTripDates } from './services/dateRange';
import { fetchHotels, fetchRestaurants, getRecommendationSourceLabel } from './services/googlePlaces';
import { generateItinerary } from './services/itineraryGenerator';

const defaultForm = {
  destination: 'Tokyo, Japan',
  startLocation: 'Los Angeles, CA',
  pointsText: 'Shibuya Crossing, Tokyo Tower, Akihabara',
  startDate: '2026-06-08',
  endDate: '2026-06-12',
  maxBudget: 1850,
  roundTrip: true,
  travelers: 2
};

function parsePoints(pointsText) {
  return pointsText
    .split(',')
    .map((point) => point.trim())
    .filter(Boolean);
}

function App() {
  const [form, setForm] = useState(defaultForm);
  const [trip, setTrip] = useState(() => buildTrip(defaultForm));
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [activeMapPlace, setActiveMapPlace] = useState(null);
  const [loading, setLoading] = useState(false);

  function buildTrip(currentForm) {
    const pointsOfInterest = parsePoints(currentForm.pointsText);
    const duration = calculateTripDuration(currentForm.startDate, currentForm.endDate);
    const budgetLevel = getBudgetLevelFromTripBudget(currentForm.maxBudget, duration, currentForm.travelers);

    return {
      destination: currentForm.destination,
      startLocation: currentForm.startLocation,
      pointsOfInterest,
      dateRange: formatTripDates(currentForm.startDate, currentForm.endDate),
      duration,
      budgetLevel,
      maxBudget: Number(currentForm.maxBudget),
      roundTrip: Boolean(currentForm.roundTrip),
      travelers: Number(currentForm.travelers),
      summary: calculateBudgetSummary({
        ...currentForm,
        duration,
        budgetLevel,
        destination: currentForm.destination
      }),
      itinerary: generateItinerary(pointsOfInterest, duration, budgetLevel, currentForm.destination),
      itineraryPlaces: [],
      hotels: [],
      restaurants: []
    };
  }

  async function generateTrip(currentForm) {
    setLoading(true);

    const nextTrip = buildTrip(currentForm);
    const itineraryPlaces = await fetchAttractionPhotos({
      destination: currentForm.destination,
      pointsOfInterest: nextTrip.pointsOfInterest,
      duration: nextTrip.duration
    });
    
    const nearbyPlaces = await fetchAttractionPhotos({
      destination: currentForm.destination,
      pointsOfInterest: [
        'museum',
        'market',
        'park',
        'shopping street',
        'restaurant'
      ],
      duration: nextTrip.duration
    });

    const [hotels, restaurants] = await Promise.all([
      fetchHotels({
        ...currentForm,
        pointsOfInterest: nextTrip.pointsOfInterest,
        budgetLevel: nextTrip.budgetLevel,
        travelers: currentForm.travelers
      }),
      fetchRestaurants({
        ...currentForm,
        pointsOfInterest: nextTrip.pointsOfInterest,
        budgetLevel: nextTrip.budgetLevel,
        travelers: currentForm.travelers
      })
    ]);

    setTrip({
      ...nextTrip,
      hotels,
      restaurants,
      itineraryPlaces: [...itineraryPlaces, ...nearbyPlaces]
    });
    setSelectedHotelId(hotels[0]?.id || '');
    setLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await generateTrip(form);
  }

  function openMapPlace(place) {
    if (!place) return;
    const query = place.query || place.name || place.primaryPlace || place.title || '';
    const embeddedQuery = encodeURIComponent(query || place.address || trip.destination);

    setActiveMapPlace({
      title: place.name || place.primaryPlace || place.title || 'Map preview',
      placeUrl: place.placeUrl || `https://www.google.com/maps/search/?api=1&query=${embeddedQuery}`,
      embedUrl: `https://www.google.com/maps?q=${embeddedQuery}&output=embed`
    });
  }

  function closeMapPlace() {
    setActiveMapPlace(null);
  }

  useEffect(() => {
    generateTrip(defaultForm);
  }, []);

  const selectedHotel = useMemo(
    () => trip.hotels.find((hotel) => hotel.id === selectedHotelId) || trip.hotels[0],
    [selectedHotelId, trip.hotels]
  );
  const displayedSummary = useMemo(
    () =>
      calculateBudgetSummary({
        budgetLevel: trip.budgetLevel,
        duration: trip.duration,
        hotelNightly: selectedHotel?.estimatedPrice,
        maxBudget: trip.maxBudget,
        travelers: trip.travelers,
        roundTrip: trip.roundTrip,
        startLocation: trip.startLocation,
        destination: trip.destination
      }),
    [selectedHotel, trip.budgetLevel, trip.duration, trip.maxBudget, trip.travelers, trip.roundTrip, trip.startLocation, trip.destination]
  );
  const displayedItinerary = useMemo(
    () =>
      generateItinerary(
        trip.pointsOfInterest,
        trip.duration,
        trip.budgetLevel,
        trip.destination,
        trip.itineraryPlaces,
        selectedHotel
      ),
    [selectedHotel, trip.budgetLevel, trip.destination, trip.duration, trip.itineraryPlaces, trip.pointsOfInterest]
  );
  const recommendationSource = useMemo(
    () => getRecommendationSourceLabel(trip.hotels, trip.restaurants),
    [trip.hotels, trip.restaurants]
  );

  return (
    <main>
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">SmartTrip AI</p>
              <h1>Automated travel plans with budgets, stays, meals, and daily routes.</h1>
              <p className="hero-copy">
                Enter a destination, a few attractions, and your travel style to generate a polished trip plan in seconds.
              </p>
            </div>
            <SearchForm form={form} onChange={setForm} onSubmit={handleSubmit} />
          </div>
        </div>
      </section>

      <section className="container results-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{recommendationSource}</p>
            <h2>{trip.destination}</h2>
          </div>
          <span>{trip.dateRange} | {trip.duration} day trip | {trip.pointsOfInterest.length} points of interest</span>
        </div>

        <TripSummary summary={displayedSummary} selectedHotel={selectedHotel} />

        <div className="row g-4 mt-1">
          <div className="col-lg-6">
            <div className="list-panel">
              <h2>Hotels</h2>
              {trip.hotels.length === 0 && <p className="empty-state">Loading hotel recommendations.</p>}
              {trip.hotels.map((hotel) => (
                <HotelCard
                  hotel={hotel}
                  isSelected={hotel.id === selectedHotel?.id}
                  key={hotel.id}
                  onSelect={() => setSelectedHotelId(hotel.id)}
                  onViewMap={() => openMapPlace(hotel)}
                />
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="list-panel">
              <h2>Restaurants</h2>
              {trip.restaurants.length === 0 && (
                <p className="empty-state">Generate a plan to load restaurant recommendations.</p>
              )}
              {trip.restaurants.map((restaurant) => (
                <RestaurantCard
                  restaurant={restaurant}
                  key={restaurant.id}
                  onViewMap={() => openMapPlace(restaurant)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="list-panel itinerary-panel">
          <h2>Suggested Itinerary</h2>
          <Itinerary days={displayedItinerary} summary={displayedSummary} onSelectPlace={openMapPlace} />
        </div>

        {activeMapPlace && (
          <div className="map-modal">
            <div className="map-modal-content">
              <button className="modal-close" type="button" onClick={closeMapPlace}>
                Close
              </button>
              <h3>{activeMapPlace.title}</h3>
              <div className="map-frame">
                <iframe
                  title="Place map preview"
                  src={activeMapPlace.embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <a href={activeMapPlace.placeUrl} target="_blank" rel="noreferrer" className="map-link">
                Open full map in Google Maps
              </a>
            </div>
          </div>
        )}

        {loading && <div className="loading-bar">Generating recommendations...</div>}
      </section>
    </main>
  );
}

export default App;
