const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Unified API client for frontend.
 * Handles auth token, envelope parsing, errors.
 */
async function apiRequest(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('av_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  // Envelope format: { status, data, message, errors? }
  if (data.status === 'error') {
    const error = new Error(data.message || 'Something went wrong');
    error.errors = data.errors || null;
    error.statusCode = res.status;
    throw error;
  }

  return data.data;
}

export const api = {
  get:  (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put:  (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  del:  (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
