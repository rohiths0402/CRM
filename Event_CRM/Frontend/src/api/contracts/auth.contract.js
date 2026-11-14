export const authContract = {
  login: {
    method: "POST",
    url: "/auth/login",
    request: {
      email: "string",
      password: "string",
      rememberMe: "boolean",
    },
    response: {
      token: "string",
      user: {
        id: "number",
        name: "string",
        email: "string",
        phone: "string",
        role: "SUPER_ADMIN | ADMIN | EMPLOYEE | OPS_LEAD | SPONSOR_MGR | GATE_STAFF",
        employeeId: "string",
      },
    },
    errors: {
      401: "Invalid email or password",
    },
  },

  googleLogin: {
    method: "GET",
    url: "/oauth2/authorization/google",
    note: "Browser redirect. Backend completes Google OAuth and redirects back to the frontend with the session cookie set.",
  },

  currentUser: {
    method: "GET",
    url: "/auth/me",
    headers: { Authorization: "Bearer <token>" },
    response: {
      id: "number",
      name: "string",
      email: "string",
      phone: "string",
      role: "SUPER_ADMIN | ADMIN | EMPLOYEE | OPS_LEAD | SPONSOR_MGR | GATE_STAFF",
      employeeId: "string",
    },
    errors: {
      401: "Session expired",
    },
  },

  logout: {
    method: "POST",
    url: "/auth/logout",
    response: { message: "string" },
  },

  sendOtp: {
    method: "POST",
    url: "/auth/forgot-password/send-otp",
    request: {
      method: "email | mobile",
      identifier: "string",
    },
    response: { message: "string" },
    errors: {
      404: "No account found with these details",
    },
  },

  verifyOtp: {
    method: "POST",
    url: "/auth/forgot-password/verify-otp",
    request: {
      identifier: "string",
      otp: "string (6 digits)",
    },
    response: { resetToken: "string" },
    errors: {
      400: "Incorrect or expired code",
    },
  },

  resetPassword: {
    method: "POST",
    url: "/auth/forgot-password/reset",
    request: {
      identifier: "string",
      resetToken: "string",
      newPassword: "string (min 8 characters)",
    },
    response: { message: "string" },
  },
};
