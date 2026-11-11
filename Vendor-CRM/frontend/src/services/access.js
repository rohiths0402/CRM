/**
 * Which parts of the CRM a login can use. The backend enforces the same rules;
 * these only decide what the UI shows.
 *
 * access: "ALL" (both CRMs), "PRODUCTION" or "VENDOR". Accounts from before
 * access levels existed have no value, which means ALL.
 */
export const ACCESS_OPTIONS = [
  { value: "ALL", label: "Production + Vendor CRM" },
  { value: "PRODUCTION", label: "Production CRM only" },
  { value: "VENDOR", label: "Vendor CRM only" },
];

export function accessOf(user) {
  return user?.access || "ALL";
}

export function canUseProduction(user) {
  return accessOf(user) !== "VENDOR";
}

export function canUseVendor(user) {
  return accessOf(user) !== "PRODUCTION";
}

/** The workspace admin (the account that signed up) manages users. */
export function isAdmin(user) {
  return user?.admin !== false;
}

/** "production", "vendor" or "users", from the URL. */
export function sectionOf(pathname) {
  if (pathname === "/vendor" || pathname.startsWith("/vendor/")) return "vendor";
  if (pathname === "/users" || pathname.startsWith("/users/")) return "users";
  return "production";
}

export function canOpen(user, section) {
  if (section === "vendor") return canUseVendor(user);
  if (section === "users") return isAdmin(user);
  return canUseProduction(user);
}

/** Where a login lands after signing in. */
export function homePath(user) {
  return canUseProduction(user) ? "/" : "/vendor";
}
