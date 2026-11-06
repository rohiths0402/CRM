const COOKIE_NAME = 'auth_user';
const SESSION_KEY = 'auth_session';
const REMEMBER_DAYS = 30;
const IDLE_LIMIT_MS = 30 * 1000; // 30 seconds

// ---------- Remember me (cookie, 30 days) ----------

export function saveRememberCookie(user) {
  const maxAge = REMEMBER_DAYS * 24 * 60 * 60; // seconds
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(user.email)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function getRememberCookie() {
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  return match ? { email: decodeURIComponent(match[2]) } : null;
}

export function clearRememberCookie() {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
}

// ---------- Remember me illa (sessionStorage) ----------

export function saveSessionUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, leftAt: null }));
}

// Idle time 30 seconds-ku mela aagirundha null return pannum
export function getSessionUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const { user, leftAt } = JSON.parse(raw);

  if (leftAt && Date.now() - leftAt > IDLE_LIMIT_MS) {
    clearSessionUser();
    return null;
  }
  return user;
}

// Page/tab-ah vittu poga poga time-ah save pannum
export function setSessionLeftAt(value) {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return;

  const data = JSON.parse(raw);
  data.leftAt = value; // Date.now() or null
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearSessionUser() {
  sessionStorage.removeItem(SESSION_KEY);
}