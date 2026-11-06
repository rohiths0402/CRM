import { request } from '../api/httpClient';
import { mockUsers, MOCK_OTP } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password, remember) {
  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Email or password wrong');
    return { email: user.email, username: user.username };
  }

  return request('/auth/login', {
    method: 'POST',
    body: { email, password, remember },
  });
}

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

export async function verifyOtp(username, email, otp) {
  if (USE_MOCK) {
    await delay();
    if (otp !== MOCK_OTP) throw new Error('OTP wrongx');
    return { verified: true };
  }

  return request('/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: { username, email, otp },
  });
}

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

export async function logout() {
  if (USE_MOCK) {
    await delay(200);
    return { success: true };
  }
  return request('/auth/logout', { method: 'POST' });
}