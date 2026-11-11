import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductionHousesPage from "./pages/production-houses/ProductionHousesPage";
import OTTProjectsPage from "./pages/ott-projects/OTTProjectsPage";
import CastCrewPage from "./pages/cast-crew/CastCrewPage";
import ProductionSchedulesPage from "./pages/production-schedules/ProductionSchedulesPage";
import ShootingLocationsPage from "./pages/shooting-locations/ShootingLocationsPage";
import BudgetsExpensesPage from "./pages/budgets/BudgetsExpensesPage";
import ContractsPage from "./pages/contracts/ContractsPage";
import TeamCoordinationPage from "./pages/coordination/TeamCoordinationPage";
import PaymentsPage from "./pages/payments/PaymentsPage";

// Vendor CRM
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage";
import {
  VendorsPage,
  QuotationsPage,
  PurchaseOrdersPage,
  VendorInvoicesPage,
  VendorPaymentsPage,
  VendorDocumentsPage,
} from "./pages/vendor/vendorPages";

import UsersPage from "./pages/users/UsersPage";

function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />

        <Route
          path="/production-houses"
          element={<ProductionHousesPage />}
        />

        <Route
          path="/ott-projects"
          element={<OTTProjectsPage />}
        />

        <Route
          path="/cast-crew"
          element={<CastCrewPage />}
        />

        <Route
          path="/schedules"
          element={<ProductionSchedulesPage />}
        />

        <Route
          path="/locations"
          element={<ShootingLocationsPage />}
        />

        <Route
          path="/budgets"
          element={<BudgetsExpensesPage />}
        />

        <Route
          path="/contracts"
          element={<ContractsPage />}
        />

        <Route
          path="/coordination"
          element={<TeamCoordinationPage />}
        />

        <Route
          path="/payments"
          element={<PaymentsPage />}
        />

        {/* Vendor CRM; DashboardLayout keeps out logins without vendor access. */}
        <Route path="/vendor" element={<VendorDashboardPage />} />
        <Route path="/vendor/vendors" element={<VendorsPage />} />
        <Route path="/vendor/quotations" element={<QuotationsPage />} />
        <Route path="/vendor/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/vendor/invoices" element={<VendorInvoicesPage />} />
        <Route path="/vendor/payments" element={<VendorPaymentsPage />} />
        <Route path="/vendor/documents" element={<VendorDocumentsPage />} />

        <Route path="/users" element={<UsersPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={<Navigate to="/" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;