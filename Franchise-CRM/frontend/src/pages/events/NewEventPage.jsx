import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createEvent, getFranchises } from '../../services';
import '../../styles/events.css';
import '../../styles/forms.css';

const INITIAL = {
  title: '',
  franchiseId: '',
  date: '',
  status: 'Pending',
};

// Request date "20 Nov 2026" -> input type=date ku "2026-11-20"
// Uses local date representation to avoid one-day timezone shift from toISOString
const toInputDate = (text) => {
  if (!text) return '';
  const parsed = new Date(text);
  if (isNaN(parsed)) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// "2026-11-20" -> "20 Nov 2026" (formatted for event list display)
const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function NewEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestId = params.get('requestId') ?? '';
  const fromRequest = Boolean(requestId);

  const [franchises, setFranchises] = useState([]);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFranchises(user).then((res) => {
      setFranchises(res);
      setForm((prev) => ({
        ...prev,
        franchiseId: prev.franchiseId || res[0]?.id || '',
      }));
    });
  }, [user]);

  // Pre-fill title and date if initiated from a partner request
  useEffect(() => {
    if (!fromRequest) return;
    setForm((prev) => ({
      ...prev,
      title: params.get('title') ?? '',
      date: toInputDate(params.get('date')),
    }));
  }, [fromRequest, params]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createEvent(user, {
        ...form,
        date: formatDate(form.date),
        requestId: requestId || undefined,
      });
      navigate(fromRequest ? '/event-requests' : '/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-head">
        <div>
          <p className="eyebrow">NEW EVENT</p>
          <h1 className="page-title">Create event</h1>
          <p className="muted">
            {fromRequest
              ? 'Creating event from a partner request. Please review details and select a franchise.'
              : 'Create an event for your assigned franchise.'}
          </p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <p className="alert alert-error">{error}</p>}

        <label className="setting-field">
          <span>Event title *</span>
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <div className="form-row-2">
          <label className="setting-field">
            <span>Franchise *</span>
            <select name="franchiseId" value={form.franchiseId} onChange={handleChange} required>
              {franchises.length === 0 && <option value="">No franchise available</option>}
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>

          <label className="setting-field">
            <span>Date *</span>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>
        </div>

        <label className="setting-field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </label>

        <div className="setting-actions">
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => navigate(fromRequest ? '/event-requests' : '/events')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary-sm" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create event'}
          </button>
        </div>
      </form>
    </section>
  );
}