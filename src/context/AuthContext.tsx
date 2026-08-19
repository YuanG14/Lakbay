import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, firebaseConfigured } from '../lib/firebase';

type AuthValue = { user: User | null; loading: boolean; configured: boolean; login:(e:string,p:string)=>Promise<void>; signup:(n:string,e:string,p:string)=>Promise<void>; logout:()=>Promise<void> };
const AuthContext=createContext<AuthValue|undefined>(undefined);
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(firebaseConfigured);
 useEffect(()=>{ if(!auth){setLoading(false);return;} return onAuthStateChanged(auth,u=>{setUser(u);setLoading(false);}); },[]);
 const login=async(e:string,p:string)=>{if(!auth) throw new Error('Firebase is not configured.'); await signInWithEmailAndPassword(auth,e,p)};
 const signup=async(n:string,e:string,p:string)=>{if(!auth) throw new Error('Firebase is not configured.'); const c=await createUserWithEmailAndPassword(auth,e,p); await updateProfile(c.user,{displayName:n}); setUser({...c.user} as User)};
 const logout=async()=>{if(auth) await signOut(auth)};
 return <AuthContext.Provider value={{user,loading,configured:firebaseConfigured,login,signup,logout}}>{children}</AuthContext.Provider>
}
export function useAuth(){const c=useContext(AuthContext); if(!c) throw new Error('useAuth must be inside AuthProvider'); return c}
