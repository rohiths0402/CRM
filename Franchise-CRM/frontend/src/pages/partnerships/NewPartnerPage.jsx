import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPartner } from '../../services';

const INITIAL = {
  name: '',
  type: 'Vendor',
  contractEnd: '',
  status: 'Active',
};

const TYPE_OPTIONS = ['Vendor', 'Supplier', 'Marketing', 'Technology', 'Logistics'];

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function NewPartnerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      await createPartner(user, { ...form, contractEnd: formatDate(form.contractEnd) });
      navigate('/partnerships');
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
          <p className="eyebrow">NEW PARTNER</p>
          <h1 className="page-title">Add partner</h1>
          <p className="muted">Enter the partner details. Contract end date is required.</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <p className="alert alert-error">{error}</p>}

        <label className="setting-field">
          <span>Partner name *</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <div className="form-row-2">
          <label className="setting-field">
            <span>Type *</span>
            <select name="type" value={form.type} onChange={handleChange}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="setting-field">
            <span>Contract end *</span>
            <input type="date" name="contractEnd" value={form.contractEnd} onChange={handleChange} required />
          </label>
        </div>

        <label className="setting-field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Renewal">Renewal</option>
          </select>
        </label>

        <div className="setting-actions">
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => navigate('/partnerships')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary-sm" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add partner'}
          </button>
        </div>
      </form>
    </section>
  );
}