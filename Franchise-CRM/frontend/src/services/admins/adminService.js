import { request } from '../../api/httpClient';
import { ROLES } from '../../config/navigation';
import { mockUsers, mockFranchises, mockAdmins } from '../../mocks';
import { USE_MOCK, delay } from '../shared';

export async function getAdmins(user) {
  if (!USE_MOCK) return request('/admins');
  await delay(200);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    throw new Error('Only Super Admin can view the admin list');
  }
  return mockAdmins;
}

export async function createAdmin(user, data) {
  if (!USE_MOCK) return request('/admins', { method: 'POST', body: data });
  await delay(400);

  if (user?.role !== ROLES.SUPER_ADMIN) {
    throw new Error('Only Super Admin can create admins');
  }

  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();

  if (!name || !email) throw new Error('Name and email are required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Email format is invalid');

  const emailTaken =
    mockAdmins.some((a) => a.email === email) ||
    mockUsers.some((u) => u.email === email);
  if (emailTaken) throw new Error('This email is already in use');

  if (!data.franchiseIds?.length) {
    throw new Error('Select at least one franchise');
  }

  const selected = mockFranchises.filter((f) => data.franchiseIds.includes(f.id));

  selected.forEach((f) => {
    f.assignedTo = email;
  });

  const newAdmin = {
    id: `A${String(Date.now()).slice(-4)}`,
    name,
    email,
    role: 'Admin',
    scope: selected.map((f) => f.name).join(', '),
    status: data.status,
  };

  mockAdmins.push(newAdmin);
  return newAdmin;
}