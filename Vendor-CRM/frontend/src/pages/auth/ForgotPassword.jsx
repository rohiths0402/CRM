import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell, { AuthAlert, AuthField, AuthSubmit } from "../../components/auth/AuthShell";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);

  const fail = (message) => {
    setError(message);
    setErrorKey((key) => key + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      fail("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(email.trim());
      navigate("/reset-password", {
        state: { email: email.trim(), message: result.message },
      });
    } catch (err) {
      fail(err.message || "Unable to send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a 6-digit code."
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthAlert shakeKey={errorKey}>{error}</AuthAlert>

        <AuthField
          id="forgot-email"
          label="Email address"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          autoFocus
          required
        />

        <AuthSubmit loading={loading} loadingText="Sending code…">
          Send code
        </AuthSubmit>

        <p className="lg-signup">
          Remembered it? <Link to="/login" className="lg-link">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
