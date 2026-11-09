import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
  });
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [company, setCompany] = useState({
    name: 'Franchise CRM',
    contact: 'support@franchisecrm.com',
  });
  const [notify, setNotify] = useState({
    newFranchise: true,
    eventReminder: true,
    partnerRenewal: false,
  });
  const [saved, setSaved] = useState('');

  // Show a "Saved" message for 2 seconds
  const flashSaved = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  // Profile save calls the service, then updates the logged-in user (sidebar and topbar refresh)
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);

    try {
      const updated = await updateProfile(user, profile);
      updateUser({ username: updated.username, email: updated.email });
      setProfile({ username: updated.username, email: updated.email });
      flashSaved('profile');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Company settings are UI only for now. The real API call will go here later.
  const handleCompanySave = (e) => {
    e.preventDefault();
    flashSaved('company');
  };

  // Notification preferences are UI only for now. The real API call will go here later.
  const handleNotifySave = (e) => {
    e.preventDefault();
    flashSaved('notify');
  };

  return (
    <section className="page-section">
      <div className="page-head">
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h1 className="page-title">Settings</h1>
          <p className="muted">Profile, company and notification preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <form className="panel" onSubmit={handleProfileSave}>
          <div className="panel-head">
            <h2>Profile</h2>
          </div>

          {profileError && <p className="alert alert-error">{profileError}</p>}

          <label className="setting-field">
            <span>Username</span>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              required
            />
          </label>

          <label className="setting-field">
            <span>Email</span>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </label>

          <div className="setting-actions">
            {saved === 'profile' && <span className="saved-text">Saved</span>}
            <button type="submit" className="btn-primary-sm" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        {/* Company */}
        <form className="panel" onSubmit={handleCompanySave}>
          <div className="panel-head">
            <h2>Company</h2>
          </div>

          <label className="setting-field">
            <span>Company name</span>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
            />
          </label>

          <label className="setting-field">
            <span>Support contact</span>
            <input
              type="text"
              value={company.contact}
              onChange={(e) => setCompany({ ...company, contact: e.target.value })}
            />
          </label>

          <div className="setting-actions">
            {saved === 'company' && <span className="saved-text">Saved</span>}
            <button type="submit" className="btn-primary-sm">Save company</button>
          </div>
        </form>

        {/* Notifications */}
        <form className="panel" onSubmit={handleNotifySave}>
          <div className="panel-head">
            <h2>Notifications</h2>
          </div>

          {[
            ['newFranchise', 'New franchise requests'],
            ['eventReminder', 'Event reminders (1 day before)'],
            ['partnerRenewal', 'Partner renewal alerts'],
          ].map(([key, label]) => (
            <label className="toggle-row" key={key}>
              <span>{label}</span>
              <input
                type="checkbox"
                checked={notify[key]}
                onChange={(e) => setNotify({ ...notify, [key]: e.target.checked })}
              />
            </label>
          ))}

          <div className="setting-actions">
            {saved === 'notify' && <span className="saved-text">Saved</span>}
            <button type="submit" className="btn-primary-sm">Save notifications</button>
          </div>
        </form>
      </div>
    </section>
  );
}