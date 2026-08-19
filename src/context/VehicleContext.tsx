import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import type { Vehicle, VehicleInput } from '../types/vehicle';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

type VehicleContextValue={vehicles:Vehicle[];defaultVehicle:Vehicle|undefined;loading:boolean;addVehicle:(i:VehicleInput)=>Vehicle;updateVehicle:(id:string,i:VehicleInput)=>void;deleteVehicle:(id:string)=>void;setDefaultVehicle:(id:string)=>void};
const C=createContext<VehicleContextValue|undefined>(undefined);
export function VehicleProvider({children}:{children:ReactNode}){
 const {user}=useAuth(); const [vehicles,setVehicles]=useState<Vehicle[]>([]); const [loading,setLoading]=useState(false);
 useEffect(()=>{if(!user||!db){setVehicles([]);return;} setLoading(true); const ref=collection(db,'users',user.uid,'vehicles'); return onSnapshot(ref,s=>{setVehicles(s.docs.map(d=>({id:d.id,...d.data()} as Vehicle)));setLoading(false)},()=>setLoading(false));},[user]);
 const defaultVehicle=useMemo(()=>vehicles.find(v=>v.isDefault)??vehicles[0],[vehicles]);
 function addVehicle(input:VehicleInput){const id=crypto.randomUUID();const vehicle:Vehicle={...input,id,isDefault:vehicles.length===0}; setVehicles(c=>[...c,vehicle]); if(user&&db){const payload=Object.fromEntries(Object.entries(vehicle).filter(([,v])=>v!==undefined));setDoc(doc(db,'users',user.uid,'vehicles',id),payload).catch(console.error)} return vehicle}
 function updateVehicle(id:string,input:VehicleInput){setVehicles(c=>c.map(v=>v.id===id?{...v,...input}:v));if(user&&db){const payload=Object.fromEntries(Object.entries(input).filter(([,v])=>v!==undefined));updateDoc(doc(db,'users',user.uid,'vehicles',id),payload).catch(console.error)}}
 function deleteVehicle(id:string){const target=vehicles.find(v=>v.id===id);const remaining=vehicles.filter(v=>v.id!==id); const normalized=target?.isDefault&&remaining.length?remaining.map((v,i)=>({...v,isDefault:i===0})):remaining;setVehicles(normalized);if(user&&db){deleteDoc(doc(db,'users',user.uid,'vehicles',id)).catch(console.error); if(target?.isDefault&&normalized[0])updateDoc(doc(db,'users',user.uid,'vehicles',normalized[0].id),{isDefault:true}).catch(console.error)}}
 function setDefaultVehicle(id:string){const next=vehicles.map(v=>({...v,isDefault:v.id===id}));setVehicles(next);if(user&&db)next.forEach(v=>updateDoc(doc(db,'users',user.uid,'vehicles',v.id),{isDefault:v.isDefault}).catch(console.error))}
 return <C.Provider value={{vehicles,defaultVehicle,loading,addVehicle,updateVehicle,deleteVehicle,setDefaultVehicle}}>{children}</C.Provider>
}
export function useVehicles(){const c=useContext(C);if(!c)throw new Error('useVehicles must be used inside VehicleProvider');return c}
