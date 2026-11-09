import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DashboardPage from './pages/dashboard/DashboardPage';

import FranchisesPage from './pages/franchises/FranchisesPage';
import FranchiseDetailPage from './pages/franchises/FranchiseDetailPage';
import NewFranchisePage from './pages/franchises/NewFranchisePage';

import EventsPage from './pages/events/EventsPage';
import NewEventPage from './pages/events/NewEventPage';

import EventRequestsPage from './pages/requests/EventRequestsPage';
import NewEventRequestPage from './pages/requests/NewEventRequestPage';

import PartnershipsPage from './pages/partnerships/PartnershipsPage';
import NewPartnerPage from './pages/partnerships/NewPartnerPage';

import AdminsPage from './pages/admins/AdminsPage';
import NewAdminPage from './pages/admins/NewAdminPage';

import SettingsPage from './pages/settings/SettingsPage';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { ROLES } from './config/navigation';

const STAFF = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const ALL = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PARTNER];
const SUPER = [ROLES.SUPER_ADMIN];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Staff only (Super Admin + Admin) */}
          <Route path="/dashboard" element={<RoleRoute allowed={STAFF}><DashboardPage /></RoleRoute>} />
          <Route path="/franchises" element={<RoleRoute allowed={STAFF}><FranchisesPage /></RoleRoute>} />
          <Route path="/franchises/:id" element={<RoleRoute allowed={STAFF}><FranchiseDetailPage /></RoleRoute>} />
          <Route path="/events" element={<RoleRoute allowed={STAFF}><EventsPage /></RoleRoute>} />
          <Route path="/events/new" element={<RoleRoute allowed={STAFF}><NewEventPage /></RoleRoute>} />
          <Route path="/partnerships" element={<RoleRoute allowed={STAFF}><PartnershipsPage /></RoleRoute>} />

          {/* Requests: all roles */}
          <Route path="/event-requests" element={<RoleRoute allowed={ALL}><EventRequestsPage /></RoleRoute>} />
          <Route path="/event-requests/new" element={<RoleRoute allowed={ALL}><NewEventRequestPage /></RoleRoute>} />

          {/* Super Admin only */}
          <Route path="/franchises/new" element={<RoleRoute allowed={SUPER}><NewFranchisePage /></RoleRoute>} />
          <Route path="/partnerships/new" element={<RoleRoute allowed={SUPER}><NewPartnerPage /></RoleRoute>} />
          <Route path="/admins" element={<RoleRoute allowed={SUPER}><AdminsPage /></RoleRoute>} />
          <Route path="/admins/new" element={<RoleRoute allowed={SUPER}><NewAdminPage /></RoleRoute>} />
          <Route path="/settings" element={<RoleRoute allowed={SUPER}><SettingsPage /></RoleRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}