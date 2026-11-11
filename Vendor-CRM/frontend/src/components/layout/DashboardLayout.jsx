import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { canOpen, homePath, sectionOf } from "../../services/access";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./DashboardLayout.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => authService.getUser());
  const location = useLocation();
  const navigate = useNavigate();
  const section = sectionOf(location.pathname);

  // Pick up access changes the admin made since this login signed in.
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    authService
      .refreshUser()
      .then(setUser)
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeSidebar();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      sidebarOpen && window.innerWidth <= 768 ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!canOpen(user, section)) {
    return <Navigate to={homePath(user)} replace />;
  }

  return (
    <div className="dashboard-layout">
      <Header onMenuClick={toggleSidebar} user={user} section={section} />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-wrapper ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <Sidebar onNavigate={closeSidebar} user={user} section={section} />
      </aside>

      <div className="main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;