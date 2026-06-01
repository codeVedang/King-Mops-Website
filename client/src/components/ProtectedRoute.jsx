import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ admin = false }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) {
    return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: location }} replace />;
  }
  if (admin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};
