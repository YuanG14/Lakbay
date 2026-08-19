# Lakbay — Smart Trip Cost Planner

Lakbay is a portfolio-ready React web application for Philippine road-trip budgeting. It combines route distance, vehicle fuel efficiency, fuel prices, tolls, parking, additional expenses and passenger splitting into one travel-cost workflow.

## Final feature set

- Firebase Email/Password authentication
- Firestore-backed user-specific vehicles and trips
- My Garage with default vehicles and fuel-efficiency profiles
- OpenStreetMap/Leaflet map visualization
- Automatic Philippine place lookup and road-routing distance
- Manual-distance fallback when public routing is unavailable
- Fuel, toll, parking and flexible expense calculations
- Multiple named toll segments with user-entered current prices
- Saved trip history with search, details, reuse and delete
- Saved-vehicle cost comparison and cheapest-vehicle ranking
- Firestore-powered monthly analytics and spending breakdowns
- Explainable rule-based Smart Insights with no paid AI API
- Shared trips with participant names and driver discounts
- Persistent default fuel price and vehicle preferences
- Offline/network status feedback
- Firestore sync error handling with optimistic rollback
- Loading skeletons, empty states and fatal UI error boundary
- Accessibility focus states, skip link and reduced-motion support
- Responsive desktop/mobile navigation
- Vercel SPA deployment configuration
- Firestore security rules included in the repository

## Tech stack

- React + TypeScript
- Vite
- React Router
- Firebase Authentication
- Cloud Firestore
- Leaflet + React Leaflet
- OpenStreetMap / Nominatim place search
- OSRM public routing service
- Lucide React icons

## Run locally

1. Extract the project.
2. Copy `.env.example` to `.env`.
3. Paste your Firebase Web App configuration into `.env`.
4. Install dependencies and start Vite:

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run check
```

This runs TypeScript checking and the Vite production build.

## Firebase setup

Enable **Email/Password** under Firebase Authentication and create a Cloud Firestore database.

Environment variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env` is intentionally ignored by Git. Commit `.env.example`, never your local `.env`.

### Firestore structure

```text
users/{uid}/vehicles/{vehicleId}
users/{uid}/trips/{tripId}
```

### Firestore rules

`firestore.rules` restricts vehicle and trip data to the authenticated owner. You can paste those rules into **Firebase Console → Firestore Database → Rules**, or deploy them with the Firebase CLI after configuring your Firebase project.

## Mapping and routing note

Lakbay currently uses public OpenStreetMap/Nominatim/OSRM services so the portfolio project can run without a paid map key. Public services can have availability and usage limits, so Lakbay keeps a manual-distance fallback. For a high-traffic commercial deployment, replace these public endpoints with a production routing/geocoding provider.

## Toll-rate note

Lakbay intentionally does not hard-code Philippine toll prices because rates can change. Users add the relevant toll segments and enter the current amount. A future live toll-data integration can replace the manual values without changing the trip-cost model.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add all `VITE_FIREBASE_*` variables in **Project Settings → Environment Variables**.
4. Deploy.

`vercel.json` includes the SPA rewrite needed for React Router routes such as `/plan-trip`, `/garage` and `/analytics`.

## Git hygiene

The repository includes `.gitignore` rules for dependencies, builds, local environment values, logs and common editor/OS files. Do not commit `node_modules`, `dist` or `.env`.

## Final phase

Phase 12 is the final core implementation and production-polish pass. Future work can be treated as optional product expansion rather than required project completion.
