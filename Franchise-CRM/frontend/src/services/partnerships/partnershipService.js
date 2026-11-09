import { request } from '../../api/httpClient';
import { ROLES } from '../../config/navigation';
import { mockPartnerships } from '../../mocks';
import { USE_MOCK, delay } from '../shared';

export async function getPartnerships() {
  if (!USE_MOCK) return request('/partnerships');
  await delay();
  return mockPartnerships;
}

export async function createPartner(user, data) {
  if (!USE_MOCK) return request('/partnerships', { method: 'POST', body: data });
  await delay(400);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    throw new Error('Super Admin privileges required to add a partner.');
  }
  if (!data.name?.trim() || !data.type?.trim() || !data.contractEnd) {
    throw new Error('Partner name, type, and contract end date are required.');
  }

  const newPartner = {
    id: `P${String(Date.now()).slice(-4)}`,
    name: data.name.trim(),
    type: data.type.trim(),
    contractEnd: data.contractEnd,
    status: data.status,
  };
  mockPartnerships.push(newPartner);
  return newPartner;
}