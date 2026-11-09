import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />

    <Route element={<GuestRoute />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
