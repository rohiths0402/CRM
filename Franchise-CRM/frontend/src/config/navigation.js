export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PARTNER: 'partner',
};

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: '◎', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  { to: '/franchises', label: 'Franchises', icon: '⌂', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  { to: '/events', label: 'Events', icon: '◷', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  { to: '/event-requests', label: 'Requests', icon: '✉', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PARTNER] },
  { to: '/partnerships', label: 'Partnerships', icon: '⚭', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  { to: '/admins', label: 'Admins', icon: '◉', roles: [ROLES.SUPER_ADMIN] },
  { to: '/settings', label: 'Settings', icon: '⚙', roles: [ROLES.SUPER_ADMIN] },
];

export function getNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

// Default home route based on user role after login or on invalid route access
export function getHomeForRole(role) {
  return role === ROLES.PARTNER ? '/event-requests' : '/dashboard';
}