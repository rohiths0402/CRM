import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/navigation';
import { createEventRequest } from '../../services';
import '../../styles/forms.css';

const INITIAL = {
  title: '',
  city: '',
  date: '',
  requestedBy: '',
  description: '',
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function NewEventRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPartner = user?.role === ROLES.PARTNER;

  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createEventRequest(user, {
        ...form,
        date: formatDate(form.date),
        requestedBy: isPartner ? user.username : form.requestedBy,
      });
      navigate('/event-requests');
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
          <p className="eyebrow">NEW REQUEST</p>
          <h1 className="page-title">Event request</h1>
          <p className="muted">
            {isPartner
              ? 'Enter the event details. Submitting will notify the Super Admin.'
              : 'Enter the partner event details. Submitting will notify the Super Admin.'}
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
            <span>City *</span>
            <input name="city" value={form.city} onChange={handleChange} required />
          </label>

          <label className="setting-field">
            <span>Event date *</span>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>
        </div>

        {/* Hidden for partners: their company name is filled in automatically */}
        {!isPartner && (
          <label className="setting-field">
            <span>Requested by (partner name) *</span>
            <input name="requestedBy" value={form.requestedBy} onChange={handleChange} required />
          </label>
        )}

        <label className="setting-field">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="setting-textarea"
          />
        </label>

        <div className="setting-actions">
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => navigate('/event-requests')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary-sm" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send request'}
          </button>
        </div>
      </form>
    </section>
  );
}