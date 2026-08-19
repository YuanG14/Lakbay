import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;
  return <div className="offline-banner" role="status"><WifiOff size={15} /> You are offline. Map routing and Firebase sync will resume when your connection returns.</div>;
}
