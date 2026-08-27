import { loadSession } from './session.js';
import { loadMemberSession } from './memberSession.js';
import { backendUrl } from '../context/AuthContext.jsx';

async function request(path, options, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(backendUrl + `/api${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// For admin-facing pages (dashboard, members, units, reports...)
export function apiFetch(path, options = {}) {
  const session = loadSession();
  return request(path, options, session?.token);
}

// For member-facing pages (registration, member login, check-in...)
export function memberApiFetch(path, options = {}) {
  const session = loadMemberSession();
  return request(path, options, session?.token);
}
