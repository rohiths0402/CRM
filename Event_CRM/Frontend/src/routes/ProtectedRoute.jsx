import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScreenLoader from "../components/common/ScreenLoader";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <ScreenLoader />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
