import { request } from '../../api/httpClient';
import { ROLES } from '../../config/navigation';
import { mockEventRequests } from '../../mocks';
import { USE_MOCK, delay, requestsFor, notifySuperAdmins } from '../shared';

export async function getEventRequests(user) {
  if (!USE_MOCK) return request('/event-requests');
  await delay(200);
  return requestsFor(user);
}

export async function createEventRequest(user, data) {
  if (!USE_MOCK) return request('/event-requests', { method: 'POST', body: data });
  await delay(400);

  const requestedBy =
    user?.role === ROLES.PARTNER ? user.username : data.requestedBy?.trim();

  if (!data.title?.trim() || !data.city?.trim() || !data.date || !requestedBy) {
    throw new Error('Title, city, date, and requester name are required.');
  }

  const newRequest = {
    id: `R${String(Date.now()).slice(-4)}`,
    title: data.title.trim(),
    city: data.city.trim(),
    date: data.date,
    requestedBy,
    description: data.description?.trim() ?? '',
    status: 'Requested',
    assignedTo: null,
  };

  mockEventRequests.push(newRequest);

  notifySuperAdmins(
    `New request from ${newRequest.requestedBy}: ${newRequest.title} (${newRequest.city})`
  );

  return newRequest;
}

export async function updateEventRequest(user, id, patch) {
  if (!USE_MOCK) return request(`/event-requests/${id}`, { method: 'PATCH', body: patch });
  await delay(300);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    throw new Error('Super Admin privileges required to manage requests.');
  }

  const req = mockEventRequests.find((r) => r.id === id);
  if (!req) throw new Error('Request not found.');

  Object.assign(req, patch);
  return req;
}