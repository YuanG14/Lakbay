import type { SavedTrip } from '../types/trip';
import type { Vehicle } from '../types/vehicle';

export type InsightKind = 'saving' | 'fuel' | 'sharing' | 'pattern' | 'warning' | 'win';

export interface SmartInsight {
  id: string;
  kind: InsightKind;
  title: string;
  message: string;
  metric?: string;
  priority: number;
}

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 1 });
const safe = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

export function generateTripInsights(trips: SavedTrip[], vehicles: Vehicle[]): SmartInsight[] {
  if (!trips.length) return [];

  const insights: SmartInsight[] = [];
  const recent = [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
  const totalSpend = recent.reduce((sum, trip) => sum + safe(trip.total), 0);
  const averageCost = totalSpend / recent.length;

  const costly = [...recent].sort((a, b) => safe(b.total) - safe(a.total))[0];
  if (costly && costly.total > averageCost * 1.35 && recent.length >= 3) {
    insights.push({
      id: 'expensive-trip', kind: 'warning', priority: 90,
      title: 'One trip stands out',
      message: `${costly.origin} → ${costly.destination} cost ${peso.format(costly.total)}, about ${number.format(((costly.total / averageCost) - 1) * 100)}% above your recent-trip average.`,
      metric: peso.format(costly.total),
    });
  }

  const fuelHeavy = recent
    .map((trip) => ({ trip, share: trip.total > 0 ? safe(trip.fuelCost) / trip.total : 0 }))
    .sort((a, b) => b.share - a.share)[0];
  if (fuelHeavy && fuelHeavy.share >= 0.55) {
    insights.push({
      id: 'fuel-heavy', kind: 'fuel', priority: 82,
      title: 'Fuel dominates this route',
      message: `Fuel made up ${number.format(fuelHeavy.share * 100)}% of your ${fuelHeavy.trip.origin} → ${fuelHeavy.trip.destination} trip. A more efficient vehicle would have the biggest impact here.`,
      metric: `${number.format(fuelHeavy.share * 100)}% fuel`,
    });
  }

  const shareCandidate = recent
    .filter((trip) => trip.passengers <= 2 && trip.total >= 800)
    .sort((a, b) => b.total - a.total)[0];
  if (shareCandidate) {
    const current = shareCandidate.total / Math.max(1, shareCandidate.passengers);
    const withFour = shareCandidate.total / 4;
    insights.push({
      id: 'passenger-sharing', kind: 'sharing', priority: 72,
      title: 'Sharing could lower your personal cost',
      message: `If 4 people shared the ${shareCandidate.origin} → ${shareCandidate.destination} trip equally, the cost would fall from about ${peso.format(current)} to ${peso.format(withFour)} per person.`,
      metric: `${peso.format(Math.max(0, current - withFour))} less/person`,
    });
  }

  const routes = new Map<string, SavedTrip[]>();
  recent.forEach((trip) => {
    const key = `${trip.origin.trim().toLowerCase()}→${trip.destination.trim().toLowerCase()}`;
    routes.set(key, [...(routes.get(key) ?? []), trip]);
  });
  const repeated = [...routes.values()].sort((a, b) => b.length - a.length)[0];
  if (repeated && repeated.length >= 3) {
    const routeAverage = repeated.reduce((sum, trip) => sum + safe(trip.total), 0) / repeated.length;
    insights.push({
      id: 'repeat-route', kind: 'pattern', priority: 62,
      title: 'You have a repeat route',
      message: `${repeated[0].origin} → ${repeated[0].destination} appears ${repeated.length} times in your recent trips, averaging ${peso.format(routeAverage)} each time. It is a good route to optimize first.`,
      metric: `${repeated.length} trips`,
    });
  }

  if (vehicles.length >= 2) {
    let bestSaving: { trip: SavedTrip; vehicle: Vehicle; saving: number } | null = null;
    recent.forEach((trip) => {
      if (!trip.totalDistance || !trip.fuelPrice || !trip.efficiency) return;
      const nonFuel = Math.max(0, safe(trip.total) - safe(trip.fuelCost));
      vehicles.forEach((vehicle) => {
        if (!vehicle.efficiency || vehicle.id === trip.vehicleId || vehicle.fuelType === 'Electric') return;
        const candidateFuel = (trip.totalDistance / vehicle.efficiency) * trip.fuelPrice;
        const candidateTotal = nonFuel + candidateFuel;
        const saving = trip.total - candidateTotal;
        if (saving > 50 && (!bestSaving || saving > bestSaving.saving)) bestSaving = { trip, vehicle, saving };
      });
    });
    if (bestSaving) {
      const result = bestSaving as { trip: SavedTrip; vehicle: Vehicle; saving: number };
      insights.push({
        id: 'vehicle-saving', kind: 'saving', priority: 96,
        title: `${result.vehicle.name} could save you money`,
        message: `Based on its saved ${number.format(result.vehicle.efficiency)} km/L efficiency, using it for ${result.trip.origin} → ${result.trip.destination} could reduce the estimated trip cost by about ${peso.format(result.saving)}.`,
        metric: `${peso.format(result.saving)} potential saving`,
      });
    }
  }

  const efficientTrips = recent.filter((trip) => trip.costPerKm > 0 && trip.costPerKm <= 8);
  if (efficientTrips.length >= Math.max(2, Math.ceil(recent.length * 0.4))) {
    insights.push({
      id: 'cost-win', kind: 'win', priority: 50,
      title: 'Several trips are cost-efficient',
      message: `${efficientTrips.length} of your recent trips stayed at or below ₱8 per kilometer. Keep using the same vehicle and sharing patterns on similar routes.`,
      metric: `${efficientTrips.length} efficient trips`,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 6);
}
