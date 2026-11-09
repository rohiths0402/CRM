import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScreenLoader from "../components/common/ScreenLoader";

const GuestRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <ScreenLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default GuestRoute;
