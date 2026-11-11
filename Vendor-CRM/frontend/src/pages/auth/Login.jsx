import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthShell, { AuthAlert, AuthField, AuthSubmit } from "../../components/auth/AuthShell";
import { authService } from "../../services/authService";
import { homePath } from "../../services/access";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const fail = (message) => {
    setError(message);
    setErrorKey((key) => key + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      fail("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      // authService stores the token in sessionStorage for api.js to send.
      const result = await authService.login({
        email: form.email.trim(),
        password: form.password,
        rememberMe,
      });
      navigate(homePath(result.user), { replace: true });
    } catch (err) {
      fail(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authService.isAuthenticated()) {
    return <Navigate to={homePath(authService.getUser())} replace />;
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your workspace.">
      <form onSubmit={handleSubmit} noValidate>
        <AuthAlert shakeKey={errorKey}>{error}</AuthAlert>
        {!error && <AuthAlert type="success">{successMessage}</AuthAlert>}

        <AuthField
          id="login-email"
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          autoFocus
          required
        />

        <AuthField
          id="login-password"
          label="Password"
          password
          name="password"
          value={form.password}
          onChange={handleChange}
          onCapsLock={setCapsLock}
          autoComplete="current-password"
          required
        />
        {capsLock && <p className="lg-hint">Caps Lock is on.</p>}

        <div className="lg-row">
          <label className="lg-switch">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span className="lg-switch-track" />
            <span>Keep me signed in</span>
          </label>
          <Link to="/forgot-password" className="lg-link">
            Forgot password?
          </Link>
        </div>

        <AuthSubmit loading={loading} loadingText="Signing in…">
          Sign in
        </AuthSubmit>

        <p className="lg-signup">
          New here? <Link to="/signup" className="lg-link">Create a workspace</Link>
        </p>
      </form>
    </AuthShell>
  );
}
