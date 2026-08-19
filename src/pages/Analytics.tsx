import { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Car,
  ChevronDown,
  Fuel,
  MapPin,
  PieChart,
  Route,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useTrips } from '../context/TripContext';
import { ExpenseCategory, SavedTrip } from '../types/trip';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 1 });
const monthLabel = new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' });
const shortMonth = new Intl.DateTimeFormat('en-PH', { month: 'short' });

const categoryMeta: Record<string, { label: string; className: string }> = {
  fuel: { label: 'Fuel', className: 'analytics-cat-fuel' },
  tolls: { label: 'Tolls', className: 'analytics-cat-tolls' },
  parking: { label: 'Parking', className: 'analytics-cat-parking' },
  food: { label: 'Food', className: 'analytics-cat-food' },
  accommodation: { label: 'Stay', className: 'analytics-cat-stay' },
  ferry: { label: 'Ferry', className: 'analytics-cat-ferry' },
  other: { label: 'Other', className: 'analytics-cat-other' },
};

function monthKey(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function safeAmount(value: unknown) {
  return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

function expenseBreakdown(trips: SavedTrip[]) {
  const totals: Record<string, number> = { fuel: 0, tolls: 0, parking: 0, food: 0, accommodation: 0, ferry: 0, other: 0 };
  trips.forEach((trip) => {
    totals.fuel += safeAmount(trip.fuelCost);
    totals.tolls += safeAmount(trip.tollCost);
    totals.parking += safeAmount(trip.parking);
    const items = trip.expenseItems ?? [];
    if (items.length) {
      items.forEach((item) => {
        const category: ExpenseCategory = item.category || 'other';
        totals[category] = (totals[category] ?? 0) + safeAmount(item.amount);
      });
    } else {
      totals.other += safeAmount(trip.other);
    }
  });
  return totals;
}

export default function Analytics() {
  const { trips, loading } = useTrips();
  const monthOptions = useMemo(() => {
    const keys = Array.from(new Set(trips.map((trip) => monthKey(trip.createdAt)))).sort().reverse();
    const current = monthKey(new Date());
    if (!keys.includes(current)) keys.unshift(current);
    return keys;
  }, [trips]);
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));

  const visibleTrips = useMemo(
    () => trips.filter((trip) => monthKey(trip.createdAt) === selectedMonth),
    [trips, selectedMonth],
  );

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return monthKey(new Date(year, month - 2, 1));
  }, [selectedMonth]);
  const previousTrips = useMemo(() => trips.filter((trip) => monthKey(trip.createdAt) === previousMonth), [trips, previousMonth]);

  const stats = useMemo(() => {
    const spending = visibleTrips.reduce((sum, trip) => sum + safeAmount(trip.total), 0);
    const distance = visibleTrips.reduce((sum, trip) => sum + safeAmount(trip.totalDistance), 0);
    const fuel = visibleTrips.reduce((sum, trip) => sum + safeAmount(trip.fuelUsed), 0);
    const previousSpending = previousTrips.reduce((sum, trip) => sum + safeAmount(trip.total), 0);
    const change = previousSpending > 0 ? ((spending - previousSpending) / previousSpending) * 100 : null;
    return {
      spending,
      distance,
      fuel,
      average: visibleTrips.length ? spending / visibleTrips.length : 0,
      change,
    };
  }, [visibleTrips, previousTrips]);

  const categories = useMemo(() => {
    const totals = expenseBreakdown(visibleTrips);
    return Object.entries(totals)
      .map(([key, value]) => ({ key, value, ...categoryMeta[key] }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [visibleTrips]);
  const categoryTotal = categories.reduce((sum, item) => sum + item.value, 0);

  const vehicleUsage = useMemo(() => {
    const map = new Map<string, { name: string; trips: number; distance: number; cost: number }>();
    visibleTrips.forEach((trip) => {
      const key = trip.vehicleId || trip.vehicleName || 'unknown';
      const current = map.get(key) ?? { name: trip.vehicleName || 'Custom vehicle', trips: 0, distance: 0, cost: 0 };
      current.trips += 1;
      current.distance += safeAmount(trip.totalDistance);
      current.cost += safeAmount(trip.total);
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) => b.trips - a.trips || b.distance - a.distance);
  }, [visibleTrips]);

  const recentMonths = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return Array.from({ length: 6 }, (_, index) => {
      const d = new Date(year, month - 1 - (5 - index), 1);
      const key = monthKey(d);
      const monthTrips = trips.filter((trip) => monthKey(trip.createdAt) === key);
      return {
        key,
        label: shortMonth.format(d),
        total: monthTrips.reduce((sum, trip) => sum + safeAmount(trip.total), 0),
        trips: monthTrips.length,
      };
    });
  }, [trips, selectedMonth]);
  const maxMonthly = Math.max(...recentMonths.map((month) => month.total), 1);

  const topTrip = useMemo(
    () => [...visibleTrips].sort((a, b) => safeAmount(b.total) - safeAmount(a.total))[0],
    [visibleTrips],
  );

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  return (
    <div className="page-stack analytics-page">
      <PageHeader
        eyebrow="Analytics"
        title="Understand your travel spending"
        subtitle="Live insights calculated from the trips saved to your Lakbay account."
      />

      <div className="analytics-toolbar panel">
        <div>
          <CalendarDays size={17}/>
          <div><span>Reporting period</span><strong>{monthLabel.format(selectedDate)}</strong></div>
        </div>
        <label className="analytics-month-select">
          <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
            {monthOptions.map((key) => {
              const [year, month] = key.split('-').map(Number);
              return <option value={key} key={key}>{monthLabel.format(new Date(year, month - 1, 1))}</option>;
            })}
          </select>
          <ChevronDown size={15}/>
        </label>
      </div>

      <section className="stat-grid analytics-stat-grid">
        <Metric icon={<WalletCards/>} label="Total spending" value={peso.format(stats.spending)} detail={stats.change === null ? 'No previous-month baseline' : `${stats.change >= 0 ? '+' : ''}${number.format(stats.change)}% vs previous month`} />
        <Metric icon={<Route/>} label="Distance traveled" value={`${number.format(stats.distance)} km`} detail={`${visibleTrips.length} saved trip${visibleTrips.length === 1 ? '' : 's'}`} />
        <Metric icon={<Fuel/>} label="Fuel used" value={`${number.format(stats.fuel)} L`} detail="Estimated from vehicle efficiency" />
        <Metric icon={<BarChart3/>} label="Average trip" value={peso.format(stats.average)} detail="Average total cost" />
      </section>

      {loading ? (
        <div className="panel analytics-empty"><div className="analytics-empty-icon"><TrendingUp/></div><strong>Loading your trip analytics…</strong><span>Reading your saved trips from Firestore.</span></div>
      ) : visibleTrips.length === 0 ? (
        <div className="panel analytics-empty"><div className="analytics-empty-icon"><Route/></div><strong>No trips saved for {monthLabel.format(selectedDate)}</strong><span>Save a trip from Plan Trip and Lakbay will automatically build your analytics here.</span></div>
      ) : (
        <>
          <section className="analytics-main-grid">
            <article className="panel analytics-card analytics-trend-card">
              <div className="analytics-card-heading">
                <div><span className="section-kicker">Spending trend</span><h2>Last 6 months</h2></div>
                <div className="analytics-heading-chip"><TrendingUp size={14}/>{peso.format(stats.spending)}</div>
              </div>
              <div className="analytics-bars" aria-label="Six month spending chart">
                {recentMonths.map((month) => {
                  const height = month.total > 0 ? Math.max(8, (month.total / maxMonthly) * 100) : 3;
                  return <div className="analytics-bar-column" key={month.key} title={`${month.label}: ${peso.format(month.total)}`}><div className="analytics-bar-value">{month.total ? peso.format(month.total) : '—'}</div><div className="analytics-bar-track"><div className={`analytics-bar-fill ${month.key === selectedMonth ? 'active' : ''}`} style={{ height: `${height}%` }}/></div><strong>{month.label}</strong><span>{month.trips} trip{month.trips === 1 ? '' : 's'}</span></div>;
                })}
              </div>
            </article>

            <article className="panel analytics-card">
              <div className="analytics-card-heading"><div><span className="section-kicker">Cost breakdown</span><h2>Where the money went</h2></div><PieChart size={20}/></div>
              <div className="analytics-category-list">
                {categories.map((category) => {
                  const percentage = categoryTotal ? (category.value / categoryTotal) * 100 : 0;
                  return <div className="analytics-category-row" key={category.key}><div className={`analytics-category-dot ${category.className}`}/><div className="analytics-category-copy"><div><strong>{category.label}</strong><span>{number.format(percentage)}%</span></div><div className="analytics-progress"><div className={category.className} style={{ width: `${percentage}%` }}/></div></div><strong>{peso.format(category.value)}</strong></div>;
                })}
              </div>
            </article>
          </section>

          <section className="analytics-secondary-grid">
            <article className="panel analytics-card">
              <div className="analytics-card-heading"><div><span className="section-kicker">Vehicle usage</span><h2>Your most-used vehicles</h2></div><Car size={20}/></div>
              <div className="analytics-vehicle-list">
                {vehicleUsage.map((vehicle, index) => <div className="analytics-vehicle-row" key={`${vehicle.name}-${index}`}><div className="analytics-vehicle-rank">{index + 1}</div><div className="analytics-vehicle-copy"><strong>{vehicle.name}</strong><span>{vehicle.trips} trip{vehicle.trips === 1 ? '' : 's'} • {number.format(vehicle.distance)} km</span></div><div className="analytics-vehicle-cost"><strong>{peso.format(vehicle.cost)}</strong><span>spent</span></div></div>)}
              </div>
            </article>

            <article className="panel analytics-card analytics-highlight-card">
              <div className="analytics-card-heading"><div><span className="section-kicker">Month highlight</span><h2>Most expensive trip</h2></div><MapPin size={20}/></div>
              {topTrip && <><div className="analytics-highlight-route"><strong>{topTrip.origin}</strong><Route size={18}/><strong>{topTrip.destination}</strong></div><div className="analytics-highlight-total">{peso.format(topTrip.total)}</div><div className="analytics-highlight-meta"><span>{number.format(topTrip.totalDistance)} km</span><span>{topTrip.vehicleName}</span><span>{number.format(topTrip.fuelUsed)} L fuel</span></div><div className="analytics-highlight-note">This trip accounted for <strong>{stats.spending ? number.format((topTrip.total / stats.spending) * 100) : 0}%</strong> of your selected month's travel spending.</div></>}
            </article>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="stat-card analytics-metric"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}
