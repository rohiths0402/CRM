import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/dashboard.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="app-body">
        <Topbar onMenuClick={() => setMobileOpen((o) => !o)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}