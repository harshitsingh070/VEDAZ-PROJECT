import { API_BASE_URL } from '../config';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (error) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || `Request failed with status ${response.status}`);
  }

  return body.data;
}

export function login(username) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function fetchMessages() {
  return request('/api/messages');
}

export function sendMessage(payload) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
