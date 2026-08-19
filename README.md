# Lakbay — Phase 2

Smart Trip Cost Planner for Philippine road trips.

## Phase 2 features

- Functional trip cost calculator
- One-way and round-trip calculations
- Fuel usage and fuel cost estimation
- Toll, parking, and other expenses
- Passenger cost splitting
- Cost per kilometer
- Responsive live result summary
- Input validation
- Philippine Peso formatting
- Existing Phase 1 dashboard/pages preserved

## Calculation rules

- Total distance = one-way distance × 2 for round trips
- Fuel used = total distance ÷ km/L
- Fuel cost = fuel used × fuel price
- Round-trip toll = one-way toll × 2
- Total = fuel + toll + parking + other expenses
- Per person = total ÷ travelers

## Run locally

```bash
npm install
npm run dev
```

## Recommended branch

`feature/phase-2-trip-calculator`
