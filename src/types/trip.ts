export type TripType = 'round' | 'oneway';

export type TollItem = {
  id: string;
  label: string;
  oneWayAmount: number;
};

export type ExpenseCategory = 'food' | 'accommodation' | 'ferry' | 'parking' | 'other';

export type TripExpense = {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
};

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
  tollItems?: TollItem[];
  expenseItems?: TripExpense[];
  createdAt: string;
}
