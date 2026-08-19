export type TripType = 'round' | 'oneway';

export interface SavedTrip {
  id: string;
  origin: string;
  destination: string;
  vehicleId: string;
  vehicleName: string;
  tripType: TripType;
  oneWayDistance: number;
  totalDistance: number;
  efficiency: number;
  fuelPrice: number;
  fuelUsed: number;
  fuelCost: number;
  tollOneWay: number;
  tollCost: number;
  parking: number;
  other: number;
  passengers: number;
  total: number;
  perPerson: number;
  costPerKm: number;
  createdAt: string;
}
