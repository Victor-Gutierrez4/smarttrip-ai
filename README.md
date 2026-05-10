# SmartTrip AI

## Overview
Automated travel planner that generates hotel, food, transportation, and itinerary recommendations based on user-selected destinations and budget preferences.

## Features
- Destination and points-of-interest search
- Budget selection for Budget, Moderate, and Luxury trips
- Automated hotel recommendations
- Automated restaurant recommendations
- Transportation, food, hotel, and flight cost estimates
- Generated day-by-day itinerary

## Technologies
- React
- Vite
- Bootstrap
- Google Places API-ready service layer
- Vitest

## Running Locally
```bash
npm install
npm run dev
```

Create a `.env` file with:

```bash
VITE_GOOGLE_API_KEY=YOUR_API_KEY
```

The app includes simulated recommendations, so it works for portfolio demos even without an API key.

## Running Tests
```bash
npm test
```

## Deployment
Hosted on Vercel.

## Resume / Portfolio Description
Developed an automated travel planning web application using React and API integrations that generates destination-based hotel, restaurant, and itinerary recommendations while dynamically estimating total travel costs based on user budget preferences.
