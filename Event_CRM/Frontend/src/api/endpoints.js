export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const GEO_BASE =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson";

export const GEO_URLS = {
  india: `${GEO_BASE}/india.geojson`,
  state: (slug) => `${GEO_BASE}/states/${slug}.geojson`,
};

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    googleRedirect: "/oauth2/authorization/google",
    me: "/auth/me",
    logout: "/auth/logout",
    sendOtp: "/auth/forgot-password/send-otp",
    verifyOtp: "/auth/forgot-password/verify-otp",
    resetPassword: "/auth/forgot-password/reset",
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
  events: {
    locations: "/events/locations",
    list: "/events",
    detail: (id) => `/events/${id}`,
    status: (id) => `/events/${id}/status`,
  },
  venues: {
    list: "/venues",
    detail: (id) => `/venues/${id}`,
    zones: (id) => `/venues/${id}/zones`,
    zone: (id, zoneId) => `/venues/${id}/zones/${zoneId}`,
  },
  ticketing: {
    tiers: "/ticketing/tiers",
    tier: (id) => `/ticketing/tiers/${id}`,
    tierStatus: (id) => `/ticketing/tiers/${id}/status`,
    promos: "/ticketing/promos",
    promo: (id) => `/ticketing/promos/${id}`,
    promoStatus: (id) => `/ticketing/promos/${id}/status`,
  },
  sponsors: {
    list: "/sponsors",
    detail: (id) => `/sponsors/${id}`,
    deliverables: (id) => `/sponsors/${id}/deliverables`,
    deliverable: (id, deliverableId) =>
      `/sponsors/${id}/deliverables/${deliverableId}`,
  },
};
