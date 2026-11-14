import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EventsPage from "../pages/Events/EventsPage";
import VenuesPage from "../pages/Venues/VenuesPage";
import TicketingPage from "../pages/Ticketing/TicketingPage";
import SponsorsPage from "../pages/Sponsors/SponsorsPage";
import LineupPage from "../pages/Lineup/LineupPage";
import GatePage from "../pages/Gate/GatePage";
import ProposalsPage from "../pages/Proposals/ProposalsPage";
import FinancialsPage from "../pages/Financials/FinancialsPage";
import CrewPage from "../pages/Crew/CrewPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import SystemSettingsPage from "../pages/Settings/SettingsPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { ROLE_ACCESS } from "../constants/roles";

const rolesFor = (moduleKey) =>
  Object.entries(ROLE_ACCESS)
    .filter(([, keys]) => keys.includes(moduleKey))
    .map(([role]) => role);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />

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

        <Route element={<ProtectedRoute allowedRoles={rolesFor("gate")} />}>
          <Route path="/gate" element={<GatePage />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={rolesFor("proposals")} />}
        >
          <Route path="/proposals" element={<ProposalsPage />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={rolesFor("financials")} />}
        >
          <Route path="/financials" element={<FinancialsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rolesFor("crew")} />}>
          <Route path="/crew" element={<CrewPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rolesFor("profile")} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rolesFor("settings")} />}>
          <Route path="/settings" element={<SystemSettingsPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
