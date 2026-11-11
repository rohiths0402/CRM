import React from "react";
import { NavLink } from "react-router-dom";
import { Clapperboard, Menu, Store } from "lucide-react";
import { canUseProduction, canUseVendor } from "../../services/access";
import PreferencesMenu from "./PreferencesMenu";
import "./Header.css";

const titles = {
  production: {
    title: "Production Workspace",
    subtitle: "Manage your production operations",
  },
  vendor: {
    title: "Vendor Workspace",
    subtitle: "Manage vendors, purchasing and payments",
  },
  users: {
    title: "Workspace Admin",
    subtitle: "Manage who can sign in and what they can see",
  },
};

function Header({ onMenuClick, user, section = "production" }) {
  const { title, subtitle } = titles[section] || titles.production;
  const showTabs = canUseProduction(user) && canUseVendor(user);

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu"
          onClick={onMenuClick}
          type="button"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="header-title">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {showTabs && (
          <nav className="crm-tabs" aria-label="Switch CRM">
            <NavLink
              to="/"
              className={`crm-tab ${section === "production" ? "active" : ""}`}
            >
              <Clapperboard size={15} />
              <span>Production CRM</span>
            </NavLink>
            <NavLink
              to="/vendor"
              className={`crm-tab ${section === "vendor" ? "active" : ""}`}
            >
              <Store size={15} />
              <span>Vendor CRM</span>
            </NavLink>
          </nav>
        )}
        <PreferencesMenu user={user} />
      </div>
    </header>
  );
}

export default Header;
