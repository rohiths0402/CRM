import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createAdmin, getFranchises } from '../../services';

const INITIAL = {
  name: '',
  email: '',
  status: 'Active',
  franchiseIds: [],
};

export default function NewAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [franchises, setFranchises] = useState([]);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFranchises(user)
      .then(setFranchises)
      .catch((err) => setError(err.message));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFranchise = (id) => {
    setForm((prev) => ({
      ...prev,
      franchiseIds: prev.franchiseIds.includes(id)
        ? prev.franchiseIds.filter((x) => x !== id)
        : [...prev.franchiseIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createAdmin(user, form);
      navigate('/admins');
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
          <p className="eyebrow">NEW ADMIN</p>
          <h1 className="page-title">Create admin</h1>
          <p className="muted">Enter administrator details and select franchises to grant access.</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <p className="alert alert-error">{error}</p>}

        <div className="form-row-2">
          <label className="setting-field">
            <span>Name *</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="setting-field">
            <span>Email *</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
        </div>

        <label className="setting-field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <div className="setting-field">
          <span>Access scope: Select franchises *</span>
          <div className="checkbox-grid">
            {franchises.map((f) => (
              <label
                key={f.id}
                className={`checkbox-item ${form.franchiseIds.includes(f.id) ? 'is-checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={form.franchiseIds.includes(f.id)}
                  onChange={() => toggleFranchise(f.id)}
                />
                <div>
                  <strong>{f.name}</strong>
                  <small>
                    {f.city} · {f.assignedTo ? `Assigned: ${f.assignedTo}` : 'Unassigned'}
                  </small>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="setting-actions">
          <button type="button" className="btn-secondary-sm" onClick={() => navigate('/admins')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary-sm" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create admin'}
          </button>
        </div>
      </form>
    </section>
  );
}