const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

async function request(endpoint, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to connect to the server. Check your backend and network.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong.");
  }

  return data;
}

export const authService = {
  /**
   * Body: { email, password, rememberMe }
   * Response: { message, token, tokenType, expiresIn, user }
   * The token is kept in sessionStorage, where api.js reads it.
   */
  login: async (payload) => {
    const result = await request("/auth/login", payload);

    if (result.token) {
      sessionStorage.setItem(TOKEN_KEY, result.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(result.user || null));
    }

    return result;
  },

  register: (payload) => request("/auth/register", payload),

  /** Always answers with the same message, whether or not the email is registered. */
  forgotPassword: (email) => request("/auth/forgot-password", { email }),

  verifyOtp: (payload) => request("/auth/verify-otp", payload),

  /** Body: { email, otp, password } */
  resetPassword: (payload) => request("/auth/reset-password", payload),

  /**
   * Re-reads the signed-in user, so access changes made by the admin show
   * without signing in again. Throws if the session is no longer valid.
   */
  refreshUser: async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    let response;

    try {
      response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
    } catch {
      // Offline: keep using the stored user.
      return authService.getUser();
    }

    if (response.status === 401) {
      authService.logout();
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      return authService.getUser();
    }

    const user = await response.json();
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isAuthenticated: () => Boolean(sessionStorage.getItem(TOKEN_KEY)),

  getUser: () => {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  },
};
