import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/navigation';
import '../styles/topbar.css';
import {
  getSearchIndex,
  getNotifications,
  markNotificationsRead,
} from '../services';

const NOTIFICATION_REFRESH_MS = 10000;

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PARTNER]: 'Partner',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const role = user?.role;
  const displayName = user?.username || user?.email || 'User';
  const roleLabel = ROLE_LABELS[role] ?? 'User';

  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null); // 'search' | 'bell' | 'profile' | null
  const [activeIndex, setActiveIndex] = useState(0);
  const [index, setIndex] = useState({ franchises: [], events: [] });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;

    const loadNotifications = () =>
      getNotifications(user).then((res) => active && setNotifications(res));

    getSearchIndex(user).then((res) => active && setIndex(res));
    loadNotifications();

    const timer = setInterval(loadNotifications, NOTIFICATION_REFRESH_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const franchiseHits = index.franchises
      .filter((f) => `${f.name} ${f.city} ${f.owner}`.toLowerCase().includes(q))
      .map((f) => ({
        key: `f-${f.id}`,
        type: 'Franchise',
        title: f.name,
        sub: f.city,
        to: `/franchises/${f.id}`,
      }));

    const eventHits = index.events
      .filter((e) => `${e.title} ${e.franchise}`.toLowerCase().includes(q))
      .map((e) => ({
        key: `e-${e.id}`,
        type: 'Event',
        title: e.title,
        sub: e.franchise,
        to: '/events',
      }));

    return [...franchiseHits, ...eventHits].slice(0, 6);
  }, [query, index]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const openResult = (item) => {
    navigate(item.to);
    setQuery('');
    setOpenMenu(null);
  };

  const handleSearchKey = (e) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      openResult(results[activeIndex]);
    }
  };

  const toggleMenu = (name) => {
    setOpenMenu((current) => (current === name ? null : name));
  };

  const markAllRead = async () => {
    await markNotificationsRead(user);
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="topbar" ref={wrapRef}>
      <button type="button" className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>

      {/* Partners do not have search access (they should not view other franchises or events) */}
      {role !== ROLES.PARTNER && (
        <div className="topbar-search">
          <label className="search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search franchises, events..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenMenu('search');
              }}
              onFocus={() => setOpenMenu('search')}
              onKeyDown={handleSearchKey}
              aria-autocomplete="list"
            />
          </label>

          {openMenu === 'search' && query.trim() && (
            <ul className="search-results" role="listbox">
              {results.length === 0 && (
                <li className="search-empty">No results found for "{query}"</li>
              )}

              {results.map((item, i) => (
                <li key={item.key} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    className={`search-result ${i === activeIndex ? 'is-focus' : ''}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => openResult(item)}
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.sub}</small>
                    </span>
                    <small>{item.type}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="topbar-actions">
        <div className="dropdown-wrap">
          <button
            type="button"
            className="icon-btn"
            aria-label="Notifications"
            aria-expanded={openMenu === 'bell'}
            onClick={() => toggleMenu('bell')}
          >
            🔔
            {unreadCount > 0 && <span className="bell-dot" aria-hidden="true" />}
          </button>

          {openMenu === 'bell' && (
            <div className="dropdown" role="menu">
              <div className="dropdown-head">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 && (
                <p className="search-empty">No notifications</p>
              )}

              {notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.unread ? 'is-unread' : ''}`}>
                  <p>{n.text}</p>
                  <small>{n.time}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-wrap">
          <button
            type="button"
            className="profile-btn"
            aria-expanded={openMenu === 'profile'}
            onClick={() => toggleMenu('profile')}
          >
            <span className="avatar-sm" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="profile-name">{displayName}</span>
            <span className="role-pill">{roleLabel}</span>
          </button>

          {openMenu === 'profile' && (
            <div className="dropdown" role="menu">
              <div className="profile-card">
                <strong>{displayName}</strong>
                <span>{user?.email}</span>
              </div>
              <button type="button" className="dropdown-item" onClick={() => setOpenMenu(null)}>
                My profile
              </button>
              <button type="button" className="dropdown-item danger" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}