import { apiFetch } from '../lib/api.js';

export function getMembers({ search = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  params.set('page', page);
  params.set('limit', limit);

  const query = params.toString();

  return apiFetch(`/members?${query}`);
}

export function getMember(memberId) {
  return apiFetch(`/members/${memberId}`);
}

export function updateMember(memberId, data) {
  return apiFetch(`/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changeMemberStatus(memberId, status) {
  return apiFetch(`/members/${memberId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function changeMemberUnit(memberId, unitId, note = '') {
  return apiFetch(`/members/${memberId}/unit`, {
    method: 'PATCH',
    body: JSON.stringify({
      unitId,
      note,
    }),
  });
}

export function deleteMember(memberId) {
  return apiFetch(`/members/${memberId}`, {
    method: 'DELETE',
  });
}

export function updateOwnProfile(data) {
  return apiFetch('/members/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getOwnProfile() {
  return apiFetch('/members/me');
}
