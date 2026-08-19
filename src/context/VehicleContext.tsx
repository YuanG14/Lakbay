import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { Vehicle, VehicleInput } from '../types/vehicle';

const STORAGE_KEY = 'lakbay.vehicles.v1';

const starterVehicles: Vehicle[] = [
  {
    id: 'vios-xle-2024',
    name: 'Toyota Vios XLE',
    year: 2024,
    fuelType: 'Gasoline',
    efficiency: 14,
    tankCapacity: 42,
    isDefault: true,
  },
];

type VehicleContextValue = {
  vehicles: Vehicle[];
  defaultVehicle: Vehicle | undefined;
  addVehicle: (input: VehicleInput) => Vehicle;
  updateVehicle: (id: string, input: VehicleInput) => void;
  deleteVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
};

const VehicleContext = createContext<VehicleContextValue | undefined>(undefined);

function loadVehicles() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterVehicles;
    const parsed = JSON.parse(stored) as Vehicle[];
    return Array.isArray(parsed) && parsed.length ? parsed : starterVehicles;
  } catch {
    return starterVehicles;
  }
}

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(loadVehicles);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const defaultVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0],
    [vehicles],
  );

  function addVehicle(input: VehicleInput) {
    const vehicle: Vehicle = {
      ...input,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `vehicle-${Date.now()}`,
      isDefault: vehicles.length === 0,
    };
    setVehicles((current) => [...current, vehicle]);
    return vehicle;
  }

  function updateVehicle(id: string, input: VehicleInput) {
    setVehicles((current) => current.map((vehicle) => (
      vehicle.id === id ? { ...vehicle, ...input } : vehicle
    )));
  }

  function deleteVehicle(id: string) {
    setVehicles((current) => {
      const target = current.find((vehicle) => vehicle.id === id);
      const remaining = current.filter((vehicle) => vehicle.id !== id);
      if (target?.isDefault && remaining.length > 0) {
        return remaining.map((vehicle, index) => ({ ...vehicle, isDefault: index === 0 }));
      }
      return remaining;
    });
  }

  function setDefaultVehicle(id: string) {
    setVehicles((current) => current.map((vehicle) => ({
      ...vehicle,
      isDefault: vehicle.id === id,
    })));
  }

  return (
    <VehicleContext.Provider value={{ vehicles, defaultVehicle, addVehicle, updateVehicle, deleteVehicle, setDefaultVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (!context) throw new Error('useVehicles must be used inside VehicleProvider');
  return context;
}
