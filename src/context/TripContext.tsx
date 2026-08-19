import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { SavedTrip } from '../types/trip';

const STORAGE_KEY = 'lakbay-trips';

type TripContextValue = {
  trips: SavedTrip[];
  addTrip: (trip: Omit<SavedTrip, 'id' | 'createdAt'>) => SavedTrip;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => SavedTrip | undefined;
};

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<SavedTrip[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const addTrip = (data: Omit<SavedTrip, 'id' | 'createdAt'>) => {
    const trip: SavedTrip = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setTrips((current) => [trip, ...current]);
    return trip;
  };

  const deleteTrip = (id: string) => setTrips((current) => current.filter((trip) => trip.id !== id));
  const getTrip = (id: string) => trips.find((trip) => trip.id === id);

  return <TripContext.Provider value={{ trips, addTrip, deleteTrip, getTrip }}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be used inside TripProvider');
  return context;
}
