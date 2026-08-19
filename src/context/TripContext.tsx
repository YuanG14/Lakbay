import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { SavedTrip } from '../types/trip'; import { db } from '../lib/firebase'; import { useAuth } from './AuthContext';
type V={trips:SavedTrip[];loading:boolean;addTrip:(t:Omit<SavedTrip,'id'|'createdAt'>)=>SavedTrip;deleteTrip:(id:string)=>void;getTrip:(id:string)=>SavedTrip|undefined}; const C=createContext<V|undefined>(undefined);
export function TripProvider({children}:{children:ReactNode}){const {user}=useAuth();const [trips,setTrips]=useState<SavedTrip[]>([]);const[loading,setLoading]=useState(false);
 useEffect(()=>{if(!user||!db){setTrips([]);return;}setLoading(true);return onSnapshot(collection(db,'users',user.uid,'trips'),s=>{const list=s.docs.map(d=>({id:d.id,...d.data()} as SavedTrip)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));setTrips(list);setLoading(false)},()=>setLoading(false));},[user]);
 const addTrip=(data:Omit<SavedTrip,'id'|'createdAt'>)=>{const trip:SavedTrip={...data,id:crypto.randomUUID(),createdAt:new Date().toISOString()};setTrips(c=>[trip,...c]);if(user&&db)setDoc(doc(db,'users',user.uid,'trips',trip.id),trip).catch(console.error);return trip};
 const deleteTrip=(id:string)=>{setTrips(c=>c.filter(t=>t.id!==id));if(user&&db)deleteDoc(doc(db,'users',user.uid,'trips',id)).catch(console.error)}; const getTrip=(id:string)=>trips.find(t=>t.id===id);
 return <C.Provider value={{trips,loading,addTrip,deleteTrip,getTrip}}>{children}</C.Provider>}
export function useTrips(){const c=useContext(C);if(!c)throw new Error('useTrips must be used inside TripProvider');return c}
