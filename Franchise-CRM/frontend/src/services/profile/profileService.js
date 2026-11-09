import { request } from '../../api/httpClient';
import { USE_MOCK, delay } from '../shared';

export async function updateProfile(user, data) {
  if (!USE_MOCK) return request('/auth/profile', { method: 'PUT', body: data });
  await delay(400);

  if (!data.username?.trim() || !data.email?.trim()) {
    throw new Error('Both username and email are required.');
  }

  return { ...user, username: data.username.trim(), email: data.email.trim().toLowerCase() };
}