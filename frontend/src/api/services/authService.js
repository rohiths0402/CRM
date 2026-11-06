import { http } from "../httpClient";
import { BASE_URL, ENDPOINTS, USE_MOCK } from "../endpoints";
import { getToken } from "../../utils/storage";
import { MOCK_OTP, mockDelay, mockUsers } from "../../mocks/mockData";

const TOKEN_PREFIX = "mock-token-";

const withoutPassword = ({ password, ...user }) => user;

const buildSession = (user) => ({
  token: `${TOKEN_PREFIX}${user.id}`,
  user: withoutPassword(user),
});

const cleanIdentifier = (value) =>
  value.trim().toLowerCase().replace(/\s/g, "");

const findByIdentifier = (value) => {
  const identifier = cleanIdentifier(value);
  return mockUsers.find(
    (user) => user.email === identifier || user.phone === identifier,
  );
};

const login = async ({ email, password, rememberMe }) => {
  if (!USE_MOCK) {
    return http.post(ENDPOINTS.auth.login, { email, password, rememberMe });
  }
  await mockDelay();
  const user = mockUsers.find(
    (item) =>
      item.email === cleanIdentifier(email) && item.password === password,
  );
  if (!user) throw new Error("Invalid email or password");
  return buildSession(user);
};

const loginAsRole = async (role) => {
  await mockDelay(500);
  return buildSession(mockUsers.find((user) => user.role === role));
};

const googleLogin = async () => {
  if (!USE_MOCK) {
    window.location.href = `${BASE_URL}${ENDPOINTS.auth.googleRedirect}`;
    return null;
  }
  await mockDelay();
  return buildSession(mockUsers[0]);
};

const getCurrentUser = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.auth.me);
  await mockDelay(300);
  const id = Number(getToken()?.replace(TOKEN_PREFIX, ""));
  const user = mockUsers.find((item) => item.id === id);
  if (!user) throw new Error("Session expired");
  return withoutPassword(user);
};

const logout = async () => {
  if (!USE_MOCK) return http.post(ENDPOINTS.auth.logout);
  return { message: "Signed out" };
};

const sendOtp = async ({ method, identifier }) => {
  if (!USE_MOCK)
    return http.post(ENDPOINTS.auth.sendOtp, { method, identifier });
  await mockDelay();
  const user = findByIdentifier(identifier);
  const matches =
    method === "email"
      ? user?.email === cleanIdentifier(identifier)
      : user?.phone === cleanIdentifier(identifier);
  if (!user || !matches) throw new Error("No account found with these details");
  return { message: "OTP sent" };
};

const verifyOtp = async ({ identifier, otp }) => {
  if (!USE_MOCK)
    return http.post(ENDPOINTS.auth.verifyOtp, { identifier, otp });
  await mockDelay(500);
  if (otp !== MOCK_OTP) throw new Error("Incorrect or expired code");
  return { resetToken: "mock-reset-token" };
};

const resetPassword = async ({ identifier, resetToken, newPassword }) => {
  if (!USE_MOCK) {
    return http.post(ENDPOINTS.auth.resetPassword, {
      identifier,
      resetToken,
      newPassword,
    });
  }
  await mockDelay();
  const user = findByIdentifier(identifier);
  if (!user) throw new Error("No account found with these details");
  user.password = newPassword;
  return { message: "Password updated" };
};

export const authService = {
  login,
  loginAsRole,
  googleLogin,
  getCurrentUser,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
};
