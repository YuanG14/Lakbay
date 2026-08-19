import { ArrowRight, Search } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

const trips = [
  ['Batangas City','Alabang','Aug 19, 2026','Toyota Vios XLE','₱1,910'],
  ['Lipa City','Tagaytay','Aug 12, 2026','Toyota Vios XLE','₱1,020'],
  ['Batangas City','Manila','Aug 03, 2026','Honda City RS','₱2,140'],
];
export default function Trips(){return <div className="page-stack"><PageHeader eyebrow="My Trips" title="Your travel history" subtitle="Saved and completed trips will live here." action={<button className="primary-btn">+ New trip</button>}/><div className="panel"><div className="toolbar"><div className="input-shell search"><Search size={18}/><input placeholder="Search trips" /></div><select className="plain-select"><option>All trips</option><option>This month</option></select></div><div className="table-list">{trips.map((t)=><div className="table-row" key={t.join()}><div><strong>{t[0]} <ArrowRight size={14}/> {t[1]}</strong><span>{t[2]} • {t[3]}</span></div><strong>{t[4]}</strong></div>)}</div></div></div>}
