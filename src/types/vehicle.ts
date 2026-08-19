export type FuelType = 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric';

export interface Vehicle {
  id: string;
  name: string;
  year: number;
  fuelType: FuelType;
  efficiency: number;
  tankCapacity?: number;
  isDefault: boolean;
}

export type VehicleInput = Omit<Vehicle, 'id' | 'isDefault'>;
