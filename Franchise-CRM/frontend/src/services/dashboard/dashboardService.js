import { request } from '../../api/httpClient';
import { ROLES } from '../../config/navigation';
import { mockPartnerships, mockAdmins } from '../../mocks';
import { USE_MOCK, delay, franchisesFor, eventsFor } from '../shared';

export async function getDashboard(user) {
  if (!USE_MOCK) return request('/dashboard');
  await delay();

  const franchises = franchisesFor(user);
  const events = eventsFor(user);
  const pending = franchises.filter((f) => f.status === 'Pending').length;

  if (user?.role === ROLES.SUPER_ADMIN) {
    return {
      stats: [
        { label: 'Total Franchises', value: franchises.length, hint: `${pending} pending` },
        { label: 'Active Events', value: events.length, hint: `${events.filter((e) => e.status === 'Confirmed').length} confirmed` },
        { label: 'Partnerships', value: mockPartnerships.length, hint: `${mockPartnerships.filter((p) => p.status === 'Renewal').length} renewal pending` },
        { label: 'Pending Approvals', value: pending, hint: 'Needs your review' },
      ],
      franchises,
      events,
      admins: mockAdmins,
    };
  }

  return {
    stats: [
      { label: 'My Franchises', value: franchises.length, hint: 'Assigned to you' },
      { label: 'Upcoming Events', value: events.length, hint: 'Next 14 days' },
      { label: 'Partnerships', value: mockPartnerships.length, hint: 'View only' },
    ],
    franchises,
    events,
  };
}