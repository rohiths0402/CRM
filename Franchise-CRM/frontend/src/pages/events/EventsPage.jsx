import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../services';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['All', 'Confirmed', 'Pending'];

function StatusBadge({ status }) {
  const tone = status === 'Confirmed' ? 'ok' : 'warn';
  return <span className={`badge badge-${tone}`}>{status}</span>;
}

export default function EventsPage() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    let active = true;
    setLoading(true);

    getEvents(user)
      .then((res) => active && setEvents(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      const matchesText =
        !q || `${e.title} ${e.franchise} ${e.date}`.toLowerCase().includes(q);
      const matchesStatus = status === 'All' || e.status === status;
      return matchesText && matchesStatus;
    });
  }, [events, query, status]);

  if (error) return <p className="alert alert-error">{error}</p>;

  return (
    <section className="page-section">
      <div className="page-head">
        <Link to="/events/new" className="btn-primary-sm">
  + New Event
</Link>
        <div>
          <p className="eyebrow">EVENTS</p>
          <h1 className="page-title">All events</h1>
          <p className="muted">List of all scheduled franchise events.</p>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <input
            className="toolbar-search"
            type="search"
            placeholder="Event, franchise or date search..."
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
          <p className="muted">No events found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event</th>
                <th>Franchise</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.title}</td>
                  <td>{e.franchise}</td>
                  <td>{e.date}</td>
                  <td>
                    <StatusBadge status={e.status} />
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