const STORAGE_KEY = "loop_system_settings";

export const DEFAULT_SYSTEM_SETTINGS = {
  organizationName: "LOOP Event CRM",
  supportEmail: "",
  supportPhone: "",
  defaultCity: "Chennai",
  currency: "INR",
  timezone: "Asia/Kolkata",
  notifications: {
    proposals: true,
    gateAlerts: true,
    weeklySummary: false,
  },
};

export const getSystemSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...DEFAULT_SYSTEM_SETTINGS, notifications: { ...DEFAULT_SYSTEM_SETTINGS.notifications } };

  const parsed = JSON.parse(saved);
  return {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...parsed,
    notifications: {
      ...DEFAULT_SYSTEM_SETTINGS.notifications,
      ...parsed.notifications,
    },
  };
};

export const saveSystemSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const resetSystemSettings = () => {
  localStorage.removeItem(STORAGE_KEY);
};
