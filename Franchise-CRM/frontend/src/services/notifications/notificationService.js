import { request } from '../../api/httpClient';
import { mockNotifications } from '../../mocks';
import { USE_MOCK, delay } from '../shared';

export async function getNotifications(user) {
  if (!USE_MOCK) return request('/notifications');
  await delay(150);
  return mockNotifications.filter((n) => n.roles.includes(user?.role));
}

export async function markNotificationsRead(user) {
  if (!USE_MOCK) return request('/notifications/read-all', { method: 'POST' });
  await delay(100);

  mockNotifications.forEach((n) => {
    if (n.roles.includes(user?.role)) n.unread = false;
  });
  return { success: true };
}