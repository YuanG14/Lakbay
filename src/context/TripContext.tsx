import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { SavedTrip } from '../types/trip';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

type TripContextValue = {
  trips: SavedTrip[];
  loading: boolean;
  syncError: string;
  clearSyncError: () => void;
  addTrip: (trip: Omit<SavedTrip, 'id' | 'createdAt'>) => SavedTrip;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => SavedTrip | undefined;
};
const C = createContext<TripContextValue | undefined>(undefined);
const messageFor = (action: string) => `Could not ${action}. Check your connection and Firestore rules, then try again.`;

export function TripProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    if (!user || !db) { setTrips([]); setLoading(false); return; }
    setLoading(true);
    setSyncError('');
    return onSnapshot(
      collection(db, 'users', user.uid, 'trips'),
      (snapshot) => {
        const list = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() } as SavedTrip))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setTrips(list);
        setLoading(false);
      },
      (error) => {
        console.error('Trip sync failed.', error);
        setSyncError(messageFor('load your trips'));
        setLoading(false);
      },
    );
  }, [user]);

  const addTrip = (data: Omit<SavedTrip, 'id' | 'createdAt'>) => {
    const trip: SavedTrip = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setSyncError('');
    setTrips((current) => [trip, ...current]);
    if (user && db) {
      setDoc(doc(db, 'users', user.uid, 'trips', trip.id), trip).catch((error) => {
        console.error('Trip create failed.', error);
        setTrips((current) => current.filter((item) => item.id !== trip.id));
        setSyncError(messageFor('save that trip'));
      });
    }
    return trip;
  };

  const deleteTrip = (id: string) => {
    const previous = trips;
    setSyncError('');
    setTrips((current) => current.filter((trip) => trip.id !== id));
    if (user && db) {
      deleteDoc(doc(db, 'users', user.uid, 'trips', id)).catch((error) => {
        console.error('Trip delete failed.', error);
        setTrips(previous);
        setSyncError(messageFor('delete that trip'));
      });
    }
  };

  const getTrip = (id: string) => trips.find((trip) => trip.id === id);

  return <C.Provider value={{ trips, loading, syncError, clearSyncError: () => setSyncError(''), addTrip, deleteTrip, getTrip }}>{children}</C.Provider>;
}

export function useTrips() {
  const context = useContext(C);
  if (!context) throw new Error('useTrips must be used inside TripProvider');
  return context;
}
