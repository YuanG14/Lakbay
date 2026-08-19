import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  CarFront,
  CircleDollarSign,
  Fuel,
  MapPin,
  Navigation,
  ParkingCircle,
  ReceiptText,
  Route,
  UsersRound,
  Save,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useVehicles } from '../context/VehicleContext';
import { useTrips } from '../context/TripContext';

type TripType = 'round' | 'oneway';

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 });

export default function PlanTrip() {
  const [searchParams] = useSearchParams();
  const { addTrip, getTrip } = useTrips();
  const [origin, setOrigin] = useState('Batangas City');
  const [destination, setDestination] = useState('Alabang, Muntinlupa');
  const { vehicles, defaultVehicle } = useVehicles();
  const [vehicleId, setVehicleId] = useState(defaultVehicle?.id ?? 'custom');
  const [tripType, setTripType] = useState<TripType>('round');
  const [distance, setDistance] = useState(105);
  const selectedVehicle = vehicles.find((item) => item.id === vehicleId);
  const [efficiency, setEfficiency] = useState(defaultVehicle?.efficiency ?? 14);
  const [fuelPrice, setFuelPrice] = useState(78);
  const [toll, setToll] = useState(510);
  const [parking, setParking] = useState(100);
  const [other, setOther] = useState(0);
  const [passengers, setPassengers] = useState(4);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const selected = vehicles.find((item) => item.id === vehicleId);
    if (selected) setEfficiency(selected.efficiency);
  }, [vehicleId, vehicles]);

  useEffect(() => {
    const reuseId = searchParams.get('reuse');
    if (!reuseId) return;
    const trip = getTrip(reuseId);
    if (!trip) return;
    setOrigin(trip.origin);
    setDestination(trip.destination);
    setVehicleId(vehicles.some((vehicle) => vehicle.id === trip.vehicleId) ? trip.vehicleId : 'custom');
    setTripType(trip.tripType);
    setDistance(trip.oneWayDistance);
    setEfficiency(trip.efficiency);
    setFuelPrice(trip.fuelPrice);
    setToll(trip.tollOneWay);
    setParking(trip.parking);
    setOther(trip.other);
    setPassengers(trip.passengers);
    setSavedMessage('Previous trip loaded. Adjust anything and calculate again.');
  }, [searchParams, getTrip, vehicles]);

  const vehicleName = selectedVehicle?.name ?? 'Custom vehicle';

  const result = useMemo(() => {
    const multiplier = tripType === 'round' ? 2 : 1;
    const totalDistance = Math.max(0, distance) * multiplier;
    const fuelUsed = efficiency > 0 ? totalDistance / efficiency : 0;
    const fuelCost = fuelUsed * Math.max(0, fuelPrice);
    const tollCost = Math.max(0, toll) * multiplier;
    const parkingCost = Math.max(0, parking);
    const otherCost = Math.max(0, other);
    const total = fuelCost + tollCost + parkingCost + otherCost;
    const perPerson = passengers > 0 ? total / passengers : total;
    const costPerKm = totalDistance > 0 ? total / totalDistance : 0;

    return { totalDistance, fuelUsed, fuelCost, tollCost, parkingCost, otherCost, total, perPerson, costPerKm };
  }, [distance, efficiency, fuelPrice, toll, parking, other, passengers, tripType]);

  function calculate(e: FormEvent) {
    e.preventDefault();
    setSavedMessage('');
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both an origin and destination.');
      return;
    }
    if (distance <= 0 || efficiency <= 0 || fuelPrice < 0 || passengers <= 0) {
      setError('Distance, fuel efficiency, and passengers must be greater than zero.');
      return;
    }
    setError('');
    setHasCalculated(true);
  }

  function saveTrip() {
    if (!origin.trim() || !destination.trim() || result.totalDistance <= 0) {
      setError('Calculate a valid trip before saving it.');
      return;
    }
    addTrip({
      origin: origin.trim(), destination: destination.trim(), vehicleId, vehicleName, tripType,
      oneWayDistance: distance, totalDistance: result.totalDistance, efficiency, fuelPrice,
      fuelUsed: result.fuelUsed, fuelCost: result.fuelCost, tollOneWay: toll, tollCost: result.tollCost,
      parking: result.parkingCost, other: result.otherCost, passengers, total: result.total,
      perPerson: result.perPerson, costPerKm: result.costPerKm,
    });
    setError('');
    setSavedMessage('Trip saved to My Trips.');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Plan Trip"
        title="Build your trip estimate"
        subtitle="Estimate fuel, tolls, parking, and the amount each traveler should prepare."
      />

      {savedMessage && <div className="trip-save-notice"><CheckCircle2 size={17}/><span>{savedMessage}</span></div>}

      <section className="calculator-layout">
        <form className="panel form-panel calculator-form" onSubmit={calculate}>
          <div className="calculator-section">
            <div className="calculator-section-title">
              <span className="section-icon"><Route size={17} /></span>
              <div><strong>Route details</strong><span>Start with the trip basics.</span></div>
            </div>
            <div className="field-grid">
              <Field label="Origin" icon={<MapPin size={18} />}>
                <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Batangas City" />
              </Field>
              <Field label="Destination" icon={<Navigation size={18} />}>
                <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Alabang, Muntinlupa" />
              </Field>
              <Field label="Vehicle" icon={<CarFront size={18} />}>
                <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                  {vehicles.map((savedVehicle) => (
                    <option key={savedVehicle.id} value={savedVehicle.id}>
                      {savedVehicle.name}{savedVehicle.isDefault ? ' • Default' : ''}
                    </option>
                  ))}
                  <option value="custom">Custom vehicle</option>
                </select>
              </Field>
              <label>
                <span>Trip type</span>
                <div className="segmented">
                  <button type="button" className={tripType === 'round' ? 'selected' : ''} onClick={() => setTripType('round')}>Round trip</button>
                  <button type="button" className={tripType === 'oneway' ? 'selected' : ''} onClick={() => setTripType('oneway')}>One way</button>
                </div>
              </label>
            </div>
          </div>

          <div className="calculator-divider" />

          <div className="calculator-section">
            <div className="calculator-section-title">
              <span className="section-icon"><Fuel size={17} /></span>
              <div><strong>Fuel estimate</strong><span>Use your expected one-way distance and vehicle efficiency.</span></div>
            </div>
            <div className="field-grid three-fields">
              <NumberField label="One-way distance" value={distance} setValue={setDistance} suffix="km" min={0} />
              <NumberField label="Fuel efficiency" value={efficiency} setValue={setEfficiency} suffix="km/L" min={0} step="0.1" disabled={!!selectedVehicle} />
              <NumberField label="Fuel price" value={fuelPrice} setValue={setFuelPrice} prefix="₱" suffix="/L" min={0} step="0.01" />
            </div>
          </div>

          <div className="calculator-divider" />

          <div className="calculator-section">
            <div className="calculator-section-title">
              <span className="section-icon"><ReceiptText size={17} /></span>
              <div><strong>Other trip costs</strong><span>Toll is treated as one-way and doubled for a round trip.</span></div>
            </div>
            <div className="field-grid two-fields">
              <NumberField label="One-way toll" value={toll} setValue={setToll} prefix="₱" min={0} step="0.01" />
              <NumberField label="Parking" value={parking} setValue={setParking} prefix="₱" min={0} step="0.01" />
              <NumberField label="Other expenses" value={other} setValue={setOther} prefix="₱" min={0} step="0.01" />
              <NumberField label="Travelers" value={passengers} setValue={setPassengers} suffix="people" min={1} step="1" />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn wide calculate-btn" type="submit"><Calculator size={18} /> Calculate trip <ArrowRight size={18} /></button>
        </form>

        <aside className="result-column">
          <div className="trip-result-card">
            <div className="result-topline"><span>Estimated trip cost</span><span className="live-pill">LIVE</span></div>
            <div className="result-route"><strong>{origin || 'Origin'}</strong><ArrowRight size={15} /><strong>{destination || 'Destination'}</strong></div>
            <div className="result-meta">{number.format(result.totalDistance)} km • {tripType === 'round' ? 'Round trip' : 'One way'} • {vehicleName}</div>

            <div className="grand-total">{hasCalculated ? peso.format(result.total) : '₱0.00'}</div>
            <div className="per-person"><UsersRound size={17} /><span>{peso.format(result.perPerson)} per person</span></div>

            <div className="cost-breakdown">
              <CostRow icon={<Fuel />} label={`Fuel • ${number.format(result.fuelUsed)} L`} value={result.fuelCost} />
              <CostRow icon={<Route />} label="Tolls" value={result.tollCost} />
              <CostRow icon={<ParkingCircle />} label="Parking" value={result.parkingCost} />
              <CostRow icon={<CircleDollarSign />} label="Other" value={result.otherCost} />
            </div>

            <div className="result-footer-stats">
              <div><span>Total distance</span><strong>{number.format(result.totalDistance)} km</strong></div>
              <div><span>Cost per km</span><strong>{peso.format(result.costPerKm)}</strong></div>
            </div>
            <button className="result-save-btn" type="button" onClick={saveTrip}><Save size={17}/> Save this trip</button>
          </div>

          <div className="panel calculation-note">
            <div className="section-kicker">How Lakbay calculates</div>
            <p><strong>Fuel cost</strong> = total distance ÷ fuel efficiency × fuel price.</p>
            <p><strong>Total cost</strong> = fuel + tolls + parking + other expenses.</p>
            <p><strong>Per person</strong> = total trip cost ÷ number of travelers.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <label><span>{label}</span><div className="input-shell">{icon}{children}</div></label>;
}

function NumberField({ label, value, setValue, prefix, suffix, min, step = '1', disabled = false }: any) {
  return (
    <label>
      <span>{label}</span>
      <div className="number-input-shell">
        {prefix && <span className="input-affix">{prefix}</span>}
        <input type="number" min={min} step={step} value={value} disabled={disabled} onChange={(e) => setValue(Number(e.target.value))} />
        {suffix && <span className="input-affix suffix">{suffix}</span>}
      </div>
    </label>
  );
}

function CostRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="cost-row"><span className="cost-icon">{icon}</span><span>{label}</span><strong>{peso.format(value)}</strong></div>;
}
