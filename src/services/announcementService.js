import { apiFetch } from '../lib/api.js';

export async function getAnnouncements() {
  return apiFetch('/announcements');
}

export async function getAdminAnnouncements() {
  return apiFetch('/announcements/admin');
}

export async function createAnnouncement(payload) {
  return apiFetch('/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteAnnouncement(id) {
  return apiFetch(`/announcements/${id}`, {
    method: 'DELETE',
  });
}
