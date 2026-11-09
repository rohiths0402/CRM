import { request } from '../../api/httpClient';
import { mockEvents, mockEventRequests } from '../../mocks';
import { USE_MOCK, delay, eventsFor, franchisesFor } from '../shared';

export async function getEvents(user) {
  if (!USE_MOCK) return request('/events');
  await delay();
  return eventsFor(user);
}

export async function createEvent(user, data) {
  if (!USE_MOCK) return request('/events', { method: 'POST', body: data });
  await delay(400);

  if (!data.title?.trim() || !data.franchiseId || !data.date) {
    throw new Error('Title, franchise and date are required');
  }

  const allowed = franchisesFor(user).some((f) => f.id === data.franchiseId);
  if (!allowed) {
    throw new Error('You do not have access to create events for this franchise');
  }

  const newEvent = {
    id: `E${String(Date.now()).slice(-4)}`,
    title: data.title.trim(),
    franchiseId: data.franchiseId,
    date: data.date,
    status: data.status ?? 'Pending',
  };
  mockEvents.push(newEvent);

  if (data.requestId) {
    const req = mockEventRequests.find((r) => r.id === data.requestId);
    if (req) {
      req.status = 'Completed';
      req.eventId = newEvent.id;
    }
  }

  return newEvent;
}