import { ArrowRight, CarFront, ParkingCircle, Route, Sparkles, UsersRound, WalletCards } from 'lucide-react';
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

function shortPlace(value: string) {
  const parts = value.split(',').map((part) => part.trim()).filter(Boolean).filter((part) => part.toLowerCase() !== 'philippines');
  return parts.slice(0, 2).join(', ') || value;
}

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
  const insight = trips.length >= 5
    ? { title: 'Your trip history is ready for deeper comparisons.', text: 'Lakbay can now compare recurring costs, vehicle efficiency, and sharing patterns from the trips you actually saved.', status: 'Pattern-ready' }
    : trips.length
      ? { title: `${5 - trips.length} more saved trip${5 - trips.length === 1 ? '' : 's'} to build stronger patterns.`, text: 'Each saved drive gives Lakbay more real cost data for vehicle savings, route spending, and shared-trip recommendations.', status: `${trips.length}/5 trips` }
      : { title: 'Save a trip to start building useful patterns.', text: 'Analytics uses your own route, vehicle, and expense history — not generic travel estimates.', status: '0/5 trips' };
  const busy = tripsLoading || vehiclesLoading;

  return (
    <div className="page-stack">
      <PageHeader eyebrow={dateLabel.format(now)} title={`${greeting}, ${name}`} subtitle="Where are you going today? Let Lakbay estimate the cost before you drive." />

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
          <p>Fuel, distance, and saved-trip totals from the drives you logged this month.</p>
          <div className="mini-stats">
            <div><span>Travel spending</span><strong>{peso.format(stats.spending)}</strong></div>
            <div><span>Distance</span><strong>{number.format(stats.distance)} km</strong></div>
          </div>
        </div>
      </section>

      <section className="stat-grid dashboard-stat-grid">
        <Stat tone="spend" icon={<WalletCards />} label="Travel spending" value={peso.format(stats.spending)} note="Logged this month" />
        <Stat tone="distance" icon={<Route />} label="Distance traveled" value={`${number.format(stats.distance)} km`} note={`Across ${monthTrips.length} saved trip${monthTrips.length === 1 ? '' : 's'}`} />
        <Stat tone="shared" icon={<UsersRound />} label="Shared trips" value={String(stats.shared)} note={stats.shared ? 'Costs split with travelers' : 'No shared splits yet'} />
        <Stat tone="parking" icon={<ParkingCircle />} label="Parking spend" value={peso.format(stats.parking)} note={stats.parking ? 'Included in trip totals' : 'No parking logged'} />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading"><div><div className="section-kicker">History</div><h2>Recent trips</h2></div><Link to="/trips" className="text-link">View all <ArrowRight size={15} /></Link></div>
          {tripsLoading ? <div className="dashboard-empty">Loading saved trips…</div> : recent.length ? <div className="trip-list">{recent.map((trip) => <Trip key={trip.id} from={trip.origin} to={trip.destination} date={tripDate.format(new Date(trip.createdAt))} car={trip.vehicleName} cost={peso.format(trip.total)} />)}</div> : <div className="dashboard-empty"><Route size={22}/><strong>No saved trips yet</strong><span>Plan and save a trip to start building your travel history.</span><Link to="/plan-trip" className="secondary-btn">Plan your first trip</Link></div>}
        </div>

        <div className="panel insight-card dashboard-insight-card">
          <div className="dashboard-insight-mark"><Sparkles size={19} /></div>
          <div className="section-kicker">From your saved trips</div>
          <h2>{insight.title}</h2>
          <p>{insight.text}</p>
          <div className="dashboard-insight-progress">
            <div className="insight-meter"><div style={{ width: `${Math.min(100, trips.length * 20)}%` }} /></div>
            <div className="insight-row"><span>History depth</span><strong>{insight.status}</strong></div>
          </div>
          <Link to="/analytics" className="dashboard-insight-link">Open analytics <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, note, tone }: { icon: ReactNode; label: string; value: string; note: string; tone: 'spend' | 'distance' | 'shared' | 'parking' }) {
  return <div className={`stat-card dashboard-stat-card ${tone}`}><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function Trip({ from, to, date, car, cost }: { from: string; to: string; date: string; car: string; cost: string }) {
  const origin = shortPlace(from);
  const destination = shortPlace(to);
  return (
    <div className="trip-row dashboard-trip-row">
      <div className="dashboard-route-track" aria-hidden="true"><span className="start"/><i/><span className="end"/></div>
      <div className="trip-main">
        <div className="dashboard-trip-route"><strong>{origin}</strong><ArrowRight size={14}/><strong>{destination}</strong></div>
        <div className="dashboard-trip-meta"><span>{date}</span><span className="dashboard-trip-car"><CarFront size={13}/>{car}</span></div>
      </div>
      <div className="dashboard-trip-price"><small>Trip total</small><strong>{cost}</strong></div>
    </div>
  );
}
