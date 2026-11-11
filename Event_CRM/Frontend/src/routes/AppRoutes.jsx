import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EventsPage from "../pages/Events/EventsPage";
import VenuesPage from "../pages/Venues/VenuesPage";
import TicketingPage from "../pages/Ticketing/TicketingPage";
import SponsorsPage from "../pages/Sponsors/SponsorsPage";
import LineupPage from "../pages/Lineup/LineupPage";
import ModulePlaceholderPage from "../pages/ModulePlaceholder/ModulePlaceholderPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { MODULES } from "../constants/modules";
import { ROLE_ACCESS } from "../constants/roles";

const builtModules = [
  "dashboard",
  "events",
  "venues",
  "ticketing",
  "sponsors",
  "artists",
];
const placeholderModules = MODULES.filter(
  (item) => !builtModules.includes(item.key),
);

const rolesFor = (moduleKey) =>
  Object.entries(ROLE_ACCESS)
    .filter(([, keys]) => keys.includes(moduleKey))
    .map(([role]) => role);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />

    <Route element={<GuestRoute />}>
      <Route path="/login" element={<LoginPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route element={<ProtectedRoute allowedRoles={rolesFor("events")} />}>
          <Route path="/events" element={<EventsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rolesFor("venues")} />}>
          <Route path="/venues" element={<VenuesPage />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={rolesFor("ticketing")} />}
        >
          <Route path="/ticketing" element={<TicketingPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rolesFor("sponsors")} />}>
          <Route path="/sponsors" element={<SponsorsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rolesFor("artists")} />}>
          <Route path="/artists" element={<LineupPage />} />
        </Route>

        {placeholderModules.map((item) => (
          <Route
            key={item.key}
            path={item.path}
            element={<ModulePlaceholderPage />}
          />
        ))}
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
