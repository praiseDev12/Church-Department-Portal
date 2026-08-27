import { apiFetch } from '../lib/api.js';

export async function getMembers({ search = '', status = '' } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  if (status) {
    params.set('status', status);
  }

  const query = params.toString();

  return apiFetch(`/dashboard/members${query ? `?${query}` : ''}`);
}
