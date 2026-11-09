import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import {
  Alert,
  FormField,
  RecoverySteps,
  SubmitButton,
} from '../../components/AuthFields';
import { sendOtp, verifyOtp, resetPassword } from '../../services/authService';
import '../../styles/login.css';

const OTP_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;

const ART = {
  tag: 'ACCOUNT RECOVERY',
  headline: 'Secure Your',
  highlight: 'Account Access.',
  description:
    'Recover your account securely and get back to managing your franchise events and partnerships without interruption.',
};

const HEADERS = {
  1: {
    eyebrow: 'ACCOUNT RECOVERY',
    title: 'Forgot Password',
    accent: '?',
    description:
      'Enter your username and registered email address to receive a verification code.',
  },
  2: {
    eyebrow: 'EMAIL VERIFICATION',
    title: 'Verify Your Email',
    accent: '.',
    description:
      'Enter the 6-digit verification code sent to your registered email address.',
  },
  3: {
    eyebrow: 'CREATE NEW PASSWORD',
    title: 'Reset Password',
    accent: '.',
    description:
      'Create a strong new password to secure your Franchise CRM account.',
  },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [account, setAccount] = useState({ username: '', email: '' });
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Normalize once to send consistent values in every API call
  const payload = {
    username: account.username.trim(),
    email: account.email.trim().toLowerCase(),
  };

  // Common async wrapper: loading, error handling, success callback
  const run = async (action, onSuccess) => {
    setError('');
    setSubmitting(true);
    try {
      const result = await action();
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendCode = () =>
    run(
      () => sendOtp(payload.username, payload.email),
      (res) => {
        setInfo(res?.message || 'A verification code has been sent to your email.');
        setStep(2);
      }
    );

  const verifyCode = (e) => {
    e.preventDefault();
    run(
      () => verifyOtp(payload.username, payload.email, otp),
      () => {
        setInfo('');
        setStep(3);
      }
    );
  };

  const handleReset = (e) => {
    e.preventDefault();
    run(
      () => resetPassword(payload.username, payload.email, otp, newPassword),
      () =>
        navigate('/login', {
          state: { message: 'Your password has been reset. Please sign in.' },
        })
    );
  };

  const requestCode = (e) => {
    e.preventDefault();
    sendCode();
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
  };

  return (
    <AuthLayout
      art={ART}
      header={HEADERS[step]}
      top={<RecoverySteps current={step} />}
    >
      <Alert>{error}</Alert>

      {step === 1 && (
        <form onSubmit={requestCode}>
          <FormField id="username" label="Username" icon="@">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={account.username}
              onChange={handleAccountChange}
              autoComplete="username"
              required
            />
          </FormField>

          <FormField id="email" label="Email Address" icon="✉">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your registered email"
              value={account.email}
              onChange={handleAccountChange}
              autoComplete="email"
              required
            />
          </FormField>

          <SubmitButton loading={submitting} loadingText="Sending code...">
            Send Verification Code
          </SubmitButton>
        </form>
      )}

      {step === 2 && (
        <>
          <Alert variant="success">{info}</Alert>

          <form onSubmit={verifyCode}>
            <FormField id="otp" label="Verification Code" icon="#">
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleOtpChange}
                required
              />
            </FormField>

            <SubmitButton
              loading={submitting}
              loadingText="Verifying..."
              disabled={otp.length !== OTP_LENGTH}
            >
              Verify Code
            </SubmitButton>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={sendCode}
              disabled={submitting}
            >
              Resend verification code
            </button>
          </form>
        </>
      )}

      {step === 3 && (
        <form onSubmit={handleReset}>
          <FormField id="newPassword" label="New Password" icon="⚿">
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </FormField>

          <p className="password-hint">
            Password must be at least {MIN_PASSWORD_LENGTH} characters.
          </p>

          <SubmitButton loading={submitting} loadingText="Resetting...">
            Reset Password
          </SubmitButton>
        </form>
      )}

      <p className="center-link">
        <Link to="/login" className="back-link">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}