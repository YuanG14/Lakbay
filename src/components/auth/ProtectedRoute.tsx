import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLoading from '../ui/AppLoading';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AppLoading label="Restoring your Lakbay session…" />;
  return user ? <Outlet /> : <Navigate to="/auth" replace state={{ from: location.pathname }} />;
}
