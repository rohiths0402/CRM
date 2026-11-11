import React from "react";
import {
  LayoutDashboard,
  Building2,
  Clapperboard,
  Users,
  CalendarDays,
  MapPin,
  Wallet,
  FileText,
  CreditCard,
  LogOut,
  Store,
  FileSearch,
  ShoppingCart,
  ReceiptText,
  IndianRupee,
  FolderCheck,
  UserCog,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { canUseProduction, isAdmin } from "../../services/access";
import "./Sidebar.css";

function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

const productionMenu = [
  {
    id: "dashboard",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "production",
    title: "PRODUCTION",
    items: [
      {
        name: "Production Houses",
        path: "/production-houses",
        icon: Building2,
      },
      {
        name: "OTT Projects",
        path: "/ott-projects",
        icon: Clapperboard,
      },
      {
        name: "Cast & Crew",
        path: "/cast-crew",
        icon: Users,
      },
      {
        name: "Schedules",
        path: "/schedules",
        icon: CalendarDays,
      },
      {
        name: "Shooting Locations",
        path: "/locations",
        icon: MapPin,
      },
    ],
  },
  {
    id: "operations",
    title: "OPERATIONS",
    items: [
      {
        name: "Budgets & Expenses",
        path: "/budgets",
        icon: Wallet,
      },
      {
        name: "Contracts",
        path: "/contracts",
        icon: FileText,
      },
      {
        name: "Team Coordination",
        path: "/coordination",
        icon: Users,
      },
      {
        name: "Payments",
        path: "/payments",
        icon: CreditCard,
      },
    ],
  },
];

const vendorMenu = [
  {
    id: "vendor-dashboard",
    items: [
      {
        name: "Vendor Dashboard",
        path: "/vendor",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "vendors",
    title: "VENDORS",
    items: [
      {
        name: "Vendors",
        path: "/vendor/vendors",
        icon: Store,
      },
      {
        name: "Documents",
        path: "/vendor/documents",
        icon: FolderCheck,
      },
    ],
  },
  {
    id: "procurement",
    title: "PROCUREMENT",
    items: [
      {
        name: "Quotations",
        path: "/vendor/quotations",
        icon: FileSearch,
      },
      {
        name: "Purchase Orders",
        path: "/vendor/purchase-orders",
        icon: ShoppingCart,
      },
      {
        name: "Invoices",
        path: "/vendor/invoices",
        icon: ReceiptText,
      },
      {
        name: "Vendor Payments",
        path: "/vendor/payments",
        icon: IndianRupee,
      },
    ],
  },
];

const adminMenu = {
  id: "admin",
  title: "ADMIN",
  items: [
    {
      name: "Users & Access",
      path: "/users",
      icon: UserCog,
    },
  ],
};

/** The Users page keeps the menu of whichever CRM this login uses. */
function menuFor(section, user) {
  const vendor =
    section === "vendor" || (section === "users" && !canUseProduction(user));
  const groups = vendor ? vendorMenu : productionMenu;
  return isAdmin(user) ? [...groups, adminMenu] : groups;
}

function Sidebar({ onNavigate, user: currentUser, section = "production" }) {
  const navigate = useNavigate();
  const user = currentUser || authService.getUser();
  const menuGroups = menuFor(section, user);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-navigation">
        {menuGroups.map((group) => (
          <div className="sidebar-section" key={group.id}>
            {group.title && (
              <p className="sidebar-label">{group.title}</p>
            )}

            <nav className="sidebar-menu">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/" || item.path === "/vendor"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="sidebar-link-icon"
                    />

                    <span className="sidebar-link-text">
                      {item.name}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="profile-avatar">{getInitials(user?.fullName)}</div>

          <div className="profile-info">
            <h4>{user?.fullName || "User"}</h4>
            <span>{user?.company || user?.email || ""}</span>
          </div>

          <button
            className="profile-logout"
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;