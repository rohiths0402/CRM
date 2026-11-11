import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell, { AuthAlert, AuthField, AuthSubmit } from "../../components/auth/AuthShell";
import { authService } from "../../services/authService";

// Same rules as the backend (ValidationRules.PASSWORD_REGEX).
const PASSWORD_RULES = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A special character", test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
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

    if (!form.fullName.trim() || !form.company.trim() || !form.email.trim()) {
      fail("Please fill in your name, company and email.");
      return;
    }
    if (!PASSWORD_RULES.every((rule) => rule.test(form.password))) {
      fail("Your password doesn't meet all the rules below it yet.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      fail("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      fail("Please accept the terms and conditions.");
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        fullName: form.fullName.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        // Leave it out when blank: the API accepts a missing mobile but not "".
        mobile: form.mobile.replace(/[\s-]/g, "") || undefined,
        password: form.password,
      });
      navigate("/login", {
        state: { message: "Workspace created. Please sign in." },
      });
    } catch (err) {
      fail(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      wide
      title="Create your workspace"
      subtitle="You'll be the admin and can add other logins later."
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthAlert shakeKey={errorKey}>{error}</AuthAlert>

        <div className="lg-pair">
          <AuthField
            id="fullName"
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
            autoFocus
            required
          />
          <AuthField
            id="company"
            label="Company name"
            name="company"
            value={form.company}
            onChange={handleChange}
            autoComplete="organization"
            required
          />
        </div>

        <div className="lg-pair">
          <AuthField
            id="signup-email"
            label="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <AuthField
            id="mobile"
            label="Mobile (optional)"
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>

        <div className="lg-pair">
          <AuthField
            id="signup-password"
            label="Password"
            password
            name="password"
            value={form.password}
            onChange={handleChange}
            onCapsLock={setCapsLock}
            autoComplete="new-password"
            required
          />
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            password
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            onCapsLock={setCapsLock}
            autoComplete="new-password"
            required
          />
        </div>
        {capsLock && <p className="lg-hint">Caps Lock is on.</p>}

        <ul className="lg-rules" aria-label="Password rules">
          {PASSWORD_RULES.map((rule) => (
            <li key={rule.label} className={rule.test(form.password) ? "met" : ""}>
              {rule.label}
            </li>
          ))}
          <li
            className={
              form.confirmPassword && form.confirmPassword === form.password ? "met" : ""
            }
          >
            Passwords match
          </li>
        </ul>

        <label className="lg-check">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
          />
          <span>I agree to the terms and conditions.</span>
        </label>

        <AuthSubmit loading={loading} loadingText="Creating workspace…">
          Create workspace
        </AuthSubmit>

        <p className="lg-signup">
          Already have an account? <Link to="/login" className="lg-link">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
