import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { useAuth } from './context/AuthContext';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import FirebaseSetup from './pages/FirebaseSetup';
import Garage from './pages/Garage';
import PlanTrip from './pages/PlanTrip';
import Settings from './pages/Settings';
import Trips from './pages/Trips';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

export default function App() {
  const { configured } = useAuth();
  if (!configured) return <FirebaseSetup />;

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan-trip" element={<PlanTrip />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
