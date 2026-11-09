import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/navigation';
import { getDashboard } from '../../services';

function StatusBadge({ status }) {
  const tone =
    status === 'Active' || status === 'Confirmed'
      ? 'ok'
      : status === 'Pending'
      ? 'warn'
      : 'muted';

  return <span className={`badge badge-${tone}`}>{status}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuper = user?.role === ROLES.SUPER_ADMIN;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getDashboard(user)
      .then((res) => active && setData(res))
      .catch((err) => active && setError(err.message));

    return () => {
      active = false;
    };
  }, [user]);

  if (error) return <p className="alert alert-error">{error}</p>;
  if (!data) return <p className="muted">Loading...</p>;

  return (
    <section className="page-section">
      <div className="page-head">
        <div>
          <p className="eyebrow">{isSuper ? 'SUPER ADMIN' : 'ADMIN'}</p>
          <h1 className="page-title">Welcome, {user?.username || 'there'}</h1>
          <p className="muted">Overview of your franchises and upcoming events.</p>
        </div>

        {isSuper && (
          <button type="button" className="btn-primary-sm">
            + New Franchise
          </button>
        )}
      </div>

      <div className="stat-grid">
        {data.stats.map((stat) => (
          <article className="stat-tile" key={stat.label}>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-hint">{stat.hint}</p>
          </article>
        ))}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>{isSuper ? 'Recent franchises' : 'My franchises'}</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.franchises.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.city}</td>
                  <td>{f.owner}</td>
                  <td>
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Upcoming events</h2>
          </div>
          <ul className="event-list">
            {data.events.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <span>
                    {e.franchise} · {e.date}
                  </span>
                </div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </div>

        {isSuper && data.admins && (
          <div className="panel">
            <div className="panel-head">
              <h2>Admin users</h2>
            </div>
            <ul className="event-list">
              {data.admins.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.name}</strong>
                    <span>{a.scope}</span>
                  </div>
                  <span className="role-pill">{a.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}