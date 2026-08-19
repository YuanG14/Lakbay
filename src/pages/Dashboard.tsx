import { ArrowRight, CarFront, MapPin, Navigation, ParkingCircle, Route, UsersRound, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';

export default function Dashboard() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Wednesday, August 19" title="Good afternoon, Joshua 👋" subtitle="Where are you going today? Let Lakbay estimate the cost before you drive." />

      <section className="hero-grid">
        <div className="panel plan-card">
          <div className="section-kicker">Quick trip planner</div>
          <h2>Plan your next drive</h2>
          <p className="muted">Choose your route and vehicle. Detailed calculation comes in Phase 2.</p>
          <div className="route-form">
            <label>
              <span>From</span>
              <div className="input-shell"><MapPin size={18} /><input defaultValue="Batangas City" /></div>
            </label>
            <div className="route-line"><span /></div>
            <label>
              <span>To</span>
              <div className="input-shell"><Navigation size={18} /><input defaultValue="Alabang, Muntinlupa" /></div>
            </label>
            <label>
              <span>Vehicle</span>
              <div className="input-shell"><CarFront size={18} /><select defaultValue="vios"><option value="vios">Toyota Vios XLE</option><option>Honda City RS</option></select></div>
            </label>
          </div>
          <Link className="primary-btn" to="/plan-trip">Plan this trip <ArrowRight size={18} /></Link>
        </div>

        <div className="hero-summary">
          <div className="summary-badge"><Route size={17} /> Travel overview</div>
          <h3>Know the cost before the road.</h3>
          <p>Fuel, tolls, parking and passenger sharing — all in one place.</p>
          <div className="mini-stats">
            <div><span>This month</span><strong>₱6,480</strong></div>
            <div><span>Trips logged</span><strong>8</strong></div>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <Stat icon={<WalletCards />} label="Travel spending" value="₱6,480" note="This month" />
        <Stat icon={<Route />} label="Distance traveled" value="742 km" note="Across 8 trips" />
        <Stat icon={<UsersRound />} label="Shared savings" value="₱1,840" note="Estimated split costs" />
        <Stat icon={<ParkingCircle />} label="Parking spend" value="₱750" note="This month" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading"><div><div className="section-kicker">History</div><h2>Recent trips</h2></div><Link to="/trips" className="text-link">View all <ArrowRight size={15} /></Link></div>
          <div className="trip-list">
            <Trip from="Batangas City" to="Alabang" date="Aug 19" car="Toyota Vios XLE" cost="₱1,910" />
            <Trip from="Lipa City" to="Tagaytay" date="Aug 12" car="Toyota Vios XLE" cost="₱1,020" />
            <Trip from="Batangas City" to="Manila" date="Aug 03" car="Honda City RS" cost="₱2,140" />
          </div>
        </div>

        <div className="panel insight-card">
          <div className="section-kicker">Lakbay insight</div>
          <h2>Small choices, better trips.</h2>
          <p>Your recent trips show that sharing travel costs can noticeably reduce your personal spend.</p>
          <div className="insight-meter"><div style={{ width: '68%' }} /></div>
          <div className="insight-row"><span>Estimated savings from shared trips</span><strong>₱1,840</strong></div>
          <Link to="/analytics" className="secondary-btn">See analytics</Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, note }: any) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function Trip({ from, to, date, car, cost }: any) {
  return <div className="trip-row"><div className="trip-route-icon"><Route size={18} /></div><div className="trip-main"><strong>{from} <ArrowRight size={14} /> {to}</strong><span>{date} • {car}</span></div><strong className="trip-cost">{cost}</strong></div>;
}
