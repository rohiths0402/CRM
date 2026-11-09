export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
};

export const ROLE_ACCESS = {
  SUPER_ADMIN: [
    "dashboard",
    "events",
    "venues",
    "ticketing",
    "sponsors",
    "artists",
    "gate",
    "proposals",
    "financials",
    "crew",
    "settings",
    "profile",
  ],
  ADMIN: [
    "dashboard",
    "events",
    "venues",
    "ticketing",
    "sponsors",
    "artists",
    "gate",
    "proposals",
    "financials",
    "crew",
    "profile",
  ],
  EMPLOYEE: ["dashboard", "gate", "profile"],
};