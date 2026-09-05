import { loadSession } from './session.js';
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

// One session for everyone now — member, unit_admin, main_admin.
export function apiFetch(path, options = {}) {
  const session = loadSession();
  return request(path, options, session?.token);
}

// For multipart uploads (photos) — no Content-Type override, since the
// browser needs to set its own multipart boundary for FormData.
export async function apiUpload(path, formData, options = {}) {
  const session = loadSession();
  const headers = {
    ...(options.headers || {}),
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };

  const res = await fetch(backendUrl + `/api${path}`, {
    method: 'PATCH',
    ...options,
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function apiDownload(path, options = {}) {
  const session = loadSession();

  const headers = {
    ...(options.headers || {}),
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };

  const res = await fetch(backendUrl + `/api${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(body.message || `Request failed with status ${res.status}`);
  }

  return res.blob();
}
