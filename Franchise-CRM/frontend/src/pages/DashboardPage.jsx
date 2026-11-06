import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const displayName = user?.username || user?.email || 'there';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="dash">
      <header className="dash-header">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">F</div>
          <div className="brand-text">
            <span>FRANCHISE</span>
            <strong>CRM</strong>
          </div>
        </div>

        <button type="button" className="btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="dash-main">
        <div className="dash-hero">
          <div className="avatar" aria-hidden="true">{initial}</div>
          <div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1>Hello, {displayName}</h1>
            <p className="muted">Signed in as {user?.email}</p>
          </div>
        </div>

        <div className="stats">
          <article className="stat-card">
            <p className="stat-label">Active Franchises</p>
            <p className="stat-value">—</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Upcoming Events</p>
            <p className="stat-value">—</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Partnerships</p>
            <p className="stat-value">—</p>
          </article>
        </div>
      </section>
    </main>
  );
}