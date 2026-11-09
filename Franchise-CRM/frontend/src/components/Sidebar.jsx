import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNavItemsForRole } from '../config/navigation';
import '../styles/sidebar.css';

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  const { user, logout } = useAuth();
  const items = getNavItemsForRole(user?.role);
  const displayName = user?.username || user?.email || 'User';

  // Shows full menu when mobile drawer is open, otherwise respects desktop collapse state
  const isCollapsed = collapsed && !mobileOpen;

  // Close mobile drawer when Escape key is pressed
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onCloseMobile();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-scrim" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}
        aria-label="Sidebar"
      >
        <div className="sidebar-head">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true">F</div>
            {!isCollapsed && (
              <div className="brand-text">
                <span>FRANCHISE</span>
                <strong>CRM</strong>
              </div>
            )}
          </div>

          <button
            type="button"
            className="collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {!isCollapsed && <p className="nav-section">MENU</p>}

        <nav className="sidebar-nav" aria-label="Main navigation">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar-sm" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {!isCollapsed && (
            <div className="sidebar-user-info">
              <strong>{displayName}</strong>
              <span>{user?.email}</span>
            </div>
          )}

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
          >
            {isCollapsed ? '⎋' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
}