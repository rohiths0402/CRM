const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // Include httpOnly cookies set by backend automatically in requests
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}