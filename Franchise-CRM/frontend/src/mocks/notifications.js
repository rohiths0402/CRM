import { ROLES } from '../config/navigation';

export const mockNotifications = [
  {
    id: 1,
    text: 'Madurai Branch franchise approval pending',
    time: '10 min ago',
    roles: [ROLES.SUPER_ADMIN],
    unread: true,
  },
  {
    id: 2,
    text: 'Store Launch event tomorrow at Chennai Central',
    time: '1 hour ago',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    unread: true,
  },
  {
    id: 3,
    text: 'Staff Training moved to 15 Nov',
    time: 'Yesterday',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    unread: false,
  },
];