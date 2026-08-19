import { Route } from 'lucide-react';
export default function AppLoading({ label = 'Loading Lakbay…' }: { label?: string }) {
  return <div className="app-loading" role="status" aria-live="polite"><div className="loading-brand"><Route size={23}/></div><span className="loading-spinner"/><strong>{label}</strong></div>;
}
