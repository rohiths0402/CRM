import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import { Alert, FormField, SubmitButton } from '../../components/AuthFields';
import '../../styles/login.css';

const ART = {
  tag: 'FRANCHISE MANAGEMENT PLATFORM',
  headline: 'Manage Events,',
  highlight: 'Build Partnerships.',
  description:
    'Simplify your franchise operations, manage events, connect with partners and keep your business moving forward from one smart workspace.',
};

const HEADER = {
  eyebrow: 'WELCOME BACK!',
  title: 'Sign In',
  accent: '.',
  description: 'Enter your credentials to access your workspace.',
};

const INITIAL_FORM = { email: '', password: '', remember: false };

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const notice = location.state?.message;

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form.email.trim().toLowerCase(), form.password, form.remember);
      
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout art={ART} header={HEADER}>
      <Alert variant="success">{notice}</Alert>
      <Alert>{error}</Alert>

      <form onSubmit={handleSubmit}>
        <FormField id="email" label="Email Address" icon="✉">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </FormField>

        <FormField id="password" label="Password" icon="⚿">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </FormField>

        <div className="form-options">
          <label className="remember">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="text-link">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={submitting} loadingText="Signing in...">
          Sign In
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}