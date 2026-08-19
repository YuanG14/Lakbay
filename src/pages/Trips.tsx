import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CarFront, Copy, Eye, Fuel, MapPin, Plus, Search, Trash2, UsersRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useTrips } from '../context/TripContext';
import { SavedTrip } from '../types/trip';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 });

export default function Trips() {
  const { trips, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);

  const filteredTrips = useMemo(() => {
    const query = search.toLowerCase().trim();
    const now = new Date();
    return trips.filter((trip) => {
      const created = new Date(trip.createdAt);
      const matchesQuery = !query || `${trip.origin} ${trip.destination} ${trip.vehicleName}`.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || (filter === 'month' && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear());
      return matchesQuery && matchesFilter;
    });
  }, [trips, search, filter]);

  const totalSpent = trips.reduce((sum, trip) => sum + trip.total, 0);
  const totalDistance = trips.reduce((sum, trip) => sum + trip.totalDistance, 0);

  function removeTrip(trip: SavedTrip) {
    if (window.confirm(`Delete ${trip.origin} → ${trip.destination}?`)) {
      deleteTrip(trip.id);
      if (selectedTrip?.id === trip.id) setSelectedTrip(null);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="My Trips" title="Your travel history" subtitle="Save estimates, review previous costs, and reuse a trip when you travel the same route again." action={<button className="primary-btn" onClick={() => navigate('/plan-trip')}><Plus size={17}/> New trip</button>} />

      <div className="trip-history-stats">
        <div className="garage-summary-card"><CalendarDays/><span>Saved trips</span><strong>{trips.length}</strong></div>
        <div className="garage-summary-card"><MapPin/><span>Total distance</span><strong>{number.format(totalDistance)} km</strong></div>
        <div className="garage-summary-card"><Fuel/><span>Estimated spend</span><strong>{peso.format(totalSpent)}</strong></div>
      </div>

      <div className="panel trip-history-panel">
        <div className="toolbar">
          <div className="input-shell search"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route or vehicle" /></div>
          <select className="plain-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All trips</option><option value="month">This month</option></select>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="trip-empty-state">
            <div className="empty-icon"><MapPin size={26}/></div>
            <h2>{trips.length ? 'No trips match your search' : 'No saved trips yet'}</h2>
            <p>{trips.length ? 'Try another search or filter.' : 'Plan a trip and use “Save this trip” to build your travel history.'}</p>
            {!trips.length && <button className="primary-btn" onClick={() => navigate('/plan-trip')}><Plus size={17}/> Plan your first trip</button>}
          </div>
        ) : (
          <div className="trip-history-list">
            {filteredTrips.map((trip) => (
              <article className="saved-trip-card" key={trip.id}>
                <div className="saved-trip-main">
                  <div className="saved-trip-route"><strong>{trip.origin}</strong><ArrowRight size={14}/><strong>{trip.destination}</strong></div>
                  <div className="saved-trip-meta"><span><CalendarDays size={13}/>{formatDate(trip.createdAt)}</span><span><CarFront size={13}/>{trip.vehicleName}</span><span>{number.format(trip.totalDistance)} km</span></div>
                </div>
                <div className="saved-trip-price"><strong>{peso.format(trip.total)}</strong><span>{peso.format(trip.perPerson)} / person</span></div>
                <div className="saved-trip-actions">
                  <button className="icon-action" title="View details" onClick={() => setSelectedTrip(trip)}><Eye size={17}/></button>
                  <button className="icon-action" title="Reuse trip" onClick={() => navigate(`/plan-trip?reuse=${trip.id}`)}><Copy size={17}/></button>
                  <button className="icon-action danger" title="Delete trip" onClick={() => removeTrip(trip)}><Trash2 size={17}/></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedTrip && <TripDetails trip={selectedTrip} onClose={() => setSelectedTrip(null)} onReuse={() => navigate(`/plan-trip?reuse=${selectedTrip.id}`)} onDelete={() => removeTrip(selectedTrip)} />}
    </div>
  );
}

function TripDetails({ trip, onClose, onReuse, onDelete }: { trip: SavedTrip; onClose: () => void; onReuse: () => void; onDelete: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="trip-detail-modal" onMouseDown={(e) => e.stopPropagation()}>
    <div className="modal-header"><div><div className="section-kicker">Trip details</div><h2>{trip.origin} <ArrowRight size={18}/> {trip.destination}</h2><p>Saved {formatDate(trip.createdAt)}</p></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    <div className="trip-detail-total"><span>Estimated trip cost</span><strong>{peso.format(trip.total)}</strong><small>{peso.format(trip.perPerson)} per traveler • {trip.passengers} travelers</small></div>
    <div className="trip-detail-grid">
      <Detail label="Vehicle" value={trip.vehicleName}/><Detail label="Trip type" value={trip.tripType === 'round' ? 'Round trip' : 'One way'}/>
      <Detail label="Total distance" value={`${number.format(trip.totalDistance)} km`}/><Detail label="Fuel used" value={`${number.format(trip.fuelUsed)} L`}/>
      <Detail label="Fuel cost" value={peso.format(trip.fuelCost)}/><Detail label="Tolls" value={peso.format(trip.tollCost)}/>
      <Detail label="Parking" value={peso.format(trip.parking)}/><Detail label="Other expenses" value={peso.format(trip.other)}/>
    </div>
    <div className="modal-actions trip-detail-actions"><button className="ghost-btn trip-delete-btn" onClick={onDelete}><Trash2 size={16}/> Delete</button><button className="secondary-btn" onClick={onClose}>Close</button><button className="primary-btn" onClick={onReuse}><Copy size={16}/> Reuse trip</button></div>
  </div></div>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div className="trip-detail-item"><span>{label}</span><strong>{value}</strong></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value)); }
