import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLoading from '../ui/AppLoading';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <AppLoading label="Restoring your Lakbay session…" />;
  return user ? <Outlet /> : <Navigate to="/" replace />;
}
