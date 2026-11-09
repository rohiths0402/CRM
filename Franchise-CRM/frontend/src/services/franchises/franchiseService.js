import { request } from '../../api/httpClient';
import { ROLES } from '../../config/navigation';
import { mockFranchises, mockEvents } from '../../mocks';
import { USE_MOCK, delay, franchisesFor } from '../shared';

export async function getFranchises(user) {
  if (!USE_MOCK) return request('/franchises');
  await delay();
  return franchisesFor(user);
}

export async function getFranchiseById(user, id) {
  if (!USE_MOCK) return request(`/franchises/${id}`);
  await delay(250);

  const franchise = franchisesFor(user).find((f) => f.id === id);
  if (!franchise) throw new Error('Franchise not found or you do not have access');

  const events = mockEvents
    .filter((e) => e.franchiseId === id)
    .map((e) => ({ ...e, franchise: franchise.name }));

  return { ...franchise, events };
}

export async function createFranchise(data) {
  if (!USE_MOCK) return request('/franchises', { method: 'POST', body: data });
  await delay(400);

  if (!data.name?.trim() || !data.city?.trim() || !data.owner?.trim() || !data.email?.trim()) {
    throw new Error('Name, city, owner and email are required');
  }

  const newFranchise = {
    id: `F${String(Date.now()).slice(-4)}`,
    name: data.name.trim(),
    city: data.city.trim(),
    owner: data.owner.trim(),
    email: data.email?.trim() ?? '',
    phone: data.phone ?? '',
    openedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: data.status,
    assignedTo: null,
  };

  mockFranchises.push(newFranchise);
  return newFranchise;
}

export async function updateFranchiseStatus(user, id, status) {
  if (!USE_MOCK) {
    return request(`/franchises/${id}/status`, { method: 'PATCH', body: { status } });
  }
  await delay(300);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    throw new Error('Only Super Admin can change franchise status');
  }

  const franchise = mockFranchises.find((f) => f.id === id);
  if (!franchise) throw new Error('Franchise not found');

  franchise.status = status;
  return franchise;
}