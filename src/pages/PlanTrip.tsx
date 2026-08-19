import { ArrowRight, CarFront, MapPin, Navigation, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

export default function PlanTrip() {
  return <div className="page-stack"><PageHeader eyebrow="Plan Trip" title="Build your trip estimate" subtitle="Phase 1 prepares the full planner interface. Cost calculations arrive in Phase 2." />
    <section className="two-col">
      <div className="panel form-panel">
        <div className="field-grid">
          <label><span>Origin</span><div className="input-shell"><MapPin size={18}/><input placeholder="Batangas City" /></div></label>
          <label><span>Destination</span><div className="input-shell"><Navigation size={18}/><input placeholder="Alabang, Muntinlupa" /></div></label>
          <label><span>Vehicle</span><div className="input-shell"><CarFront size={18}/><select><option>Toyota Vios XLE</option><option>Honda City RS</option></select></div></label>
          <label><span>Trip type</span><div className="segmented"><button className="selected">Round trip</button><button>One way</button></div></label>
        </div>
        <button className="primary-btn wide">Continue to cost details <ArrowRight size={18}/></button>
      </div>
      <div className="panel phase-note"><div className="big-icon"><Sparkles/></div><h2>Phase 1 foundation</h2><p>The complete calculation engine, passenger split, tolls, parking, fuel price and trip summary are intentionally added in Phase 2.</p></div>
    </section>
  </div>;
}
