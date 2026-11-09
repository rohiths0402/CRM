import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdmins } from '../../services';

const STATUS_OPTIONS = ['All', 'Active', 'Inactive'];

function StatusBadge({ status }) {
  const tone = status === 'Active' ? 'ok' : 'muted';
  return <span className={`badge badge-${tone}`}>{status}</span>;
}

function ScopeChips({ scope }) {
  const parts = scope
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="chip-row">
      {parts.map((p) => (
        <span key={p} className="chip">
          {p}
        </span>
      ))}
    </div>
  );
}

export default function AdminsPage() {
  const { user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    let active = true;
    setLoading(true);

    getAdmins(user)
      .then((res) => active && setAdmins(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return admins.filter((a) => {
      const matchesText =
        !q || `${a.name} ${a.email} ${a.role} ${a.scope}`.toLowerCase().includes(q);
      const matchesStatus = status === 'All' || a.status === status;
      return matchesText && matchesStatus;
    });
  }, [admins, query, status]);

  const summary = {
    total: admins.length,
    active: admins.filter((a) => a.status === 'Active').length,
    inactive: admins.filter((a) => a.status === 'Inactive').length,
    superAdmins: admins.filter((a) => a.role === 'Super Admin').length,
  };

  if (error) return <p className="alert alert-error">{error}</p>;

  return (
    <section className="page-section">
      <div className="page-head">
        <div>
          <p className="eyebrow">ADMINS</p>
          <h1 className="page-title">Admin users</h1>
          <p className="muted">All administrator accounts and their access scopes are listed here.</p>
        </div>

        <Link to="/admins/new" className="btn-primary-sm">
          + New Admin
        </Link>
      </div>

      <div className="summary-strip">
        <div className="summary-item">
          <span>Total admins</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-item">
          <span>Active</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="summary-item">
          <span>Inactive</span>
          <strong>{summary.inactive}</strong>
        </div>
        <div className="summary-item">
          <span>Super admins</span>
          <strong>{summary.superAdmins}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <input
            className="toolbar-search"
            type="search"
            placeholder="Name, email, role or scope search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="toolbar-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No administrators found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Role</th>
                <th>Access scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-user">
                      <span className="avatar-sm" aria-hidden="true">
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{a.name}</strong>
                        <small>{a.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-pill">{a.role}</span>
                  </td>
                  <td>
                    <ScopeChips scope={a.scope} />
                  </td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}