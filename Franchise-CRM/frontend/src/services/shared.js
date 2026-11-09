import { ROLES } from '../config/navigation';
import { mockFranchises, mockEvents, mockEventRequests, mockNotifications } from '../mocks';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export function franchisesFor(user) {
  if (user?.role === ROLES.SUPER_ADMIN) return mockFranchises;
  if (user?.role === ROLES.ADMIN) {
    return mockFranchises.filter((f) => f.assignedTo === user?.email);
  }
  return [];
}

export function eventsFor(user) {
  const allowedIds = new Set(franchisesFor(user).map((f) => f.id));
  return mockEvents
    .filter((e) => allowedIds.has(e.franchiseId))
    .map((e) => ({
      ...e,
      franchise: mockFranchises.find((f) => f.id === e.franchiseId)?.name ?? '',
    }));
}

export function requestsFor(user) {
  if (user?.role === ROLES.SUPER_ADMIN) return mockEventRequests;
  if (user?.role === ROLES.PARTNER) {
    return mockEventRequests.filter((r) => r.requestedBy === user.username);
  }
  return mockEventRequests.filter((r) => r.assignedTo === user?.email);
}

export function notifySuperAdmins(text) {
  mockNotifications.unshift({
    id: Date.now(),
    text,
    time: 'Just now',
    roles: [ROLES.SUPER_ADMIN],
    unread: true,
  });
}