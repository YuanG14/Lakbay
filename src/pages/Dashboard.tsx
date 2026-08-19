import { ArrowRight, CarFront, MapPin, ParkingCircle, Route, UsersRound, WalletCards } from 'lucide-react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useVehicles } from '../context/VehicleContext';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 1 });
const dateLabel = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });
const tripDate = new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit' });

export default function Dashboard() {
  const { user } = useAuth();
  const { trips, loading: tripsLoading, syncError: tripError } = useTrips();
  const { vehicles, defaultVehicle, loading: vehiclesLoading, syncError: vehicleError } = useVehicles();
  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Traveler';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthTrips = useMemo(() => trips.filter((trip) => trip.createdAt.slice(0, 7) === month), [trips, month]);
  const stats = useMemo(() => {
    const spending = monthTrips.reduce((sum, trip) => sum + (Number(trip.total) || 0), 0);
    const distance = monthTrips.reduce((sum, trip) => sum + (Number(trip.totalDistance) || 0), 0);
    const parking = monthTrips.reduce((sum, trip) => sum + (Number(trip.parking) || 0), 0);
    const shared = monthTrips.filter((trip) => trip.sharedTrip).length;
    return { spending, distance, parking, shared };
  }, [monthTrips]);

  const recent = trips.slice(0, 3);
  const busy = tripsLoading || vehiclesLoading;

  return (
    <div className="page-stack">
      <PageHeader eyebrow={dateLabel.format(now)} title={`${greeting}, ${name} 👋`} subtitle="Where are you going today? Let Lakbay estimate the cost before you drive." />

      {(tripError || vehicleError) && <div className="sync-alert" role="alert">{tripError || vehicleError}</div>}

      <section className="hero-grid">
        <div className="panel plan-card dashboard-plan-card">
          <div className="section-kicker">Quick start</div>
          <h2>Plan your next drive</h2>
          <p className="muted">Route distance, fuel, tolls, parking, shared costs and saved vehicles all come together in the full trip planner.</p>
          <div className="dashboard-ready-list">
            <div><span><CarFront size={17}/></span><p><strong>{vehicles.length ? `${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'} ready` : 'Add your first vehicle'}</strong><small>{defaultVehicle ? `${defaultVehicle.name} is your default` : 'Save a fuel-efficiency profile in My Garage'}</small></p></div>
            <div><span><Route size={17}/></span><p><strong>{trips.length ? `${trips.length} saved trip${trips.length === 1 ? '' : 's'}` : 'No trips saved yet'}</strong><small>Your trip history powers Analytics and Smart Insights</small></p></div>
          </div>
          <Link className="primary-btn" to="/plan-trip">Plan a trip <ArrowRight size={18} /></Link>
        </div>

        <div className="hero-summary">
          <div className="summary-badge"><Route size={17} /> This month</div>
          <h3>{busy ? 'Syncing your travel overview…' : monthTrips.length ? `${monthTrips.length} trip${monthTrips.length === 1 ? '' : 's'} logged this month.` : 'Your next trip starts here.'}</h3>
          <p>Use real saved-trip data to understand where your travel budget goes.</p>
          <div className="mini-stats">
            <div><span>Travel spending</span><strong>{peso.format(stats.spending)}</strong></div>
            <div><span>Distance</span><strong>{number.format(stats.distance)} km</strong></div>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <Stat icon={<WalletCards />} label="Travel spending" value={peso.format(stats.spending)} note="This month" />
        <Stat icon={<Route />} label="Distance traveled" value={`${number.format(stats.distance)} km`} note={`Across ${monthTrips.length} trip${monthTrips.length === 1 ? '' : 's'}`} />
        <Stat icon={<UsersRound />} label="Shared trips" value={String(stats.shared)} note="This month" />
        <Stat icon={<ParkingCircle />} label="Parking spend" value={peso.format(stats.parking)} note="This month" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading"><div><div className="section-kicker">History</div><h2>Recent trips</h2></div><Link to="/trips" className="text-link">View all <ArrowRight size={15} /></Link></div>
          {tripsLoading ? <div className="dashboard-empty">Loading saved trips…</div> : recent.length ? <div className="trip-list">{recent.map((trip) => <Trip key={trip.id} from={trip.origin} to={trip.destination} date={tripDate.format(new Date(trip.createdAt))} car={trip.vehicleName} cost={peso.format(trip.total)} />)}</div> : <div className="dashboard-empty"><Route size={22}/><strong>No saved trips yet</strong><span>Plan and save a trip to start building your travel history.</span><Link to="/plan-trip" className="secondary-btn">Plan your first trip</Link></div>}
        </div>

        <div className="panel insight-card">
          <div className="section-kicker">Lakbay insight</div>
          <h2>Your data gets smarter as you travel.</h2>
          <p>Analytics and explainable Smart Insights use your saved trips to find spending patterns, vehicle savings and sharing opportunities.</p>
          <div className="insight-meter"><div style={{ width: `${Math.min(100, trips.length * 20)}%` }} /></div>
          <div className="insight-row"><span>Insight readiness</span><strong>{trips.length >= 5 ? 'Ready' : `${Math.min(trips.length, 5)}/5 trips`}</strong></div>
          <Link to="/analytics" className="secondary-btn">See analytics</Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function Trip({ from, to, date, car, cost }: { from: string; to: string; date: string; car: string; cost: string }) {
  return <div className="trip-row"><div className="trip-route-icon"><MapPin size={18} /></div><div className="trip-main"><strong>{from} <ArrowRight size={14} /> {to}</strong><span>{date} • {car}</span></div><strong className="trip-cost">{cost}</strong></div>;
}
