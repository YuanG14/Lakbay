# Lakbay — Phase 6

Smart Trip Cost Planner built with React, Vite, TypeScript, Firebase, Firestore, OpenStreetMap and Leaflet.

## Phase 6 additions

- Interactive road map on Plan Trip
- Philippine place search for origin and destination
- Automatic driving-route lookup
- Automatic one-way road distance
- Estimated driving duration
- Map markers and route polyline
- Manual distance fallback
- Existing Firebase Authentication, Firestore Garage, saved Trips and calculator preserved

## Run locally

```bash
npm install
npm run dev
```

## Firebase

Copy `.env.example` to `.env` and add your Firebase Web App configuration. Keep `.env` out of Git.

## Firestore structure

```text
users/{uid}/vehicles/{vehicleId}
users/{uid}/trips/{tripId}
```

Use Firestore Security Rules that only allow an authenticated user to access data under their own UID.

## Map and routing note

Phase 6 uses public OpenStreetMap-compatible services for development/demo routing and geocoding, so no extra API key is required. A manual distance input remains available if public routing is unavailable. For a production app with significant traffic, move to a dedicated hosted geocoding/routing provider or your own service.
