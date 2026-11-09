import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFranchise } from '../../services';

const INITIAL = {
  name: '',
  city: '',
  owner: '',
  email: '',
  phone: '',
  status: 'Pending',
};

export default function NewFranchisePage() {
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
      await createFranchise(form);
      navigate('/franchises', { state: { message: 'Franchise created successfully.' } });
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
          <p className="eyebrow">NEW FRANCHISE</p>
          <h1 className="page-title">Create franchise</h1>
          <p className="muted">Enter franchise details. The initial status will be Pending.</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <p className="alert alert-error">{error}</p>}

        <div className="form-row-2">
          <label className="setting-field">
            <span>Franchise name *</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="setting-field">
            <span>City *</span>
            <input name="city" value={form.city} onChange={handleChange} required />
          </label>
        </div>

        <div className="form-row-2">
          <label className="setting-field">
            <span>Owner name *</span>
            <input name="owner" value={form.owner} onChange={handleChange} required />
          </label>

          <label className="setting-field">
            <span>Owner phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
        </div>

        <label className="setting-field">
          <span>Owner email *</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label className="setting-field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <div className="setting-actions">
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => navigate('/franchises')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary-sm" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create franchise'}
          </button>
        </div>
      </form>
    </section>
  );
}