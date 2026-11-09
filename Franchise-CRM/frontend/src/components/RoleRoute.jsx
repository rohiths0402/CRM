import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomeForRole } from '../config/navigation';

export default function RoleRoute({ allowed, children }) {
  const { user } = useAuth();

  // If unauthorized, redirect to the role's default home page (Partner -> Requests, Admin -> Dashboard)
  if (!allowed.includes(user?.role)) {
    return <Navigate to={getHomeForRole(user?.role)} replace />;
  }
  return children;
}