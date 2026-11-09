import { request } from '../api/httpClient';
import { mockUsers, MOCK_OTP } from '../mocks';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- LOGIN ----------
export async function login(email, password, remember) {
  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Email or password wrong');
    return { email: user.email, username: user.username, role: user.role };
  }

  return request('/auth/login', {
    method: 'POST',
    body: { email, password, remember },
  });
}

// ---------- FORGOT PASSWORD: SEND OTP ----------
export async function sendOtp(username, email) {
  if (USE_MOCK) {
    await delay(800);
    const user = mockUsers.find((u) => u.username === username && u.email === email);
    if (!user) throw new Error('Username or email wrong');
    console.log('Demo OTP:', MOCK_OTP);
    return { message: `OTP ${email} send it` };
  }

  return request('/auth/forgot-password/send-otp', {
    method: 'POST',
    body: { username, email },
  });
}

// ---------- VERIFY OTP ----------
export async function verifyOtp(username, email, otp) {
  if (USE_MOCK) {
    await delay();
    if (otp !== MOCK_OTP) throw new Error('OTP wrong');
    return { verified: true };
  }

  return request('/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: { username, email, otp },
  });
}

// ---------- RESET PASSWORD ----------
export async function resetPassword(username, email, otp, newPassword) {
  if (USE_MOCK) {
    await delay();
    return { success: true };
  }

  return request('/auth/forgot-password/reset', {
    method: 'POST',
    body: { username, email, otp, newPassword },
  });
}

// ---------- LOGOUT ----------
export async function logout() {
  if (USE_MOCK) {
    await delay(200);
    return { success: true };
  }
  return request('/auth/logout', { method: 'POST' });
}