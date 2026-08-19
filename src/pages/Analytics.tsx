import { useMemo, useState } from 'react';
import {
  BarChart3, CalendarDays, Car, ChevronDown, Fuel, Lightbulb, MapPin, PieChart, Route,
  Sparkles, TrendingUp, UsersRound, WalletCards, CircleDollarSign, TriangleAlert, Trophy,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useTrips } from '../context/TripContext';
import { useVehicles } from '../context/VehicleContext';
import { ExpenseCategory, SavedTrip } from '../types/trip';
import { generateTripInsights, InsightKind } from '../lib/insights';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 1 });
const monthLabel = new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' });
const shortMonth = new Intl.DateTimeFormat('en-PH', { month: 'short' });

const categoryMeta: Record<string, { label: string; className: string }> = {
  fuel: { label: 'Fuel', className: 'analytics-cat-fuel' }, tolls: { label: 'Tolls', className: 'analytics-cat-tolls' },
  parking: { label: 'Parking', className: 'analytics-cat-parking' }, food: { label: 'Food', className: 'analytics-cat-food' },
  accommodation: { label: 'Stay', className: 'analytics-cat-stay' }, ferry: { label: 'Ferry', className: 'analytics-cat-ferry' },
  other: { label: 'Other', className: 'analytics-cat-other' },
};

function monthKey(value: string | Date) { const d=value instanceof Date?value:new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function safeAmount(value: unknown) { return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0; }
function expenseBreakdown(trips: SavedTrip[]) {
  const totals:Record<string,number>={fuel:0,tolls:0,parking:0,food:0,accommodation:0,ferry:0,other:0};
  trips.forEach((trip)=>{ totals.fuel+=safeAmount(trip.fuelCost); totals.tolls+=safeAmount(trip.tollCost); totals.parking+=safeAmount(trip.parking); const items=trip.expenseItems??[]; if(items.length){items.forEach((item)=>{const category:ExpenseCategory=item.category||'other';totals[category]=(totals[category]??0)+safeAmount(item.amount);});}else totals.other+=safeAmount(trip.other); });
  return totals;
}
const insightIcons:Record<InsightKind,React.ReactNode>={ saving:<CircleDollarSign/>,fuel:<Fuel/>,sharing:<UsersRound/>,pattern:<TrendingUp/>,warning:<TriangleAlert/>,win:<Trophy/> };

export default function Analytics(){
 const {trips,loading,syncError,clearSyncError}=useTrips(); const {vehicles}=useVehicles();
 const monthOptions=useMemo(()=>{const keys=Array.from(new Set(trips.map(t=>monthKey(t.createdAt)))).sort().reverse();const current=monthKey(new Date());if(!keys.includes(current))keys.unshift(current);return keys;},[trips]);
 const [selectedMonth,setSelectedMonth]=useState(()=>monthKey(new Date()));
 const visibleTrips=useMemo(()=>trips.filter(t=>monthKey(t.createdAt)===selectedMonth),[trips,selectedMonth]);
 const previousMonth=useMemo(()=>{const[y,m]=selectedMonth.split('-').map(Number);return monthKey(new Date(y,m-2,1));},[selectedMonth]);
 const previousTrips=useMemo(()=>trips.filter(t=>monthKey(t.createdAt)===previousMonth),[trips,previousMonth]);
 const stats=useMemo(()=>{const spending=visibleTrips.reduce((s,t)=>s+safeAmount(t.total),0),distance=visibleTrips.reduce((s,t)=>s+safeAmount(t.totalDistance),0),fuel=visibleTrips.reduce((s,t)=>s+safeAmount(t.fuelUsed),0),prev=previousTrips.reduce((s,t)=>s+safeAmount(t.total),0);return{spending,distance,fuel,average:visibleTrips.length?spending/visibleTrips.length:0,change:prev>0?((spending-prev)/prev)*100:null};},[visibleTrips,previousTrips]);
 const categories=useMemo(()=>Object.entries(expenseBreakdown(visibleTrips)).map(([key,value])=>({key,value,...categoryMeta[key]})).filter(e=>e.value>0).sort((a,b)=>b.value-a.value),[visibleTrips]); const categoryTotal=categories.reduce((s,i)=>s+i.value,0);
 const vehicleUsage=useMemo(()=>{const map=new Map<string,{name:string;trips:number;distance:number;cost:number}>();visibleTrips.forEach(t=>{const key=t.vehicleId||t.vehicleName||'unknown';const c=map.get(key)??{name:t.vehicleName||'Custom vehicle',trips:0,distance:0,cost:0};c.trips++;c.distance+=safeAmount(t.totalDistance);c.cost+=safeAmount(t.total);map.set(key,c)});return Array.from(map.values()).sort((a,b)=>b.trips-a.trips||b.distance-a.distance);},[visibleTrips]);
 const recentMonths=useMemo(()=>{const[y,m]=selectedMonth.split('-').map(Number);return Array.from({length:6},(_,i)=>{const d=new Date(y,m-1-(5-i),1),key=monthKey(d),mt=trips.filter(t=>monthKey(t.createdAt)===key);return{key,label:shortMonth.format(d),total:mt.reduce((s,t)=>s+safeAmount(t.total),0),trips:mt.length};});},[trips,selectedMonth]); const maxMonthly=Math.max(...recentMonths.map(m=>m.total),1);
 const topTrip=useMemo(()=>[...visibleTrips].sort((a,b)=>safeAmount(b.total)-safeAmount(a.total))[0],[visibleTrips]);
 const selectedDate=useMemo(()=>{const[y,m]=selectedMonth.split('-').map(Number);return new Date(y,m-1,1);},[selectedMonth]);
 const insights=useMemo(()=>generateTripInsights(trips,vehicles),[trips,vehicles]);
 return <div className="page-stack analytics-page">
  <PageHeader eyebrow="Analytics" title="Understand your travel spending" subtitle="Live analytics and rule-based recommendations from the trips saved to your Lakbay account."/>
  {syncError&&<div className="sync-alert" role="alert"><span>{syncError}</span><button type="button" onClick={clearSyncError}>Dismiss</button></div>}
  <div className="analytics-toolbar panel"><div><CalendarDays size={17}/><div><span>Reporting period</span><strong>{monthLabel.format(selectedDate)}</strong></div></div><label className="analytics-month-select"><select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>{monthOptions.map(key=>{const[y,m]=key.split('-').map(Number);return <option value={key} key={key}>{monthLabel.format(new Date(y,m-1,1))}</option>})}</select><ChevronDown size={15}/></label></div>
  <section className="stat-grid analytics-stat-grid"><Metric icon={<WalletCards/>} label="Total spending" value={peso.format(stats.spending)} detail={stats.change===null?'No previous-month baseline':`${stats.change>=0?'+':''}${number.format(stats.change)}% vs previous month`}/><Metric icon={<Route/>} label="Distance traveled" value={`${number.format(stats.distance)} km`} detail={`${visibleTrips.length} saved trip${visibleTrips.length===1?'':'s'}`}/><Metric icon={<Fuel/>} label="Fuel used" value={`${number.format(stats.fuel)} L`} detail="Estimated from vehicle efficiency"/><Metric icon={<BarChart3/>} label="Average trip" value={peso.format(stats.average)} detail="Average total cost"/></section>

  <section className="panel smart-insights-panel">
   <div className="smart-insights-head"><div className="smart-insights-title"><span className="smart-insights-icon"><Sparkles/></span><div><span className="section-kicker">Lakbay Smart Insights</span><h2>Useful patterns from your trip data</h2><p>Rule-based recommendations only — no paid AI or hidden model.</p></div></div><span className="smart-rule-badge"><Lightbulb size={14}/> Explainable rules</span></div>
   {loading?<div className="smart-insights-empty">Analyzing your saved trips…</div>:insights.length===0?<div className="smart-insights-empty"><strong>Not enough trip history yet.</strong><span>Save a few trips and add more than one vehicle to unlock stronger recommendations.</span></div>:<div className="smart-insights-grid">{insights.map(insight=><article className={`smart-insight-card smart-${insight.kind}`} key={insight.id}><div className="smart-insight-top"><span className="smart-insight-card-icon">{insightIcons[insight.kind]}</span>{insight.metric&&<strong>{insight.metric}</strong>}</div><h3>{insight.title}</h3><p>{insight.message}</p></article>)}</div>}
  </section>

  {loading?<div className="panel analytics-empty"><div className="analytics-empty-icon"><TrendingUp/></div><strong>Loading your trip analytics…</strong><span>Reading your saved trips from Firestore.</span></div>:visibleTrips.length===0?<div className="panel analytics-empty"><div className="analytics-empty-icon"><Route/></div><strong>No trips saved for {monthLabel.format(selectedDate)}</strong><span>Save a trip from Plan Trip and Lakbay will automatically build your analytics here.</span></div>:<>
   <section className="analytics-main-grid"><article className="panel analytics-card analytics-trend-card"><div className="analytics-card-heading"><div><span className="section-kicker">Spending trend</span><h2>Last 6 months</h2></div><div className="analytics-heading-chip"><TrendingUp size={14}/>{peso.format(stats.spending)}</div></div><div className="analytics-bars" aria-label="Six month spending chart">{recentMonths.map(month=>{const height=month.total>0?Math.max(8,(month.total/maxMonthly)*100):3;return <div className="analytics-bar-column" key={month.key} title={`${month.label}: ${peso.format(month.total)}`}><div className="analytics-bar-value">{month.total?peso.format(month.total):'—'}</div><div className="analytics-bar-track"><div className={`analytics-bar-fill ${month.key===selectedMonth?'active':''}`} style={{height:`${height}%`}}/></div><strong>{month.label}</strong><span>{month.trips} trip{month.trips===1?'':'s'}</span></div>})}</div></article>
   <article className="panel analytics-card"><div className="analytics-card-heading"><div><span className="section-kicker">Cost breakdown</span><h2>Where the money went</h2></div><PieChart size={20}/></div><div className="analytics-category-list">{categories.map(category=>{const percentage=categoryTotal?(category.value/categoryTotal)*100:0;return <div className="analytics-category-row" key={category.key}><div className={`analytics-category-dot ${category.className}`}/><div className="analytics-category-copy"><div><strong>{category.label}</strong><span>{number.format(percentage)}%</span></div><div className="analytics-progress"><div className={category.className} style={{width:`${percentage}%`}}/></div></div><strong>{peso.format(category.value)}</strong></div>})}</div></article></section>
   <section className="analytics-secondary-grid"><article className="panel analytics-card"><div className="analytics-card-heading"><div><span className="section-kicker">Vehicle usage</span><h2>Your most-used vehicles</h2></div><Car size={20}/></div><div className="analytics-vehicle-list">{vehicleUsage.map((v,i)=><div className="analytics-vehicle-row" key={`${v.name}-${i}`}><div className="analytics-vehicle-rank">{i+1}</div><div className="analytics-vehicle-copy"><strong>{v.name}</strong><span>{v.trips} trip{v.trips===1?'':'s'} • {number.format(v.distance)} km</span></div><div className="analytics-vehicle-cost"><strong>{peso.format(v.cost)}</strong><span>spent</span></div></div>)}</div></article>
   <article className="panel analytics-card analytics-highlight-card"><div className="analytics-card-heading"><div><span className="section-kicker">Month highlight</span><h2>Most expensive trip</h2></div><MapPin size={20}/></div>{topTrip&&<><div className="analytics-highlight-route"><strong>{topTrip.origin}</strong><Route size={18}/><strong>{topTrip.destination}</strong></div><div className="analytics-highlight-total">{peso.format(topTrip.total)}</div><div className="analytics-highlight-meta"><span>{number.format(topTrip.totalDistance)} km</span><span>{topTrip.vehicleName}</span><span>{number.format(topTrip.fuelUsed)} L fuel</span></div><div className="analytics-highlight-note">This trip accounted for <strong>{stats.spending?number.format((topTrip.total/stats.spending)*100):0}%</strong> of your selected month's travel spending.</div></>}</article></section>
  </>}
 </div>;
}
function Metric({icon,label,value,detail}:{icon:React.ReactNode;label:string;value:string;detail:string}){return <div className="stat-card analytics-metric"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>}
