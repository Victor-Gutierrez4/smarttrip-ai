import { useEffect, useMemo, useState } from 'react';
import SearchForm from './components/SearchForm';
import HotelCard from './components/HotelCard';
import RestaurantCard from './components/RestaurantCard';
import TripSummary from './components/TripSummary';
import Itinerary from './components/Itinerary';
import { calculateBudgetSummary } from './services/budgetCalculator';
import { calculateTripDuration, formatTripDates } from './services/dateRange';
import { fetchHotels, fetchRestaurants, hasGooglePlacesKey } from './services/googlePlaces';
import { generateItinerary } from './services/itineraryGenerator';

const defaultForm = {
  destination: 'Tokyo, Japan',
  pointsText: 'Shibuya Crossing, Tokyo Tower, Akihabara',
  startDate: '2026-06-08',
  endDate: '2026-06-12',
  budgetLevel: 'moderate'
};

function parsePoints(pointsText) {
  return pointsText
    .split(',')
    .map((point) => point.trim())
    .filter(Boolean);
}

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [trip, setTrip] = useState(() => buildTrip(defaultForm));
  const [loading, setLoading] = useState(false);

  function buildTrip(currentForm) {
    const pointsOfInterest = parsePoints(currentForm.pointsText);
    const duration = calculateTripDuration(currentForm.startDate, currentForm.endDate);

    return {
      destination: currentForm.destination,
      pointsOfInterest,
      dateRange: formatTripDates(currentForm.startDate, currentForm.endDate),
      duration,
      summary: calculateBudgetSummary({ ...currentForm, duration }),
      itinerary: generateItinerary(pointsOfInterest, duration, currentForm.budgetLevel),
      hotels: [],
      restaurants: []
    };
  }

  async function generateTrip(currentForm) {
    setLoading(true);

    const nextTrip = buildTrip(currentForm);
    const [hotels, restaurants] = await Promise.all([
      fetchHotels({ ...currentForm, pointsOfInterest: nextTrip.pointsOfInterest }),
      fetchRestaurants(currentForm)
    ]);

    setTrip({ ...nextTrip, hotels, restaurants });
    setLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await generateTrip(form);
  }

  useEffect(() => {
    generateTrip(defaultForm);
  }, []);

  const apiStatus = useMemo(
    () => (hasGooglePlacesKey() ? 'Google Places key detected' : 'Demo recommendations active'),
    []
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
            <p className="eyebrow">{apiStatus}</p>
            <h2>{trip.destination}</h2>
          </div>
          <span>{trip.dateRange} · {trip.duration} day trip · {trip.pointsOfInterest.length} points of interest</span>
        </div>

        <TripSummary summary={trip.summary} />

        <div className="row g-4 mt-1">
          <div className="col-lg-6">
            <div className="list-panel">
              <h2>Hotels</h2>
              {trip.hotels.length === 0 && <p className="empty-state">Loading hotel recommendations.</p>}
              {trip.hotels.map((hotel) => (
                <HotelCard hotel={hotel} key={hotel.id} />
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
                <RestaurantCard restaurant={restaurant} key={restaurant.id} />
              ))}
            </div>
          </div>
        </div>

        <div className="list-panel itinerary-panel">
          <h2>Suggested Itinerary</h2>
          <Itinerary days={trip.itinerary} />
        </div>

        {loading && <div className="loading-bar">Generating recommendations...</div>}
      </section>
    </main>
  );
}
