export const ROLES = {
  ADMIN: "ADMIN",
  OPS_LEAD: "OPS_LEAD",
  SPONSOR_MGR: "SPONSOR_MGR",
  GATE_STAFF: "GATE_STAFF",
};

export const ROLE_LABELS = {
  ADMIN: "Event Director",
  OPS_LEAD: "Operations Manager",
  SPONSOR_MGR: "Sponsorship Lead",
  GATE_STAFF: "Gate Marshal",
};

export const ROLE_ACCESS = {
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
    "settings",
    "profile",
  ],
  OPS_LEAD: ["dashboard", "events", "venues", "artists", "crew", "profile"],
  SPONSOR_MGR: ["dashboard", "sponsors", "ticketing", "proposals", "profile"],
  GATE_STAFF: ["dashboard", "gate", "profile"],
};
