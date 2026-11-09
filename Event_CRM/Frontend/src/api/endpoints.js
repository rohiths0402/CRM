export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

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
};
