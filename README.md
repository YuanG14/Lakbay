# Lakbay — Smart Trip Cost Planner

## Phase 3: My Garage

Phase 3 adds persistent vehicle profiles on top of the Phase 2 trip calculator.

### Included
- Add vehicle profiles
- Edit saved vehicles
- Delete vehicles
- Set a default vehicle
- LocalStorage persistence (before Firebase is introduced)
- Garage summary cards
- Saved vehicles automatically appear in Plan Trip
- Selecting a saved vehicle automatically applies its fuel efficiency
- Custom vehicle option still allows manual fuel-efficiency entry
- Responsive desktop/mobile UI
- PHP currency formatting from earlier phases

### Run locally
```bash
npm install
npm run dev
```

### Git branch
```bash
git checkout -b feature/phase-3-my-garage
```

> Phase 5 will migrate persistence from localStorage to Firebase/Firestore.
