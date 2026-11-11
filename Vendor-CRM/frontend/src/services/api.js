const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

function getAuthHeaders() {
  const headers = {};

  const token = sessionStorage.getItem("authToken");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
  } = options;

  const requestHeaders = {
    ...getAuthHeaders(),
    ...headers,
  };

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      credentials: "include",
      signal,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to connect to the server. Check your backend and network."
    );
  }

  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => "");
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? data.message || data.error
        : typeof data === "string" && data.trim()
          ? data
          : null;

    if (response.status === 401) {
      throw new Error(message || "Session expired. Please sign in again.");
    }

    if (response.status === 403) {
      throw new Error(message || "You do not have permission to perform this action.");
    }

    throw new Error(
      message || `API request failed with status ${response.status}.`
    );
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PUT", body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PATCH", body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "DELETE" }),
};

export default api;