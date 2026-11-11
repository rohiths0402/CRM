import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell, { AuthAlert, AuthField, AuthSubmit } from "../../components/auth/AuthShell";
import { authService } from "../../services/authService";

// Matches the backend's resend cooldown.
const RESEND_SECONDS = 60;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const cameWithEmail = Boolean(location.state?.email);

  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [info, setInfo] = useState(location.state?.message || "");
  const [resendIn, setResendIn] = useState(cameWithEmail ? RESEND_SECONDS : 0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
    });
  };

  const fail = (message) => {
    setError(message);
    setErrorKey((key) => key + 1);
  };

  const handleResend = async () => {
    setError("");
    if (!form.email.trim()) {
      fail("Please enter your email address.");
      return;
    }
    try {
      const result = await authService.forgotPassword(form.email.trim());
      setInfo(result.message);
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      fail(err.message || "Unable to send the code. Please try again.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(form.otp)) {
      fail("Enter the 6-digit code from your email.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      fail("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        email: form.email.trim(),
        otp: form.otp,
        password: form.password,
      });
      navigate("/login", {
        state: { message: "Password reset successfully. Please sign in." },
      });
    } catch (err) {
      fail(err.message || "Unable to reset the password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the code from your email and choose a new password."
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthAlert shakeKey={errorKey}>{error}</AuthAlert>
        {!error && <AuthAlert type="success">{info}</AuthAlert>}

        <AuthField
          id="reset-email"
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          autoFocus={!cameWithEmail}
          required
        />

        <AuthField
          id="reset-otp"
          label="6-digit code"
          className="lg-code"
          name="otp"
          inputMode="numeric"
          value={form.otp}
          onChange={handleChange}
          autoComplete="one-time-code"
          autoFocus={cameWithEmail}
          required
        />

        <AuthField
          id="reset-password"
          label="New password"
          password
          name="password"
          value={form.password}
          onChange={handleChange}
          onCapsLock={setCapsLock}
          autoComplete="new-password"
          required
        />

        <AuthField
          id="reset-confirm"
          label="Confirm new password"
          password
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          onCapsLock={setCapsLock}
          autoComplete="new-password"
          required
        />
        {capsLock && <p className="lg-hint">Caps Lock is on.</p>}

        <div className="lg-row">
          <span className="lg-muted">Didn't get the code?</span>
          {resendIn > 0 ? (
            <span className="lg-muted">Resend in {resendIn}s</span>
          ) : (
            <button type="button" className="lg-link lg-text-button" onClick={handleResend}>
              Resend code
            </button>
          )}
        </div>

        <AuthSubmit loading={loading} loadingText="Resetting…">
          Reset password
        </AuthSubmit>

        <p className="lg-signup">
          <Link to="/login" className="lg-link">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
