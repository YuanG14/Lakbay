# Lakbay — Smart Trip Planner

**Plan the drive. Know the cost before you leave.**

Lakbay is a full-stack, installable Progressive Web App (PWA) built for planning road trips in the Philippines. It combines real driving distance, vehicle fuel efficiency, fuel prices, tolls, parking, extra expenses, and passenger cost sharing into one trip estimate.

Instead of calculating fuel in one app, checking routes in another, and splitting expenses manually, Lakbay keeps the entire trip budget in one place.

---

## What Lakbay Solves

A route's distance alone does not tell you what a trip will actually cost. Two vehicles can travel the same road and still have different fuel expenses, while tolls, parking, food, and shared contributions can change the final budget significantly.

Lakbay helps users answer questions such as:

- How far is the actual driving route?
- How much fuel will my vehicle use?
- Which saved vehicle is cheaper for this trip?
- How much should I prepare for tolls and other expenses?
- How much should each traveler contribute?
- How much have I spent on trips this month?

---

## Core Features

### Route Planning

- Search Philippine locations for an origin and destination
- Calculate road distance and estimated driving time
- Display the route on an interactive map
- Automatically use the route distance in the fuel calculation
- Manual-distance fallback when automatic routing is unavailable
- One-way and round-trip planning

### My Garage

- Add and manage multiple vehicles
- Store each vehicle's fuel type, efficiency, tank capacity, and model year
- Choose a default vehicle
- Reuse saved vehicle data automatically in trip calculations
- Compare saved vehicles on the same route
- Identify the lowest estimated fuel-cost option

### Trip Cost Calculator

Lakbay calculates:

- Fuel consumption
- Fuel cost
- Toll expenses
- Parking
- Food, accommodation, ferry, and other custom expenses
- Total trip cost
- Cost per kilometer
- Cost per traveler

Toll prices are intentionally entered by the user instead of being permanently hard-coded, since toll rates may change.

### Shared Trips

- Add traveler names
- Select the driver
- Apply a driver discount
- Automatically redistribute the remaining trip cost
- See each traveler's contribution
- Save the full contribution breakdown with the trip

### Trip History

- Save trip estimates to Firestore
- View recent and previous trips
- Reuse saved trip details
- Delete trips
- Keep trip history private to each authenticated user

### Analytics

- Monthly travel spending
- Total distance traveled
- Estimated fuel consumed
- Average trip cost
- Previous-month spending comparison
- Six-month spending trend
- Expense category breakdown
- Vehicle usage ranking
- Most expensive trip of the selected month

### Lakbay Smart Insights

Lakbay includes an **explainable rule-based insight engine**. It does not require a paid AI API or hidden language model.

Insights can identify patterns such as:

- unusually expensive trips
- fuel-heavy trip budgets
- possible savings from a more efficient saved vehicle
- repeated routes
- passenger-sharing opportunities
- efficient cost-per-kilometer trips


### Installable App (PWA)

- Install Lakbay directly from a supported browser
- Opens in a standalone app-style window
- Lakbay app icon and splash-friendly theme colors
- Static app shell is cached for faster repeat launches
- Automatic PWA updates when a new deployment is available
- Android and iPhone Home Screen support

> Firebase syncing, live place search, road routing, and map tiles still require an internet connection.

### Accounts and Preferences

- Firebase Email/Password authentication
- Public landing page before authentication
- Sign-in and create-account flows
- Sign-out returns to the landing page
- User-specific Firestore data
- Default fuel price preference
- Default vehicle preference
- Network/offline feedback
- Friendly Firebase error messages

---

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Map Rendering | MapLibre GL JS |
| Map Tiles | OpenStreetMap |
| Place Search | GraphHopper Geocoding API |
| Road Routing | GraphHopper Routing API |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| Native wrapper | Capacitor (Android-ready) |
| Deployment | Vercel-ready SPA/PWA configuration |

This build does **not** use Google Maps.

---

## Application Routes

| Route | Purpose |
|---|---|
| `/` | Public Lakbay landing page |
| `/auth` | Sign in / Create account |
| `/dashboard` | User travel overview |
| `/plan-trip` | Route and trip-cost planner |
| `/trips` | Saved trip history |
| `/garage` | Saved vehicle management |
| `/analytics` | Spending analytics and Smart Insights |
| `/settings` | User trip-planning preferences |

Authenticated routes are protected and require a signed-in Firebase user.

---

## How the Trip Calculation Works

### Fuel used

```text
Fuel Used = Total Distance ÷ Vehicle Efficiency
```

### Fuel cost

```text
Fuel Cost = Fuel Used × Fuel Price
```

### Toll cost

```text
One-way toll = Sum of entered toll segments

Round-trip toll = One-way toll × 2
```

### Total trip cost

```text
Total = Fuel + Tolls + Parking + Extra Expenses
```

### Standard passenger split

```text
Cost Per Person = Total Trip Cost ÷ Number of Travelers
```

Shared Trip mode can additionally apply a driver discount and redistribute the discounted amount among the other travelers.

---

## Project Structure

```text
lakbay/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── TripContext.tsx
│   │   └── VehicleContext.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── freeMaps.ts
│   │   ├── insights.ts
│   │   └── preferences.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PlanTrip.tsx
│   │   ├── Trips.tsx
│   │   ├── Garage.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   ├── pwa-maskable-512x512.png
│   └── apple-touch-icon.png
├── capacitor.config.ts
├── firestore.rules
├── firebase.json
├── vercel.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

- Node.js
- npm
- A Firebase project
- A GraphHopper API key for hosted place search and routing

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd lakbay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GRAPHHOPPER_API_KEY=your_graphhopper_api_key
```

> Do not commit `.env` to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Vite will print the local URL in the terminal, usually similar to:

```text
http://localhost:5173
```

---

## Firebase Setup

### Authentication

In Firebase Console:

1. Open **Authentication**.
2. Open **Sign-in method**.
3. Enable **Email/Password**.

### Firestore

Create a Cloud Firestore database for the project.

Lakbay stores user data using this structure:

```text
users
└── {uid}
    ├── vehicles
    │   └── {vehicleId}
    └── trips
        └── {tripId}
```

The included `firestore.rules` restrict access so authenticated users can only read and write data under their own Firebase UID.

```text
request.auth.uid == userId
```

If you change Firestore rules in the repository, deploy or copy the updated rules to your Firebase project before production use.

---

## Free Map and Routing Setup

Lakbay's route planner uses:

```text
MapLibre GL JS
      ↓
OpenStreetMap tiles

GraphHopper Geocoding API
      ↓
Philippine place search

GraphHopper Routing API
      ↓
Driving distance + travel time + route geometry
```

Add your GraphHopper key to:

```env
VITE_GRAPHHOPPER_API_KEY=your_graphhopper_api_key
```

The app filters returned place-search results to Philippine locations before showing suggestions.

If routing is unavailable, users can switch to **manual distance entry** and continue using the trip-cost calculator.

> External map tiles, geocoding, and routing are subject to their respective providers' usage policies and service availability.

---

## Firestore Security Rules

The repository includes `firestore.rules`:

```text
users/{userId}/vehicles/{vehicleId}
users/{userId}/trips/{tripId}
```

Access requires:

```text
request.auth != null
request.auth.uid == userId
```

This prevents one Lakbay account from reading or modifying another user's vehicles and trips through normal Firestore requests.

---

## Available Scripts

```bash
npm run dev
```

Start the Vite development server.

```bash
npm run build
```

Create a production build.

```bash
npm run preview
```

Preview the production build locally.

```bash
npm run typecheck
```

Run TypeScript checking without generating files.

```bash
npm run check
```

Run both the TypeScript check and production build.

---

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the Firebase and GraphHopper environment variables in the Vercel project's **Environment Variables** settings.
4. Deploy.

The included `vercel.json` rewrites requests to `index.html`, allowing React Router pages such as `/dashboard`, `/plan-trip`, and `/analytics` to work correctly when refreshed directly.

---

## Data and Security Notes

- Firebase authentication controls access to private app pages.
- Firestore records are separated by Firebase UID.
- `.env` should remain excluded from Git.
- The frontend Firebase configuration is not a substitute for Firestore security rules.
- Toll amounts are user-entered rather than assumed to be live official rates.
- Lakbay's Smart Insights are deterministic rules based on saved trip data, not generated AI responses.

---

## Current Limitations

Lakbay is designed as a portfolio-ready trip-planning application, but a production-scale version could further improve:

- live verified toll-rate integration
- live fuel-price data
- dedicated production map/geocoding infrastructure for high traffic
- route alternatives and traffic-aware routing
- push notifications
- collaborative trip invitations
- receipt/image attachments
- PWA or native-mobile support

---

## Project Status

**Core development is complete.**

Lakbay currently includes the full workflow from public landing page → account creation → route planning → vehicle selection → cost calculation → shared-trip splitting → Firestore history → analytics and explainable insights.

---

## Built With a Practical Goal

Lakbay is not just a distance calculator. Its goal is to make road-trip budgeting easier by answering a simple question before the user leaves:

> **How much will this drive actually cost?**

---

## Install Lakbay as an App

### PWA — free and recommended

Deploy Lakbay to HTTPS (for example Vercel), then open the deployed site on your phone. On supported Chromium browsers, Lakbay will expose an **Install Lakbay** button when the browser reports that the app is installable. On iPhone/iPad, use Safari's **Add to Home Screen** action.

The installed PWA uses the same Firebase account and Firestore data as the website.

### Android APK with Capacitor

Capacitor is already configured through `capacitor.config.ts`. After installing dependencies:

```bash
npm install
npm run build
npm run cap:add:android   # first time only
npm run android:open
```

`android:open` builds the web app, syncs it into the Android project, and opens Android Studio. From Android Studio you can build an APK for direct installation without publishing to Google Play.

If the `android/` folder already exists, skip `npm run cap:add:android`.

### PWA test build

```bash
npm run build
npm run pwa:preview
```

Open the preview URL in a browser and verify that the manifest/service worker are active.
