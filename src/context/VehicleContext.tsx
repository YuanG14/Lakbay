import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import type { Vehicle, VehicleInput } from '../types/vehicle';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

type VehicleContextValue = {
  vehicles: Vehicle[];
  defaultVehicle: Vehicle | undefined;
  loading: boolean;
  syncError: string;
  clearSyncError: () => void;
  addVehicle: (input: VehicleInput) => Vehicle;
  updateVehicle: (id: string, input: VehicleInput) => void;
  deleteVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
};

const C = createContext<VehicleContextValue | undefined>(undefined);
const messageFor = (action: string) => `Could not ${action}. Check your connection and Firestore rules, then try again.`;

export function VehicleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    if (!user || !db) { setVehicles([]); setLoading(false); return; }
    setLoading(true);
    setSyncError('');
    return onSnapshot(
      collection(db, 'users', user.uid, 'vehicles'),
      (snapshot) => {
        setVehicles(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Vehicle)));
        setLoading(false);
      },
      (error) => {
        console.error('Vehicle sync failed.', error);
        setSyncError(messageFor('load your vehicles'));
        setLoading(false);
      },
    );
  }, [user]);

  const defaultVehicle = useMemo(() => vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0], [vehicles]);

  function addVehicle(input: VehicleInput) {
    const id = crypto.randomUUID();
    const vehicle: Vehicle = { ...input, id, isDefault: vehicles.length === 0 };
    setSyncError('');
    setVehicles((current) => [...current, vehicle]);
    if (user && db) {
      const payload = Object.fromEntries(Object.entries(vehicle).filter(([, value]) => value !== undefined));
      setDoc(doc(db, 'users', user.uid, 'vehicles', id), payload).catch((error) => {
        console.error('Vehicle create failed.', error);
        setVehicles((current) => current.filter((item) => item.id !== id));
        setSyncError(messageFor('save that vehicle'));
      });
    }
    return vehicle;
  }

  function updateVehicle(id: string, input: VehicleInput) {
    const previous = vehicles;
    setSyncError('');
    setVehicles((current) => current.map((vehicle) => vehicle.id === id ? { ...vehicle, ...input } : vehicle));
    if (user && db) {
      const payload = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
      updateDoc(doc(db, 'users', user.uid, 'vehicles', id), payload).catch((error) => {
        console.error('Vehicle update failed.', error);
        setVehicles(previous);
        setSyncError(messageFor('update that vehicle'));
      });
    }
  }

  function deleteVehicle(id: string) {
    const previous = vehicles;
    const target = vehicles.find((vehicle) => vehicle.id === id);
    const remaining = vehicles.filter((vehicle) => vehicle.id !== id);
    const normalized = target?.isDefault && remaining.length ? remaining.map((vehicle, index) => ({ ...vehicle, isDefault: index === 0 })) : remaining;
    setSyncError('');
    setVehicles(normalized);
    if (user && db) {
      deleteDoc(doc(db, 'users', user.uid, 'vehicles', id)).then(() => {
        if (target?.isDefault && normalized[0]) return updateDoc(doc(db!, 'users', user!.uid, 'vehicles', normalized[0].id), { isDefault: true });
      }).catch((error) => {
        console.error('Vehicle delete failed.', error);
        setVehicles(previous);
        setSyncError(messageFor('remove that vehicle'));
      });
    }
  }

  function setDefaultVehicle(id: string) {
    const previous = vehicles;
    const next = vehicles.map((vehicle) => ({ ...vehicle, isDefault: vehicle.id === id }));
    setSyncError('');
    setVehicles(next);
    if (user && db) {
      Promise.all(next.map((vehicle) => updateDoc(doc(db!, 'users', user!.uid, 'vehicles', vehicle.id), { isDefault: vehicle.isDefault }))).catch((error) => {
        console.error('Default vehicle update failed.', error);
        setVehicles(previous);
        setSyncError(messageFor('change your default vehicle'));
      });
    }
  }

  return <C.Provider value={{ vehicles, defaultVehicle, loading, syncError, clearSyncError: () => setSyncError(''), addVehicle, updateVehicle, deleteVehicle, setDefaultVehicle }}>{children}</C.Provider>;
}

export function useVehicles() {
  const context = useContext(C);
  if (!context) throw new Error('useVehicles must be used inside VehicleProvider');
  return context;
}
