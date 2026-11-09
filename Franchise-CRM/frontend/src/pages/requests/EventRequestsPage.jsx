import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/navigation';
import {
  getEventRequests,
  updateEventRequest,
  getAdmins,
} from '../../services';
import '../../styles/events.css';

const STATUS_TONE = {
  Requested: 'warn',
  Assigned: 'ok',
  Completed: 'ok',
  Rejected: 'muted',
};

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${STATUS_TONE[status] ?? 'muted'}`}>{status}</span>
  );
}

export default function EventRequestsPage() {
  const { user } = useAuth();
  const isSuper = user?.role === ROLES.SUPER_ADMIN;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isPartner = user?.role === ROLES.PARTNER;

  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [picked, setPicked] = useState({}); // { [requestId]: adminEmail }

  const load = () =>
    getEventRequests(user)
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    setLoading(true);
    load();
    if (isSuper) {
      getAdmins(user)
        .then(setAdmins)
        .catch(() => {});
    }
  }, [user]);

  const act = async (id, patch, text) => {
    setError('');
    setMessage('');
    try {
      await updateEventRequest(user, id, patch);
      setMessage(text);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssign = (req) => {
    const email = picked[req.id];
    if (!email) {
      setError('Please select an admin');
      return;
    }
    act(
      req.id,
      { status: 'Assigned', assignedTo: email },
      `${req.title} assigned to ${email}.`
    );
  };

  const createEventLink = (r) =>
    `/events/new?requestId=${r.id}` +
    `&title=${encodeURIComponent(r.title)}` +
    `&date=${encodeURIComponent(r.date)}`;

  return (
    <section className="page-section">
      <div className="page-head">
        <div>
          <p className="eyebrow">EVENT REQUESTS</p>
          <h1 className="page-title">Requests</h1>
          <p className="muted">
            {isSuper
              ? 'Approve partner requests and assign them to an admin.'
              : isPartner
              ? 'View the status of the requests you have submitted.'
              : 'Requests assigned to you.'}
          </p>
        </div>

        <Link to="/event-requests/new" className="btn-primary-sm">
          + New Request
        </Link>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="muted">No requests found.</p>
      ) : (
        <div className="request-list">
          {requests.map((r) => (
            <article className="panel request-card" key={r.id}>
              <div className="request-top">
                <div>
                  <strong>{r.title}</strong>
                  <small>
                    {r.city} · {r.date} · Requested by {r.requestedBy}
                  </small>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {r.description && <p className="muted">{r.description}</p>}

              {r.assignedTo && !isPartner && (
                <p className="muted">
                  Assigned to: <strong>{r.assignedTo}</strong>
                </p>
              )}

              {isSuper && r.status === 'Requested' && (
                <div className="request-actions">
                  <select
                    className="toolbar-select"
                    value={picked[r.id] ?? ''}
                    onChange={(e) => setPicked({ ...picked, [r.id]: e.target.value })}
                  >
                    <option value="">Select an admin</option>
                    {admins.map((a) => (
                      <option key={a.id} value={a.email}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>

                  <button type="button" className="btn-primary-sm" onClick={() => handleAssign(r)}>
                    Approve & assign
                  </button>

                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() =>
                      act(r.id, { status: 'Rejected' }, `${r.title} has been rejected.`)
                    }
                  >
                    Reject
                  </button>
                </div>
              )}

              {isAdmin && r.status === 'Assigned' && (
                <div className="request-actions">
                  <Link to={createEventLink(r)} className="btn-primary-sm">
                    Create event
                  </Link>
                </div>
              )}

              {r.status === 'Completed' && (
                <p className="muted">
                  Event created. <strong>Completed</strong>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}