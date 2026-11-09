const COOKIE_NAME = 'auth_user';
const SESSION_KEY = 'auth_session';
const REMEMBER_DAYS = 30;
const IDLE_LIMIT_MS = 30 * 1000; // 30 seconds

// Reject sessions without a role or essential properties
function isValidUser(user) {
  return Boolean(user && user.email && user.role);
}

// ---------- Remember me (cookie, 30 days) ----------

export function saveRememberCookie(user) {
  const maxAge = REMEMBER_DAYS * 24 * 60 * 60;
  const value = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function getRememberCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;

  try {
    const user = JSON.parse(decodeURIComponent(match[1]));
    if (isValidUser(user)) return user;
    clearRememberCookie();
    return null;
  } catch {
    return null;
  }
}

export function clearRememberCookie() {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
}

// ---------- Standard session (sessionStorage with 30s idle limit) ----------

export function saveSessionUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, leftAt: null }));
}

export function getSessionUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const { user, leftAt } = JSON.parse(raw);

  if (!isValidUser(user)) {
    clearSessionUser();
    return null;
  }

  if (leftAt && Date.now() - leftAt > IDLE_LIMIT_MS) {
    clearSessionUser();
    return null;
  }
  return user;
}

// Record timestamp when page / tab loses focus
export function setSessionLeftAt(value) {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return;

  const data = JSON.parse(raw);
  data.leftAt = value;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearSessionUser() {
  sessionStorage.removeItem(SESSION_KEY);
}