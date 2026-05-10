# SmartTrip AI

## Overview
Automated travel planner that generates hotel, food, transportation, and itinerary recommendations based on user-selected destinations and budget preferences.

## Features
- Destination and points-of-interest search
- Budget selection for Budget, Moderate, and Luxury trips
- Live Google Places hotel recommendations with demo fallback
- Live Google Places restaurant recommendations with demo fallback
- Transportation, food, hotel, and flight cost estimates
- Generated day-by-day itinerary

## Technologies
- React
- Vite
- Bootstrap
- Google Places API through Vercel serverless functions
- Vitest

## Running Locally
```bash
npm install
npm run dev
```

Create a `.env` file with:

```bash
GOOGLE_PLACES_API_KEY=YOUR_PRIVATE_GOOGLE_PLACES_KEY
```

The app calls Google Places through serverless API routes and falls back to destination-aware demo recommendations if the key is missing or the API limit is reached.

## API Usage Controls
- Server requests are limited to 3 hotels and 3 restaurants per search.
- Google field masks request only the fields used by the UI.
- Search responses are cached briefly to reduce repeated API calls.
- A lightweight hourly request limit protects the demo from accidental overuse.

## Running Tests
```bash
npm test
```

## Deployment
Hosted on Vercel.

## Resume / Portfolio Description
Developed an automated travel planning web application using React and API integrations that generates destination-based hotel, restaurant, and itinerary recommendations while dynamically estimating total travel costs based on user budget preferences.
