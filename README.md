# Lakbay — Phase 8

Smart Trip Cost Planner built with React, Vite, TypeScript, Firebase, Firestore, OpenStreetMap and Leaflet.

## Phase 8 additions

- Toll planner with multiple named toll/expressway segments
- Quick-add Philippine expressway labels (rates remain user-entered so stale prices are never assumed)
- Automatic round-trip toll multiplication
- Flexible additional trip expenses for food, accommodation, ferry and custom costs
- Parking and traveler counts remain first-class inputs
- Live budget breakdown and fuel-share insight
- Toll and expense line items are saved with each Firestore trip
- Reusing a saved trip restores its toll and expense breakdown
- Backward compatible with Phase 4–6 saved trips
- Existing Firebase Authentication, Firestore Garage, saved Trips and map routing preserved

## Run locally

```bash
npm install
npm run dev
```

## Firebase

Copy your existing Phase 6 `.env` into this project (or copy `.env.example` to `.env`) and add your Firebase Web App configuration. `.env` remains excluded from Git.

## Firestore structure

```text
users/{uid}/vehicles/{vehicleId}
users/{uid}/trips/{tripId}
```

Phase 8 saves optional `tollItems` and `expenseItems` arrays on new trip records while keeping the previous summary fields for backward compatibility.

## Toll-rate note

Phase 8 intentionally does not hard-code toll prices. Toll schedules can change, so Lakbay provides named toll segments and lets the user enter the current amount. A future production integration can replace this with a maintained toll-rate data source without changing the trip-calculation model.


## Phase 8 — Vehicle Comparison

Phase 8 compares every saved vehicle against the current trip. The ranking uses the current route distance, fuel price, tolls, parking, extra expenses, passenger count, and each vehicle's saved fuel efficiency. Users can switch vehicles directly from the comparison table and immediately see the calculator update.
