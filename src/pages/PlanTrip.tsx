import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Calculator, CarFront, CheckCircle2, CircleDollarSign, Clock3, Fuel,
  Hotel, LoaderCircle, LocateFixed, MapPin, Navigation, ParkingCircle, Plus, ReceiptText,
  Route, Save, Ship, Soup, Trash2, UsersRound, WalletCards, Trophy, TrendingDown, Sparkles, UserPlus, Crown,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import RouteMap, { LatLng } from '../components/RouteMap';
import FreePlaceInput from '../components/FreePlaceInput';
import { findDrivingRoute, geocodeFirst, routingConfigured } from '../lib/freeMaps';
import { useVehicles } from '../context/VehicleContext';
import { useTrips } from '../context/TripContext';
import { ExpenseCategory, SharedTripMember, TollItem, TripExpense } from '../types/trip';
import { readPreferences } from '../lib/preferences';

type TripType = 'round' | 'oneway';
type PlaceSelection = { label: string; coords: LatLng };

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 });
const tollPresets = ['STAR Tollway', 'SLEX', 'Skyway', 'CALAX', 'NLEX', 'TPLEX'];
const expensePresets: { label: string; category: ExpenseCategory }[] = [
  { label: 'Food', category: 'food' }, { label: 'Accommodation', category: 'accommodation' },
  { label: 'Ferry', category: 'ferry' }, { label: 'Other', category: 'other' },
];

const uid = () => crypto.randomUUID();

function formatDuration(seconds: number) {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  return `${hours} hr ${minutes ? `${minutes} min` : ''}`.trim();
}

export default function PlanTrip() {
  const [searchParams] = useSearchParams();
  const { addTrip, getTrip, syncError: tripSyncError, clearSyncError: clearTripSyncError } = useTrips();
  const { vehicles, defaultVehicle } = useVehicles();

  const [origin, setOrigin] = useState('Batangas City');
  const [destination, setDestination] = useState('Alabang, Muntinlupa');
  const [originSelection, setOriginSelection] = useState<PlaceSelection | null>(null);
  const [destinationSelection, setDestinationSelection] = useState<PlaceSelection | null>(null);
  const initialPreferences = useMemo(() => readPreferences(), []);
  const initializedDefaultVehicle = useRef(false);
  const [vehicleId, setVehicleId] = useState(initialPreferences.defaultVehicleId || defaultVehicle?.id || 'custom');
  const [tripType, setTripType] = useState<TripType>('round');
  const [distance, setDistance] = useState(105);
  const selectedVehicle = vehicles.find((item) => item.id === vehicleId);
  const [efficiency, setEfficiency] = useState(defaultVehicle?.efficiency ?? 14);
  const [fuelPrice, setFuelPrice] = useState(initialPreferences.fuelPrice);
  const [parking, setParking] = useState(100);
  const [passengers, setPassengers] = useState(4);
  const [sharedTrip, setSharedTrip] = useState(false);
  const [driverDiscount, setDriverDiscount] = useState(25);
  const [members, setMembers] = useState<SharedTripMember[]>(() => [
    { id: uid(), name: 'You', isDriver: true, contribution: 0 },
    { id: uid(), name: 'Traveler 2', isDriver: false, contribution: 0 },
    { id: uid(), name: 'Traveler 3', isDriver: false, contribution: 0 },
    { id: uid(), name: 'Traveler 4', isDriver: false, contribution: 0 },
  ]);
  const [tollItems, setTollItems] = useState<TollItem[]>([{ id: uid(), label: 'Expressway toll', oneWayAmount: 510 }]);
  const [expenseItems, setExpenseItems] = useState<TripExpense[]>([]);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [error, setError] = useState(''); const [savedMessage, setSavedMessage] = useState('');

  const [routeLoading, setRouteLoading] = useState(false); const [routeError, setRouteError] = useState('');
  const [routeOrigin, setRouteOrigin] = useState<LatLng | null>(null); const [routeDestination, setRouteDestination] = useState<LatLng | null>(null);
  const [routeLine, setRouteLine] = useState<LatLng[]>([]); const [routeDuration, setRouteDuration] = useState(0);
  const [routeResolved, setRouteResolved] = useState(false); const [manualDistance, setManualDistance] = useState(false);

  useEffect(() => { const selected = vehicles.find((item) => item.id === vehicleId); if (selected) setEfficiency(selected.efficiency); }, [vehicleId, vehicles]);

  useEffect(() => {
    if (initializedDefaultVehicle.current || !vehicles.length) return;
    initializedDefaultVehicle.current = true;
    const preferredId = initialPreferences.defaultVehicleId;
    const preferred = vehicles.find((vehicle) => vehicle.id === preferredId) ?? defaultVehicle;
    if (preferred) { setVehicleId(preferred.id); setEfficiency(preferred.efficiency); }
  }, [vehicles, defaultVehicle, initialPreferences.defaultVehicleId]);

  useEffect(() => {
    const reuseId = searchParams.get('reuse'); if (!reuseId) return;
    const trip = getTrip(reuseId); if (!trip) return;
    setOrigin(trip.origin); setDestination(trip.destination); setOriginSelection(null); setDestinationSelection(null);
    setVehicleId(vehicles.some((vehicle) => vehicle.id === trip.vehicleId) ? trip.vehicleId : 'custom');
    setTripType(trip.tripType); setDistance(trip.oneWayDistance); setEfficiency(trip.efficiency); setFuelPrice(trip.fuelPrice);
    setParking(trip.parking); setPassengers(trip.passengers);
    setSharedTrip(!!trip.sharedTrip); setDriverDiscount(trip.driverDiscount ?? 25);
    if (trip.members?.length) setMembers(trip.members);
    else setMembers(Array.from({ length: Math.max(1, trip.passengers) }, (_, index) => ({ id: uid(), name: index === 0 ? 'You' : `Traveler ${index + 1}`, isDriver: index === 0, contribution: 0 })));
    setTollItems(trip.tollItems?.length ? trip.tollItems : [{ id: uid(), label: 'Saved toll', oneWayAmount: trip.tollOneWay }]);
    setExpenseItems(trip.expenseItems?.length ? trip.expenseItems : trip.other > 0 ? [{ id: uid(), label: 'Other expenses', category: 'other', amount: trip.other }] : []);
    setManualDistance(true); setRouteResolved(false); setSavedMessage('Previous trip loaded. Find the route again or use its saved distance.');
  }, [searchParams, getTrip, vehicles]);

  const vehicleName = selectedVehicle?.name ?? 'Custom vehicle';
  const result = useMemo(() => {
    const multiplier = tripType === 'round' ? 2 : 1;
    const totalDistance = Math.max(0, distance) * multiplier;
    const fuelUsed = efficiency > 0 ? totalDistance / efficiency : 0;
    const fuelCost = fuelUsed * Math.max(0, fuelPrice);
    const tollOneWay = tollItems.reduce((sum, item) => sum + Math.max(0, item.oneWayAmount), 0);
    const tollCost = tollOneWay * multiplier;
    const parkingCost = Math.max(0, parking);
    const extraCost = expenseItems.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
    const total = fuelCost + tollCost + parkingCost + extraCost;
    const perPerson = passengers > 0 ? total / passengers : total;
    const costPerKm = totalDistance > 0 ? total / totalDistance : 0;
    const fuelShare = total > 0 ? (fuelCost / total) * 100 : 0;
    return { totalDistance, fuelUsed, fuelCost, tollOneWay, tollCost, parkingCost, extraCost, total, perPerson, costPerKm, fuelShare };
  }, [distance, efficiency, fuelPrice, tollItems, parking, expenseItems, passengers, tripType]);

  useEffect(() => {
    if (sharedTrip) setPassengers(Math.max(1, members.length));
  }, [sharedTrip, members.length]);

  const memberContributions = useMemo(() => {
    if (!sharedTrip || !members.length) return [] as SharedTripMember[];
    const discount = Math.min(100, Math.max(0, driverDiscount)) / 100;
    const weights = members.map((member) => member.isDriver ? Math.max(0, 1 - discount) : 1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    return members.map((member, index) => ({ ...member, contribution: result.total * weights[index] / totalWeight }));
  }, [sharedTrip, members, driverDiscount, result.total]);

  const vehicleComparisons = useMemo(() => {
    const fixedCosts = result.tollCost + result.parkingCost + result.extraCost;
    return vehicles
      .filter((vehicle) => vehicle.efficiency > 0)
      .map((vehicle) => {
        const fuelUsed = result.totalDistance / vehicle.efficiency;
        const fuelCost = fuelUsed * Math.max(0, fuelPrice);
        const total = fuelCost + fixedCosts;
        return { ...vehicle, fuelUsed, fuelCost, total, perPerson: passengers > 0 ? total / passengers : total };
      })
      .sort((a, b) => a.total - b.total);
  }, [vehicles, result.totalDistance, result.tollCost, result.parkingCost, result.extraCost, fuelPrice, passengers]);

  const bestComparison = vehicleComparisons[0];
  const selectedComparison = vehicleComparisons.find((vehicle) => vehicle.id === vehicleId);
  const selectedSavings = selectedComparison && bestComparison ? Math.max(0, selectedComparison.total - bestComparison.total) : 0;

  async function findRoute() {
    setSavedMessage(''); setRouteError(''); setError('');
    if (!routingConfigured) { setRouteError('Free routing is not configured yet. Add VITE_GRAPHHOPPER_API_KEY to your .env file.'); return; }
    if (!origin.trim() || !destination.trim()) { setRouteError('Enter an origin and destination first.'); return; }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) { setRouteError('Origin and destination must be different.'); return; }
    setRouteLoading(true);
    try {
      const resolvedOrigin = originSelection ?? await geocodeFirst(origin.trim());
      const resolvedDestination = destinationSelection ?? await geocodeFirst(destination.trim());
      const route = await findDrivingRoute(resolvedOrigin.coords, resolvedDestination.coords);
      if (!route.distanceKm) throw new Error('The routing service returned a route without a usable driving distance.');
      setOriginSelection(resolvedOrigin);
      setDestinationSelection(resolvedDestination);
      setOrigin(resolvedOrigin.label);
      setDestination(resolvedDestination.label);
      setRouteOrigin(resolvedOrigin.coords);
      setRouteDestination(resolvedDestination.coords);
      setRouteLine(route.line);
      setDistance(Number(route.distanceKm.toFixed(1)));
      setRouteDuration(route.durationSeconds);
      setRouteResolved(true); setManualDistance(false); setHasCalculated(true);
    } catch (routeFailure) {
      const message = routeFailure instanceof Error ? routeFailure.message : 'Unable to find that route right now.';
      setRouteError(message);
      setRouteResolved(false);
    } finally { setRouteLoading(false); }
  }

  function calculate(e: FormEvent) {
    e.preventDefault(); setSavedMessage('');
    if (!origin.trim() || !destination.trim()) { setError('Please enter both an origin and destination.'); return; }
    if (distance <= 0 || efficiency <= 0 || fuelPrice < 0 || passengers <= 0) { setError('Distance, fuel efficiency, and passengers must be greater than zero.'); return; }
    setError(''); setHasCalculated(true);
  }

  function saveTrip() {
    if (!origin.trim() || !destination.trim() || result.totalDistance <= 0) { setError('Calculate a valid trip before saving it.'); return; }
    addTrip({
      origin: origin.trim(), destination: destination.trim(), vehicleId, vehicleName, tripType,
      oneWayDistance: distance, totalDistance: result.totalDistance, efficiency, fuelPrice, fuelUsed: result.fuelUsed,
      fuelCost: result.fuelCost, tollOneWay: result.tollOneWay, tollCost: result.tollCost, parking: result.parkingCost,
      other: result.extraCost, passengers, total: result.total, perPerson: result.perPerson, costPerKm: result.costPerKm,
      sharedTrip, driverDiscount: sharedTrip ? driverDiscount : 0, members: sharedTrip ? memberContributions : [],
      tollItems, expenseItems,
    });
    setError(''); setSavedMessage('Trip saved to My Trips.');
  }

  function addToll(label = 'Toll segment') { setTollItems((items) => [...items, { id: uid(), label, oneWayAmount: 0 }]); }
  function updateToll(id: string, patch: Partial<TollItem>) { setTollItems((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  function removeToll(id: string) { setTollItems((items) => items.filter((item) => item.id !== id)); }
  function addExpense(label = 'Other expense', category: ExpenseCategory = 'other') { setExpenseItems((items) => [...items, { id: uid(), label, category, amount: 0 }]); }
  function updateExpense(id: string, patch: Partial<TripExpense>) { setExpenseItems((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  function removeExpense(id: string) { setExpenseItems((items) => items.filter((item) => item.id !== id)); }
  function addMember() { setMembers((items) => [...items, { id: uid(), name: `Traveler ${items.length + 1}`, isDriver: false, contribution: 0 }]); }
  function removeMember(id: string) {
    setMembers((items) => {
      if (items.length <= 1) return items;
      const next = items.filter((item) => item.id !== id);
      if (!next.some((item) => item.isDriver)) next[0] = { ...next[0], isDriver: true };
      return next;
    });
  }
  function updateMemberName(id: string, name: string) { setMembers((items) => items.map((item) => item.id === id ? { ...item, name } : item)); }
  function setDriver(id: string) { setMembers((items) => items.map((item) => ({ ...item, isDriver: item.id === id }))); }

  return <div className="page-stack">
    <PageHeader eyebrow="Plan Trip" title="Build your trip estimate" subtitle="Use free OpenStreetMap-based routing to find the driving route, organize toll segments, add real trip expenses, and see the true cost before you leave." />
    {tripSyncError && <div className="sync-alert" role="alert"><span>{tripSyncError}</span><button type="button" onClick={clearTripSyncError}>Dismiss</button></div>}
    {savedMessage && <div className="trip-save-notice"><CheckCircle2 size={17}/><span>{savedMessage}</span></div>}

    <section className="route-planner-panel panel">
      <div className="route-planner-fields">
        <div className="route-planner-heading"><span className="section-icon"><LocateFixed size={18}/></span><div><strong>Automatic route finder</strong><span>Search Philippine places and calculate the road distance using free OpenStreetMap-based services.</span></div></div>
        <div className="route-search-grid">
          <FreePlaceInput label="Origin" value={origin} placeholder="Batangas City" icon={<MapPin size={18}/>} onChange={(value) => { setOrigin(value); setRouteResolved(false); }} onPlaceSelected={setOriginSelection}/>
          <FreePlaceInput label="Destination" value={destination} placeholder="Alabang, Muntinlupa" icon={<Navigation size={18}/>} onChange={(value) => { setDestination(value); setRouteResolved(false); }} onPlaceSelected={setDestinationSelection}/>
          <button className="primary-btn route-find-btn" type="button" onClick={findRoute} disabled={routeLoading || !routingConfigured}>{routeLoading ? <LoaderCircle className="spin" size={18}/> : <Route size={18}/>} {routeLoading ? 'Finding route…' : 'Find route'}</button>
        </div>
        {routeError && <div className="route-inline-error">{routeError} <button type="button" onClick={() => setManualDistance(true)}>Enter distance manually</button></div>}
        {routeResolved && <div className="route-found-summary"><span><Route size={16}/><strong>{number.format(distance)} km</strong> one way</span><span><Clock3 size={16}/><strong>{formatDuration(routeDuration)}</strong> estimated drive</span><span className="route-source-pill">OpenStreetMap route</span></div>}
      </div>
      <div className="route-map-column"><RouteMap origin={routeOrigin} destination={routeDestination} route={routeLine}/>{!routeResolved && !routeLoading && <div className="map-empty-overlay"><Navigation size={24}/><strong>Your route will appear here</strong><span>Choose two places and click Find route.</span></div>}</div>
    </section>

    <section className="calculator-layout">
      <form className="panel form-panel calculator-form" onSubmit={calculate}>
        <div className="calculator-section">
          <div className="calculator-section-title"><span className="section-icon"><CarFront size={17}/></span><div><strong>Trip setup</strong><span>Choose a vehicle and whether you are returning to the origin.</span></div></div>
          <div className="field-grid"><Field label="Vehicle" icon={<CarFront size={18}/>}><select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}{v.isDefault ? ' • Default' : ''}</option>)}<option value="custom">Custom vehicle</option></select></Field>
            <label><span>Trip type</span><div className="segmented"><button type="button" className={tripType === 'round' ? 'selected' : ''} onClick={() => setTripType('round')}>Round trip</button><button type="button" className={tripType === 'oneway' ? 'selected' : ''} onClick={() => setTripType('oneway')}>One way</button></div></label>
          </div>
        </div>
        <div className="calculator-divider"/>
        <div className="calculator-section">
          <div className="calculator-section-title"><span className="section-icon"><Fuel size={17}/></span><div><strong>Fuel estimate</strong><span>Route distance is filled automatically after Find route.</span></div></div>
          <div className="field-grid three-fields">
            <label><span>One-way distance</span><div className="number-input-shell route-distance-field"><input type="number" min="0" step="0.1" value={distance} disabled={!manualDistance && routeResolved} onChange={(e) => setDistance(Number(e.target.value))}/><span className="input-affix suffix">km</span></div><button className="manual-distance-link" type="button" onClick={() => setManualDistance((c) => !c)}>{manualDistance ? 'Use automatic route instead' : 'Edit distance manually'}</button></label>
            <NumberField label="Fuel efficiency" value={efficiency} setValue={setEfficiency} suffix="km/L" min={0} step="0.1" disabled={!!selectedVehicle}/><NumberField label="Fuel price" value={fuelPrice} setValue={setFuelPrice} prefix="₱" suffix="/L" min={0} step="0.01"/>
          </div>
        </div>
        <div className="calculator-divider"/>

        <div className="calculator-section">
          <div className="calculator-section-title"><span className="section-icon"><Route size={17}/></span><div><strong>Toll planner</strong><span>Add each expressway or toll segment you expect to use. Enter the current one-way amount yourself.</span></div></div>
          <div className="quick-chip-row">{tollPresets.map((preset) => <button key={preset} type="button" className="expense-chip" onClick={() => addToll(preset)}><Plus size={13}/>{preset}</button>)}</div>
          <div className="dynamic-cost-list">{tollItems.map((item) => <div className="dynamic-cost-row" key={item.id}><div className="dynamic-cost-name"><Route size={16}/><input value={item.label} onChange={(e) => updateToll(item.id, { label: e.target.value })} aria-label="Toll name"/></div><div className="number-input-shell compact-money"><span className="input-affix">₱</span><input type="number" min="0" step="0.01" value={item.oneWayAmount} onChange={(e) => updateToll(item.id, { oneWayAmount: Number(e.target.value) })}/></div><button type="button" className="dynamic-remove" onClick={() => removeToll(item.id)} aria-label="Remove toll"><Trash2 size={15}/></button></div>)}</div>
          <button type="button" className="add-line-btn" onClick={() => addToll()}><Plus size={15}/> Add toll segment</button>
          <div className="cost-helper"><span>One-way toll subtotal</span><strong>{peso.format(result.tollOneWay)}</strong><small>{tripType === 'round' ? `Round-trip toll: ${peso.format(result.tollCost)}` : 'Used once for this trip'}</small></div>
        </div>
        <div className="calculator-divider"/>

        <div className="calculator-section">
          <div className="calculator-section-title"><span className="section-icon"><WalletCards size={17}/></span><div><strong>Trip expenses</strong><span>Parking is tracked separately; add food, stays, ferry costs, and anything else you want in the budget.</span></div></div>
          <div className="field-grid two-fields phase7-parking-row"><NumberField label="Parking" value={parking} setValue={setParking} prefix="₱" min={0} step="0.01"/><NumberField label="Travelers" value={passengers} setValue={setPassengers} suffix="people" min={1} step="1" disabled={sharedTrip}/></div>
          <div className="quick-chip-row">{expensePresets.map((preset) => <button key={preset.label} type="button" className="expense-chip" onClick={() => addExpense(preset.label, preset.category)}><Plus size={13}/>{preset.label}</button>)}</div>
          <div className="dynamic-cost-list">{expenseItems.map((item) => <div className="dynamic-cost-row expense-row" key={item.id}><div className="dynamic-cost-name">{expenseIcon(item.category)}<input value={item.label} onChange={(e) => updateExpense(item.id, { label: e.target.value })} aria-label="Expense label"/></div><select className="expense-category-select" value={item.category} onChange={(e) => updateExpense(item.id, { category: e.target.value as ExpenseCategory })}><option value="food">Food</option><option value="accommodation">Stay</option><option value="ferry">Ferry</option><option value="parking">Parking</option><option value="other">Other</option></select><div className="number-input-shell compact-money"><span className="input-affix">₱</span><input type="number" min="0" step="0.01" value={item.amount} onChange={(e) => updateExpense(item.id, { amount: Number(e.target.value) })}/></div><button type="button" className="dynamic-remove" onClick={() => removeExpense(item.id)} aria-label="Remove expense"><Trash2 size={15}/></button></div>)}</div>
          <button type="button" className="add-line-btn" onClick={() => addExpense()}><Plus size={15}/> Add custom expense</button>
        </div>
        <div className="calculator-divider"/>

        <div className="calculator-section shared-trip-section">
          <div className="calculator-section-title shared-trip-heading"><span className="section-icon"><UsersRound size={17}/></span><div><strong>Shared trip</strong><span>Split the final cost across your group and optionally reduce the driver's share for providing the vehicle.</span></div><button type="button" className={`shared-toggle ${sharedTrip ? 'active' : ''}`} onClick={() => setSharedTrip((value) => !value)}><span>{sharedTrip ? 'On' : 'Off'}</span><i/></button></div>
          {sharedTrip && <>
            <div className="driver-discount-box"><div><Crown size={17}/><span><strong>Driver discount</strong><small>Reduce the driver's contribution; the remainder is redistributed evenly.</small></span></div><div className="discount-options">{[0,25,50,100].map((discount) => <button type="button" key={discount} className={driverDiscount === discount ? 'active' : ''} onClick={() => setDriverDiscount(discount)}>{discount === 100 ? 'Driver free' : `${discount}%`}</button>)}</div></div>
            <div className="shared-members-list">{memberContributions.map((member, index) => <div className={`shared-member-row ${member.isDriver ? 'driver' : ''}`} key={member.id}><button type="button" className="driver-marker" onClick={() => setDriver(member.id)} title="Set as driver">{member.isDriver ? <Crown size={15}/> : <span>{index + 1}</span>}</button><input value={member.name} onChange={(e) => updateMemberName(member.id, e.target.value)} aria-label={`Traveler ${index + 1} name`}/><span className="member-role">{member.isDriver ? 'Driver' : 'Traveler'}</span><strong>{peso.format(member.contribution)}</strong><button type="button" className="dynamic-remove" onClick={() => removeMember(member.id)} disabled={members.length <= 1} aria-label="Remove traveler"><Trash2 size={14}/></button></div>)}</div>
            <button type="button" className="add-line-btn" onClick={addMember}><UserPlus size={15}/> Add traveler</button>
          </>}
        </div>

        {error && <div className="form-error">{error}</div>}
        <button className="primary-btn wide calculate-btn" type="submit"><Calculator size={18}/> Calculate trip <ArrowRight size={18}/></button>
      </form>

      <aside className="result-column">
        <div className="trip-result-card">
          <div className="result-topline"><span>Estimated trip cost</span><span className="live-pill">LIVE</span></div>
          <div className="result-route"><strong>{origin || 'Origin'}</strong><ArrowRight size={15}/><strong>{destination || 'Destination'}</strong></div>
          <div className="result-meta">{number.format(result.totalDistance)} km • {tripType === 'round' ? 'Round trip' : 'One way'} • {vehicleName}</div>
          <div className="grand-total">{hasCalculated ? peso.format(result.total) : '₱0.00'}</div><div className="per-person"><UsersRound size={17}/><span>{peso.format(result.perPerson)} per person</span></div>
          <div className="cost-breakdown"><CostRow icon={<Fuel/>} label={`Fuel • ${number.format(result.fuelUsed)} L`} value={result.fuelCost}/><CostRow icon={<Route/>} label={`Tolls • ${tollItems.length} segment${tollItems.length === 1 ? '' : 's'}`} value={result.tollCost}/><CostRow icon={<ParkingCircle/>} label="Parking" value={result.parkingCost}/><CostRow icon={<CircleDollarSign/>} label={`Extra expenses • ${expenseItems.length}`} value={result.extraCost}/></div>
          <div className="result-footer-stats"><div><span>Total distance</span><strong>{number.format(result.totalDistance)} km</strong></div><div><span>Cost per km</span><strong>{peso.format(result.costPerKm)}</strong></div></div>
          <button className="result-save-btn" type="button" onClick={saveTrip}><Save size={17}/> Save this trip</button>
        </div>
        {sharedTrip && <div className="panel shared-split-card"><div className="section-kicker">Shared trip split</div><div className="shared-split-title"><div><h3>Who pays what?</h3><p>{members.length} travelers • {driverDiscount}% driver discount</p></div><UsersRound size={22}/></div><div className="shared-split-list">{memberContributions.map((member) => <div key={member.id}><span>{member.name || 'Unnamed traveler'}{member.isDriver && <small>Driver</small>}</span><strong>{peso.format(member.contribution)}</strong></div>)}</div><div className="shared-split-total"><span>Group total</span><strong>{peso.format(result.total)}</strong></div></div>}
        <div className="panel vehicle-comparison-card">
          <div className="comparison-heading">
            <div>
              <div className="section-kicker">Vehicle comparison</div>
              <h3>Which car costs less for this trip?</h3>
              <p>Lakbay applies the same route and non-fuel expenses to every saved vehicle, then compares fuel use using each vehicle's efficiency.</p>
            </div>
            {bestComparison && <div className="best-vehicle-badge"><Trophy size={15}/><span>Best value</span><strong>{bestComparison.name}</strong></div>}
          </div>

          {vehicleComparisons.length < 2 ? (
            <div className="comparison-empty"><Sparkles size={20}/><div><strong>Add another vehicle to compare</strong><span>Save at least two vehicles in My Garage and Lakbay will rank them here automatically.</span></div></div>
          ) : (
            <>
              {selectedSavings > 0 && bestComparison && <div className="comparison-saving-callout"><TrendingDown size={18}/><div><strong>Switching to {bestComparison.name} saves about {peso.format(selectedSavings)}.</strong><span>That is {peso.format(selectedSavings / Math.max(1, passengers))} less per traveler for this plan.</span></div></div>}
              {selectedComparison?.id === bestComparison?.id && <div className="comparison-saving-callout best-current"><Trophy size={18}/><div><strong>You already selected the cheapest saved vehicle.</strong><span>{bestComparison.name} has the lowest estimated cost for this trip.</span></div></div>}

              <div className="comparison-table">
                <div className="comparison-table-head"><span>Vehicle</span><span>Efficiency</span><span>Fuel</span><span>Trip cost</span><span></span></div>
                {vehicleComparisons.map((vehicle, index) => {
                  const savingVsWorst = vehicleComparisons.length > 1 ? vehicleComparisons[vehicleComparisons.length - 1].total - vehicle.total : 0;
                  const isSelected = vehicle.id === vehicleId;
                  return <div className={`comparison-row ${index === 0 ? 'winner' : ''} ${isSelected ? 'selected-comparison' : ''}`} key={vehicle.id}>
                    <div className="comparison-vehicle"><span className="comparison-rank">#{index + 1}</span><div><strong>{vehicle.name}</strong><small>{vehicle.year} • {vehicle.fuelType}{isSelected ? ' • Selected' : ''}</small></div>{index === 0 && <span className="winner-pill"><Trophy size={11}/> Cheapest</span>}</div>
                    <div><strong>{number.format(vehicle.efficiency)} km/L</strong><small>{number.format(vehicle.fuelUsed)} L used</small></div>
                    <div><strong>{peso.format(vehicle.fuelCost)}</strong><small>fuel estimate</small></div>
                    <div><strong>{peso.format(vehicle.total)}</strong><small>{index === 0 ? `${peso.format(vehicle.perPerson)} / person` : savingVsWorst > 0 ? `Saves ${peso.format(savingVsWorst)}` : 'Highest estimate'}</small></div>
                    <button type="button" className={isSelected ? 'comparison-use-btn active' : 'comparison-use-btn'} onClick={() => setVehicleId(vehicle.id)} disabled={isSelected}>{isSelected ? 'Using' : 'Use vehicle'}</button>
                  </div>;
                })}
              </div>
            </>
          )}
        </div>

        <div className="panel trip-insight-card"><div className="section-kicker">Budget insight</div><strong>{result.fuelShare >= 50 ? 'Fuel is your biggest trip cost.' : result.tollCost > result.fuelCost ? 'Tolls cost more than fuel on this plan.' : 'Your costs are fairly distributed.'}</strong><p>Fuel currently makes up {number.format(result.fuelShare)}% of your estimated total. Adjust tolls or extra expenses above and Lakbay updates instantly.</p></div>
        <div className="panel calculation-note"><div className="section-kicker">How Lakbay calculates</div><p><strong>Fuel cost</strong> = total distance ÷ fuel efficiency × fuel price.</p><p><strong>Tolls</strong> = sum of one-way toll segments, doubled for a round trip.</p><p><strong>Extra expenses</strong> are one-time trip costs unless you enter them differently.</p><p><strong>Per person</strong> = total trip cost ÷ number of travelers.</p></div>
      </aside>
    </section>
  </div>;
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <label><span>{label}</span><div className="input-shell">{icon}{children}</div></label>; }
function NumberField({ label, value, setValue, prefix, suffix, min, step = '1', disabled = false }: any) { return <label><span>{label}</span><div className="number-input-shell">{prefix && <span className="input-affix">{prefix}</span>}<input type="number" min={min} step={step} value={value} disabled={disabled} onChange={(e) => setValue(Number(e.target.value))}/>{suffix && <span className="input-affix suffix">{suffix}</span>}</div></label>; }
function CostRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="cost-row"><span className="cost-icon">{icon}</span><span>{label}</span><strong>{peso.format(value)}</strong></div>; }
function expenseIcon(category: ExpenseCategory) { if (category === 'food') return <Soup size={16}/>; if (category === 'accommodation') return <Hotel size={16}/>; if (category === 'ferry') return <Ship size={16}/>; if (category === 'parking') return <ParkingCircle size={16}/>; return <ReceiptText size={16}/>; }
